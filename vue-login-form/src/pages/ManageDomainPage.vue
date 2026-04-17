<template>
  <div v-if="isLoading && domains.length === 0" class="loading-screen">
    <img :src="loadingSpinner" alt="Loading..." />
  </div>

  <template v-else>
    <div class="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
      <input type="text" class="form-control" style="max-width:240px"
        :placeholder="t('searchByCompany')" v-model="searchCompany" />
      <input type="text" class="form-control" style="max-width:200px"
        :placeholder="t('searchByVatId')" v-model="searchVatId" />
      <button v-if="hasActiveSearch" class="btn btn-outline-secondary btn-sm" @click="clearSearch">
        {{ t('clearSearch') }}
      </button>
    </div>

    <div class="mt-2">
      <div class="table-header-domains">
        <div class="column_domains">#</div>
        <div class="column_domains">{{ t('domain') }}</div>
        <div class="column_domains">{{ t('validBeforeAt') }}</div>
        <div class="column_domains">{{ t('type') }}</div>
        <div class="column_domains">{{ t('company') }}</div>
        <div class="column_domains">{{ t('vatId') }}</div>
        <div class="column_domains"></div>
        <div class="column_domains"></div>
      </div>

      <div class="table-body-domains">
        <div v-if="isLoading" class="loading-screen">
          <img :src="loadingSpinner" alt="Loading..." />
        </div>
        <div v-else-if="domains.length === 0" class="text-center py-4 text-muted">
          {{ t('noDomainsFound') }}
        </div>
        <template v-else>
          <div v-for="(item, index) in domains" :key="item.id ?? index" class="mobile-table-body-domains">
            <div class="mobile-table-header-domains">
              <div class="column_domains">#</div>
              <div class="column_domains">{{ t('domain') }}</div>
              <div class="column_domains">{{ t('validBeforeAt') }}</div>
              <div class="column_domains">{{ t('type') }}</div>
              <div class="column_domains">{{ t('company') }}</div>
              <div class="column_domains">{{ t('vatId') }}</div>
              <div class="column_domains"></div>
              <div class="column_domains"></div>
            </div>
            <div class="table-row-domains">
              <div class="column_domains">{{ (page - 1) * DOMAINS_PER_PAGE + index + 1 }}</div>
              <div class="column_domains">{{ item.domain }}</div>
              <div class="column_domains">{{ item.valid_before_at }}</div>
              <div class="column_domains">
                <span v-if="item.type === 'paid'"        class="badge bg-success">{{ t('paid') }}</span>
                <span v-if="item.type === 'trial'"       class="badge bg-primary">{{ t('trial') }}</span>
                <span v-if="item.type === 'admin_domain'" class="badge bg-info">{{ t('admin') }}</span>
              </div>
              <div class="column_domains">{{ item.company_name }}</div>
              <div class="column_domains">{{ item.vat_id }}</div>

              <div class="column_domains">
                <button v-if="hasPermission('domain.edit').value"
                  class="btn btn-info btn-sm"
                  @click="router.push({ path: '/manage-domains/edit', state: { item, from: 'edit' } })">
                  {{ t('edit') }}
                </button>
              </div>

              <div class="column_domains">
                <div v-if="hasPermission('domain.actions').value" class="dropdown">
                  <button class="btn btn-success btn-sm dropdown-toggle"
                    @click="toggleMenu(index)">
                    {{ t('actions') }}
                  </button>
                  <ul class="dropdown-menu" :class="{ show: menuOpen[index] }">
                    <li><a class="dropdown-item" @click="domainAction(item.id, 'extend-trial')">{{ t('extendTrial30Days') }}</a></li>
                    <li><a class="dropdown-item" @click="domainAction(item.id, 'make-paid')">{{ t('makePaidSubscription') }}</a></li>
                    <li><a class="dropdown-item" @click="domainAction(item.id, 'down-to-trial')">{{ t('downgradeToTrial') }}</a></li>
                    <li><a class="dropdown-item" @click="domainAction(item.id, 'extend-one-year')">{{ t('extendTrialOneYear') }}</a></li>
                    <li><a class="dropdown-item" @click="domainAction(item.id, 'make-admin-domain')">{{ t('upgradeToAdmin') }}</a></li>
                    <li><a class="dropdown-item" style="background:#ffbfbf" @click="domainAction(item.id, 'terminate')">{{ t('terminateDomain') }}</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isLoading" class="d-flex justify-content-left align-items-center gap-3 mt-3">
        <button class="btn btn-outline-primary btn-sm" :disabled="page === 1" @click="handlePageChange(page - 1)">
          {{ t('previous') }}
        </button>
        <span>{{ t('page') }} {{ page }} / {{ totalPages }}</span>
        <button class="btn btn-outline-primary btn-sm" :disabled="page === totalPages" @click="handlePageChange(page + 1)">
          {{ t('next') }}
        </button>
      </div>

      <div class="spacer"></div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { usePermission } from '../composables/usePermission';
import loadingSpinner from '../assets/tube-spinner.svg';
import '../assets/css/ManageDomain.css';

const router = useRouter();
const { t } = useI18n();
const { hasPermission } = usePermission();

const DOMAINS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

const domains = ref([]);
const total = ref(0);
const page = ref(1);
const isLoading = ref(false);
const searchCompany = ref('');
const searchVatId = ref('');
const menuOpen = ref([]);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / DOMAINS_PER_PAGE)));
const hasActiveSearch = computed(() => searchCompany.value !== '' || searchVatId.value !== '');

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const fetchDomains = async (pageNum = page.value, company = searchCompany.value, vatId = searchVatId.value) => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({ page: pageNum, per_page: DOMAINS_PER_PAGE });
    if (company) params.append('company_name', company);
    if (vatId) params.append('vat_id', vatId);

    const res = await axios.get(
      `${API_BASE_URL}/api/manage/domains?${params}`,
      { headers: authHeaders() }
    );
    const data = res.data;
    if (Array.isArray(data)) {
      domains.value = data;
      total.value = data.length < DOMAINS_PER_PAGE
        ? (pageNum - 1) * DOMAINS_PER_PAGE + data.length
        : pageNum * DOMAINS_PER_PAGE + 1;
    } else {
      domains.value = data.data ?? [];
      total.value = data.total ?? 0;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const domainAction = async (id, action) => {
  closeAllMenus();
  try {
    await axios.post(
      `${API_BASE_URL}/api/manage/updateDomainRecord`,
      { id, action },
      { headers: authHeaders() }
    );
    fetchDomains();
  } catch (err) {
    console.error(err);
  }
};

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) page.value = newPage;
};
const clearSearch = () => { searchCompany.value = ''; searchVatId.value = ''; };
const toggleMenu = (index) => {
  menuOpen.value = menuOpen.value.map((v, i) => i === index ? !v : false);
};
const closeAllMenus = () => { menuOpen.value = []; };

let companyTimer, vatTimer;
watch(searchCompany, (val) => {
  clearTimeout(companyTimer);
  companyTimer = setTimeout(() => { page.value = 1; fetchDomains(1, val, searchVatId.value); }, SEARCH_DEBOUNCE_MS);
});
watch(searchVatId, (val) => {
  clearTimeout(vatTimer);
  vatTimer = setTimeout(() => { page.value = 1; fetchDomains(1, searchCompany.value, val); }, SEARCH_DEBOUNCE_MS);
});
watch(page, () => fetchDomains());

onMounted(() => fetchDomains());
</script>