<template>
  <div>
    <!-- Add Issue Modal -->
    <div v-if="showAddModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('addIssue') }}</h5>
            <button class="btn-close" @click="showAddModal = false" />
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-12 mt-2">
                <label class="form-label">{{ t('issueName') }}</label>
                <input
                  v-model="newIssue.issue_name"
                  class="form-control"
                  :class="{ 'is-invalid': addErrors.issue_name }"
                  :placeholder="t('issueNamePlaceholder')"
                />
                <div class="invalid-feedback">{{ addErrors.issue_name }}</div>
              </div>
              <div class="col-12 mt-2">
                <label class="form-label">{{ t('description') }}</label>
                <textarea
                  v-model="newIssue.description"
                  class="form-control"
                  rows="4"
                  :placeholder="t('descriptionPlaceholder')"
                />
              </div>
              <div class="col-12 mt-2">
                <label class="form-label">{{ t('assignTo') }}</label><br />
                <select v-model="newIssue.assigned_to" class="select-role">
                  <option value="">{{ t('unassigned') }}</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
              </div>
              <div v-if="addError" class="col-12 mt-2">
                <div class="alert alert-danger py-2">{{ addError }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" :disabled="isSubmitting" @click="handleAddIssue">
              {{ isSubmitting ? t('adding') : t('addIssue') }}
            </button>
            <button class="btn btn-secondary" @click="showAddModal = false; addError = ''">
              {{ t('close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAddModal" class="modal-backdrop fade show" @click="showAddModal = false" />

    <!-- Detail Modal -->
    <div v-if="detailIssue" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-body issue-detail-modal">
            <div class="idm-header">
              <div class="idm-header-left">
                <span class="idm-issue-id">#{{ String(detailIssue.id).padStart(4, '0') }}</span>
                <h2 class="idm-title">{{ detailIssue.issue_name }}</h2>
              </div>
              <span :class="`${statusBadgeClass(detailIssue.status)} idm-status-badge`">
                {{ statusLabel(detailIssue.status) }}
              </span>
            </div>

            <div class="idm-meta-row">
              <div class="idm-meta-item">
                <span class="idm-meta-label">{{ t('columnCreatedBy') }}</span>
                <div v-if="detailIssue.creator?.name" class="idm-user-chip">
                  <div class="idm-avatar">{{ initials(detailIssue.creator.name) }}</div>
                  <span>{{ detailIssue.creator.name }}</span>
                </div>
                <span v-else class="idm-muted">—</span>
              </div>
              <div class="idm-meta-item">
                <span class="idm-meta-label">{{ t('columnCreatedAt') }}</span>
                <span class="idm-meta-value">{{ fmtDate(detailIssue.created_at) }}</span>
              </div>
            </div>

            <div class="idm-divider" />

            <div class="idm-field">
              <label class="idm-field-label">{{ t('columnAssignedTo') }}</label>
              <select v-model="editAssignee" class="form-select form-select-sm idm-select">
                <option value="">{{ t('unassigned') }}</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>

            <div class="idm-field">
              <label class="idm-field-label">{{ t('description') }}</label>
              <textarea
                v-model="editDescription"
                class="form-control form-control-sm idm-textarea"
                rows="5"
                :placeholder="t('descriptionPlaceholder')"
              />
            </div>

            <div v-if="detailSaveError" class="alert alert-danger py-2 mt-2">{{ detailSaveError }}</div>
            <div v-if="detailSaveSuccess" class="alert alert-success py-2 mt-2">{{ t('save') }} ✓</div>

            <div class="idm-footer">
              <div class="idm-footer-left">
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" @click="detailDropdownOpen = !detailDropdownOpen">
                    {{ t('columnStatus') }}: {{ statusLabel(detailIssue.status) }}
                  </button>
                  <ul v-if="detailDropdownOpen" class="dropdown-menu show">
                    <li
                      v-for="s in STATUS_OPTIONS.filter(s => s.value !== detailIssue.status)"
                      :key="s.value"
                    >
                      <a class="dropdown-item" href="#" @click.prevent="openStatusConfirm(detailIssue, s.value); detailDropdownOpen = false">
                        {{ t('markAs') }} {{ s.label }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="idm-footer-right">
                <button class="btn btn-secondary btn-sm" @click="closeDetail">{{ t('close') }}</button>
                <button class="btn btn-primary btn-sm ms-2" :disabled="isSavingDetail" @click="handleSaveDetail">
                  {{ isSavingDetail ? '…' : t('save') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="detailIssue" class="modal-backdrop fade show" @click="closeDetail" />

    <!-- Status Confirm Modal -->
    <div v-if="confirmStatusId !== null" class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body">
            <h5>{{ t('areYouSure') }}</h5>
            <p>{{ t('changeStatusTo') }} <strong>{{ statusLabel(pendingStatus) }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="confirmStatusChange">{{ t('yes') }}</button>
            <button class="btn btn-secondary" @click="confirmStatusId = null; pendingStatus = null">{{ t('no') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="confirmStatusId !== null" class="modal-backdrop fade show" />

    <!-- Main content -->
    <div class="button-bar">
      <button class="btn btn-primary btn-sm" @click="addError = ''; showAddModal = true">
        {{ t('addIssue') }}
      </button>
    </div>

    <div class="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
      <input
        v-model="searchName"
        type="text"
        class="form-control"
        style="max-width: 260px"
        :placeholder="t('searchByIssueName')"
      />
      <button v-if="hasActiveSearch" class="btn btn-outline-secondary btn-sm" @click="searchName = ''">
        {{ t('clearSearch') }}
      </button>
    </div>

    <div class="mt-2">
      <div class="table-header-issues">
        <div class="column-issues">#</div>
        <div class="column-issues">{{ t('columnId') }}</div>
        <div class="column-issues">{{ t('columnIssueName') }}</div>
        <div class="column-issues">{{ t('columnStatus') }}</div>
        <div class="column-issues">{{ t('columnAssignedTo') }}</div>
        <div class="column-issues">{{ t('columnCreatedBy') }}</div>
        <div class="column-issues">{{ t('columnCreatedAt') }}</div>
        <div class="column-issues">{{ t('columnActions') }}</div>
      </div>

      <div class="table-body-issues">
        <div v-if="isLoading" class="loading-screen-issues">
          <img :src="loadingSpinner" :alt="t('loading')" />
        </div>
        <div v-else-if="issues.length === 0" class="text-center py-4 text-muted">
          {{ t('noIssuesFound') }}
        </div>
        <template v-else>
          <div v-for="(item, index) in issues" :key="item.id" class="mobile-table-body-issues">
            <div class="mobile-table-header-issues">
              <div>#</div>
              <div>{{ t('columnId') }}</div>
              <div>{{ t('columnIssueName') }}</div>
              <div>{{ t('columnStatus') }}</div>
              <div>{{ t('columnAssignedTo') }}</div>
              <div>{{ t('columnCreatedBy') }}</div>
              <div>{{ t('columnCreatedAt') }}</div>
              <div>{{ t('columnActions') }}</div>
            </div>

            <div class="table-row-issues" @click="openDetail(item)" :title="t('viewDetails')">
              <div class="column-issues">
                <span class="text-muted" style="font-size: 0.8rem">{{ (page - 1) * ISSUES_PER_PAGE + index + 1 }}</span>
              </div>
              <div class="column-issues">
                <span class="issue-id-cell">#{{ item.id }}</span>
              </div>
              <div class="column-issues">
                <span class="issue-name-cell">{{ item.issue_name }}</span>
              </div>
              <div class="column-issues">
                <span :class="statusBadgeClass(item.status)">{{ statusLabel(item.status) }}</span>
              </div>
              <div class="column-issues">
                <div v-if="item.assignee?.name" class="user-cell">
                  <div class="user-avatar">{{ initials(item.assignee.name) }}</div>
                  <span>{{ item.assignee.name }}</span>
                </div>
                <span v-else class="fst-italic" style="font-size: 0.82rem">{{ t('unassigned') }}</span>
              </div>
              <div class="column-issues">
                <div v-if="item.creator?.name" class="user-cell">
                  <div class="user-avatar">{{ initials(item.creator.name) }}</div>
                  <span>{{ item.creator.name }}</span>
                </div>
                <span v-else class="text-muted">—</span>
              </div>
              <div class="column-issues">
                <span style="font-size: 0.82rem; color: #dadddf">{{ fmtDate(item.created_at) }}</span>
              </div>
              <div class="column-issues" @click.stop>
                <div class="dropdown">
                  <button
                    class="btn btn-success btn-sm dropdown-toggle"
                    @click="toggleMenu(index)"
                  >
                    {{ t('actions') }}
                  </button>
                  <ul v-if="menuOpen[index]" class="dropdown-menu show">
                    <li><a class="dropdown-item" href="#" @click.prevent="openDetail(item); closeMenu(index)">{{ t('viewDetails') }}</a></li>
                    <li
                      v-for="s in STATUS_OPTIONS.filter(s => s.value !== item.status)"
                      :key="s.value"
                    >
                      <a class="dropdown-item" href="#" @click.prevent="openStatusConfirm(item, s.value); closeMenu(index)">
                        {{ t('markAs') }} {{ s.label }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!isLoading" class="d-flex justify-content-start align-items-center gap-3 mt-3">
        <button class="btn btn-outline-primary btn-sm" :disabled="page === 1" @click="handlePageChange(page - 1)">
          {{ t('previous') }}
        </button>
        <span class="text-muted" style="font-size: 0.88rem">{{ t('page') }} {{ page }} / {{ totalPages }}</span>
        <button class="btn btn-outline-primary btn-sm" :disabled="page === totalPages" @click="handlePageChange(page + 1)">
          {{ t('next') }}
        </button>
      </div>
      <div class="spacer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';
import '../assets/css/IssueTracker.css';

const { t, locale } = useI18n();

const ISSUES_PER_PAGE = 5;
const SEARCH_DEBOUNCE_MS = 350;

const STATUS_BADGE_CLASS = {
  todo: 'badge bg-primary',
  in_progress: 'badge bg-warning text-dark',
  done: 'badge bg-success',
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const STATUS_OPTIONS = computed(() => [
  { value: 'todo',        label: t('statusTodo') },
  { value: 'in_progress', label: t('statusInProgress') },
  { value: 'done',        label: t('statusDone') },
]);

const issues        = ref([]);
const users         = ref([]);
const total         = ref(0);
const page          = ref(1);
const isLoading     = ref(false);
const searchName    = ref('');
const debouncedName = ref('');

const showAddModal  = ref(false);
const addError      = ref('');
const addErrors     = reactive({ issue_name: '' });
const isSubmitting  = ref(false);
const newIssue      = reactive({ issue_name: '', description: '', assigned_to: '' });

const detailIssue        = ref(null);
const detailDropdownOpen = ref(false);
const confirmStatusId    = ref(null);
const pendingStatus      = ref(null);
const editAssignee       = ref('');
const editDescription    = ref('');
const isSavingDetail     = ref(false);
const detailSaveError    = ref('');
const detailSaveSuccess  = ref(false);
const menuOpen           = ref([]);

const totalPages     = computed(() => Math.max(1, Math.ceil(total.value / ISSUES_PER_PAGE)));
const hasActiveSearch = computed(() => debouncedName.value !== '');

// Debounce search
let debounceTimer = null;
watch(searchName, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedName.value = val.trim();
    page.value = 1;
  }, SEARCH_DEBOUNCE_MS);
});

watch([page, debouncedName], () => fetchIssues());

onMounted(async () => {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;

  await fetchIssues();

  try {
    const res = await axios.get(`${API_BASE_URL}/api/issue-tracker/users`, { headers: authHeaders() });
    if (res?.data) users.value = res.data;
  } catch (err) {
    console.error('fetchUsers:', err);
  }
});

const fetchIssues = async () => {
  try {
    isLoading.value = true;
    const params = new URLSearchParams({ page: page.value, per_page: ISSUES_PER_PAGE });
    if (debouncedName.value) params.append('name', debouncedName.value);
    const res = await axios.get(`${API_BASE_URL}/api/issue-tracker?${params}`, { headers: authHeaders() });
    const data = res.data;
    if (Array.isArray(data)) {
      issues.value = data;
      total.value = data.length < ISSUES_PER_PAGE
        ? (page.value - 1) * ISSUES_PER_PAGE + data.length
        : page.value * ISSUES_PER_PAGE + 1;
    } else {
      issues.value = data.data ?? [];
      total.value  = data.total ?? 0;
    }
  } catch (err) {
    console.error('fetchIssues:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleAddIssue = async () => {
  addErrors.issue_name = '';
  if (!newIssue.issue_name.trim()) {
    addErrors.issue_name = t('nameRequired');
    return;
  }
  isSubmitting.value = true;
  addError.value = '';
  try {
    const res = await axios.post(`${API_BASE_URL}/api/issue-tracker`, {
      issue_name:  newIssue.issue_name,
      description: newIssue.description || null,
      assigned_to: newIssue.assigned_to || null,
    }, { headers: authHeaders() });

    if (res.status === 201 || res.status === 200) {
      newIssue.issue_name  = '';
      newIssue.description = '';
      newIssue.assigned_to = '';
      showAddModal.value = false;
      await fetchIssues();
    }
  } catch (err) {
    addError.value = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create issue.';
  } finally {
    isSubmitting.value = false;
  }
};

const openDetail = (issue) => {
  detailIssue.value      = issue;
  editAssignee.value     = issue.assigned_to ?? '';
  editDescription.value  = issue.description ?? '';
  detailSaveError.value  = '';
  detailSaveSuccess.value = false;
  detailDropdownOpen.value = false;
};

const closeDetail = () => {
  detailIssue.value = null;
  detailSaveError.value = '';
  detailSaveSuccess.value = false;
};

const handleSaveDetail = async () => {
  isSavingDetail.value = true;
  detailSaveError.value = '';
  detailSaveSuccess.value = false;
  try {
    await axios.put(
      `${API_BASE_URL}/api/issue-tracker/${detailIssue.value.id}/assign`,
      { assigned_to: editAssignee.value || null },
      { headers: authHeaders() }
    );
    await axios.patch(
      `${API_BASE_URL}/api/issue-tracker/${detailIssue.value.id}`,
      { description: editDescription.value || null },
      { headers: authHeaders() }
    );
    detailSaveSuccess.value = true;
    await fetchIssues();
    const updatedAssignee = users.value.find(u => String(u.id) === String(editAssignee.value)) || null;
    detailIssue.value = {
      ...detailIssue.value,
      description:  editDescription.value || null,
      assigned_to:  editAssignee.value || null,
      assignee:     updatedAssignee,
    };
    setTimeout(() => { detailSaveSuccess.value = false; }, 2500);
  } catch (err) {
    detailSaveError.value = err?.response?.data?.message || 'Failed to save changes.';
  } finally {
    isSavingDetail.value = false;
  }
};

const openStatusConfirm = (issue, newStatus) => {
  confirmStatusId.value = issue.id;
  pendingStatus.value   = newStatus;
};

const confirmStatusChange = async () => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/issue-tracker/${confirmStatusId.value}/status`,
      { status: pendingStatus.value },
      { headers: authHeaders() }
    );
    confirmStatusId.value = null;
    pendingStatus.value   = null;
    await fetchIssues();
  } catch (err) {
    console.error('confirmStatusChange:', err);
  }
};

const toggleMenu  = (index) => { menuOpen.value[index] = !menuOpen.value[index]; };
const closeMenu   = (index) => { menuOpen.value[index] = false; };

const handlePageChange = (n) => {
  if (n >= 1 && n <= totalPages.value) page.value = n;
};

const statusBadgeClass = (status) => STATUS_BADGE_CLASS[status] || 'badge bg-secondary';
const statusLabel      = (v) => STATUS_OPTIONS.value.find(s => s.value === v)?.label || v;
const initials         = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
const fmtDate          = (dt) => dt
  ? new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
</script>