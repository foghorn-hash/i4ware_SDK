<template>
  <div v-if="isLoading && roles.length === 0" class="loading-screen">
    <img :src="loadingSpinner" alt="Loading..." />
  </div>

  <template v-else>
    <div class="my-5">
      <button class="btn btn-primary" @click="router.push('/manage-roles/add')">
        {{ t('add') }}
      </button>
    </div>

    <div class="mt-3">
      <div class="table-header-roles">
        <div class="column-actions-roles">#</div>
        <div class="column-actions-roles">{{ t('rolename') }}</div>
        <div class="column-actions-roles">{{ t('domain') }}</div>
        <div class="column-actions-roles"></div>
      </div>

      <div class="table-body-roles">
        <div v-if="isLoading" class="loading-screen">
          <img :src="loadingSpinner" alt="Loading..." />
        </div>
        <div v-else-if="roles.length === 0" class="text-center py-4 text-muted">
          {{ t('noRolesFound') }}
        </div>
        <template v-else>
          <div v-for="(role, index) in roles" :key="role.id" class="mobile-table-body-roles">
            <div class="mobile-table-header-roles">
              <div class="column-actions-roles">#</div>
              <div class="column-actions-roles">{{ t('rolename') }}</div>
              <div class="column-actions-roles">{{ t('domain') }}</div>
              <div class="column-actions-roles"></div>
            </div>
            <div class="table-row-roles">
              <div class="column-actions-roles">{{ (page - 1) * ROLES_PER_PAGE + index + 1 }}</div>
              <div class="column-actions-roles">{{ role.name }}</div>
              <div class="column-actions-roles">{{ role.domain }}</div>
              <div class="column-actions-roles">
                <button class="btn btn-info btn-sm"
                  @click="router.push({ path: '/manage-roles/edit', state: { item: role, from: 'edit' } })">
                  {{ t('edit') }}
                </button>
                <button class="btn btn-danger btn-sm mx-2" @click="removeItem(role)">
                  {{ t('remove') }}
                </button>
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
import loadingSpinner from '../assets/tube-spinner.svg';

const router = useRouter();
const { t } = useI18n();

const ROLES_PER_PAGE = 50;

const roles = ref([]);
const total = ref(0);
const page = ref(1);
const isLoading = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / ROLES_PER_PAGE)));

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const fetchRoles = async (pageNum = page.value) => {
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/manage/roles?page=${pageNum}&per_page=${ROLES_PER_PAGE}`,
      { headers: authHeaders() }
    );
    const data = res.data;
    if (Array.isArray(data)) {
      roles.value = data;
      total.value = data.length < ROLES_PER_PAGE
        ? (pageNum - 1) * ROLES_PER_PAGE + data.length
        : pageNum * ROLES_PER_PAGE + 1;
    } else {
      roles.value = data.data ?? [];
      total.value = data.total ?? 0;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const removeItem = async (role) => {
  try {
    await axios.get(`${API_BASE_URL}/api/manage/role/${role.id}`, { headers: authHeaders() });
    fetchRoles();
  } catch (err) {
    console.error(err);
  }
};

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) page.value = newPage;
};

watch(page, () => fetchRoles());
onMounted(() => fetchRoles());
</script>