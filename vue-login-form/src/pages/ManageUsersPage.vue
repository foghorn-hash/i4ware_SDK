<template>
  <div v-if="modalAddUser" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-3">
        <h1>{{ t('addUser') }}</h1>
        <form class="row" @submit.prevent="submitAddUser">
          <div class="col-12">
            <label>{{ t('fullName') }}</label>
            <input v-model="addForm.name" type="text" class="form-control"
              :class="{ 'is-invalid': addErrors.name }" :placeholder="t('fullName')" />
            <div class="invalid-feedback">{{ addErrors.name }}</div>
          </div>
          <div class="col-12 mt-2">
            <label>{{ t('gender') }}</label><br />
            <select v-model="addForm.gender" class="select-role form-select">
              <option value="male">{{ t('male') }}</option>
              <option value="female">{{ t('female') }}</option>
            </select>
          </div>
          <div class="col-12 mt-2">
            <label>{{ t('email') }}</label>
            <input v-model="addForm.email" type="email" class="form-control"
              :class="{ 'is-invalid': addErrors.email }" placeholder="Email" />
            <div class="invalid-feedback">{{ addErrors.email }}</div>
          </div>
          <div class="col-12 mt-2">
            <label>{{ t('role') }}</label><br />
            <select v-model="addForm.role" class="select-role form-select">
              <option value="NULL">{{ t('notAssigned') }}</option>
              <option v-for="role in rolesForUsers" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <div class="form-group mt-2 text-left">
            <label>{{ t('password') }}</label>
            <input v-model="addForm.password" type="password" class="form-control"
              :class="{ 'is-invalid': addErrors.password }" />
            <div class="invalid-feedback">{{ addErrors.password }}</div>
          </div>
          <div class="form-group mt-2 text-left">
            <label>{{ t('confirmPassword') }}</label>
            <input v-model="addForm.confirmPassword" type="password" class="form-control"
              :class="{ 'is-invalid': addErrors.confirmPassword }" />
            <div class="invalid-feedback">{{ addErrors.confirmPassword }}</div>
          </div>
          <div class="spacer"></div>
          <div class="d-flex justify-content-between mt-2">
            <button type="submit" class="btn btn-primary">{{ t('addUser') }}</button>
            <button type="button" class="btn btn-secondary" @click="modalAddUser = false">{{ t('close') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-if="modalApprovalId !== null" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-3">
        <h1>{{ t('areYouSure') }}</h1>
        <p>{{ t('wantToChangeUserStatus') }}</p>
        <div class="d-flex justify-content-between mt-2">
          <button class="btn btn-primary" @click="userStatusHandler">{{ t('yes') }}</button>
          <button class="btn btn-secondary" @click="modalApprovalId = null">{{ t('no') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="modalVerifyId !== null" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-3">
        <h1>{{ t('areYouSure') }}</h1>
        <p>{{ t('wantToVerifyUser') }}</p>
        <div class="d-flex justify-content-between mt-2">
          <button class="btn btn-primary" @click="userVerifyHandler">{{ t('yes') }}</button>
          <button class="btn btn-secondary" @click="modalVerifyId = null">{{ t('no') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="modalPasswordId !== null" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-3">
        <ChangePassword
          :user-id="modalPasswordId"
          @close="modalPasswordId = null"
          @submit="userPasswordHandler"
        />
      </div>
    </div>
  </div>

  <div v-if="modalChangeRole" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-3">
        <h1>{{ t('changeRole') }}</h1>
        <form class="row py-4" @submit.prevent="submitChangeRole">
          <div class="col-12">
            <select v-model="changeRoleId" class="form-control">
              <option value="NULL">{{ t('notAssigned') }}</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
          </div>
          <div class="spacer"></div>
          <div class="d-flex justify-content-between mt-2">
            <button type="submit" class="btn btn-primary">{{ t('submit') }}</button>
            <button type="button" class="btn btn-secondary" @click="modalChangeRole = false">{{ t('close') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-if="hasPermission('users.addUser').value" class="button-bar">
    <button class="btn btn-primary btn-sm" :disabled="!rolesForUsers.length" @click="modalAddUser = true">
      {{ t('addUser') }}
    </button>
  </div>

  <div class="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
    <input type="text" class="form-control" style="max-width:240px"
      :placeholder="t('searchByName')" v-model="searchName" />
    <input type="text" class="form-control" style="max-width:280px"
      :placeholder="t('searchByEmail')" v-model="searchEmail" />
    <button v-if="hasActiveSearch" class="btn btn-outline-secondary btn-sm" @click="clearSearch">
      {{ t('clearSearch') }}
    </button>
  </div>

  <div class="mt-2">
    <div class="table-header">
      <div class="column">#</div>
      <div class="column">ID</div>
      <div class="column">{{ t('avatar') }}</div>
      <div class="column">{{ t('columnName') }}</div>
      <div class="column">{{ t('columnVerified') }}</div>
      <div class="column">{{ t('email') }}</div>
      <div class="column">{{ t('role') }}</div>
      <div class="column">{{ t('columnDomain') }}</div>
      <div class="column">{{ t('columnStatus') }}</div>
      <div class="column">{{ t('columnActions') }}</div>
    </div>

    <div class="table-body">
      <div v-if="isLoading" class="loading-screen">
        <img :src="loadingSpinner" alt="Loading..." />
      </div>
      <div v-else-if="users.length === 0" class="text-center py-4 text-muted">
        {{ t('noUsersFound') }}
      </div>
      <template v-else>
        <div v-for="(item, index) in users" :key="item.id" class="mobile-table-body">
          <div class="mobile-table-header">
            <div class="column">#</div>
            <div class="column">ID</div>
            <div class="column">{{ t('avatar') }}</div>
            <div class="column">{{ t('columnName') }}</div>
            <div class="column">{{ t('columnVerified') }}</div>
            <div class="column">{{ t('email') }}</div>
            <div class="column">{{ t('role') }}</div>
            <div class="column">{{ t('columnDomain') }}</div>
            <div class="column">{{ t('columnStatus') }}</div>
            <div class="column">{{ t('columnActions') }}</div>
          </div>
          <div class="table-row">
            <div class="column">{{ (page - 1) * USERS_PER_PAGE + index + 1 }}</div>
            <div class="column">{{ item.id }}</div>
            <div class="column">
              <img class="max-height-profile-pic-manage-users"
                :src="getProfilePic(item)" :alt="`Profile of ${item.name}`" />
            </div>
            <div class="column">{{ item.name }}</div>
            <div class="column">{{ item.email_verified_at != null ? 'true' : 'false' }}</div>
            <div class="column">{{ item.email }}</div>
            <div class="column">{{ item.roles ?? 'not-assigned' }}</div>
            <div class="column">{{ item.domain }}</div>
            <div class="column">
              <div class="form-check form-switch d-flex justify-content-end">
                <input class="form-check-input" type="checkbox" :checked="item.is_active === 1" disabled />
              </div>
            </div>
            <div class="column">
              <div class="dropdown">
                <button class="btn btn-success btn-sm dropdown-toggle"
                  @click="toggleMenu(index)">
                  {{ t('actions') }}
                </button>
                <ul class="dropdown-menu" :class="{ show: menuOpen[index] }">
                  <li v-if="hasPermission('users.changePassword').value">
                    <a class="dropdown-item" @click="modalPasswordId = item.id; closeAllMenus()">
                      {{ t('changePassword') }}
                    </a>
                  </li>
                  <li v-if="hasPermission('users.changeRole').value">
                    <a class="dropdown-item" @click="openChangeRole(item.id)">
                      {{ t('changeRole') }}
                    </a>
                  </li>
                  <li v-if="hasPermission('users.statusChange').value">
                    <a class="dropdown-item" @click="modalApprovalId = item.id; closeAllMenus()">
                      {{ item.is_active === 1 ? t('deactivateUser') : t('activateUser') }}
                    </a>
                  </li>
                  <li v-if="hasPermission('users.verifyUser').value">
                    <a class="dropdown-item" @click="modalVerifyId = item.id; closeAllMenus()">
                      {{ t('verifyUser') }}
                    </a>
                  </li>
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

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { useAuthStore } from '../stores/auth';
import { usePermission } from '../composables/usePermission';
import ChangePassword from '../components/ChangePassword.vue';
import loadingSpinner from '../assets/tube-spinner.svg';
import DefaultMaleImage from '../assets/male-default-profile-picture.png';
import DefaultFemaleImage from '../assets/female-default-profile-picture.png';

const { t } = useI18n();
const authStore = useAuthStore();
const { hasPermission } = usePermission();

const USERS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

const users = ref([]);
const total = ref(0);
const page = ref(1);
const isLoading = ref(false);
const searchName = ref('');
const searchEmail = ref('');
const roles = ref([]);
const rolesForUsers = ref([]);
const menuOpen = ref([]);

const modalAddUser = ref(false);
const modalApprovalId = ref(null);
const modalVerifyId = ref(null);
const modalPasswordId = ref(null);
const modalChangeRole = ref(false);
const changeRoleUserId = ref(null);
const changeRoleId = ref('NULL');

const addForm = reactive({ name: '', gender: 'male', email: '', role: 'NULL', password: '', confirmPassword: '' });
const addErrors = reactive({});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / USERS_PER_PAGE)));
const hasActiveSearch = computed(() => searchName.value !== '' || searchEmail.value !== '');

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const getProfilePic = (item) => {
  if (item.profile_picture_path) {
    return API_BASE_URL + item.profile_picture_path.replaceAll('public/uploads', '/storage/uploads');
  }
  return item.gender === 'male' ? DefaultMaleImage : DefaultFemaleImage;
};

const fetchUsers = async (pageNum = page.value, name = searchName.value, email = searchEmail.value) => {
  try {
    isLoading.value = true;
    const params = new URLSearchParams({ page: pageNum, per_page: USERS_PER_PAGE });
    if (name) params.append('name', name);
    if (email) params.append('email', email);

    const response = await axios.get(
      `${API_BASE_URL}/api/manage/users?${params}`,
      { headers: authHeaders() }
    );

    const data = response.data;
    if (Array.isArray(data)) {
      users.value = data;
      total.value = data.length < USERS_PER_PAGE
        ? (pageNum - 1) * USERS_PER_PAGE + data.length
        : pageNum * USERS_PER_PAGE + 1;
    } else {
      users.value = data.data ?? [];
      total.value = data.total ?? 0;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const refreshUsers = () => fetchUsers();
const clearSearch = () => { searchName.value = ''; searchEmail.value = ''; };
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) page.value = newPage;
};

let nameTimer, emailTimer;
watch(searchName, (val) => {
  clearTimeout(nameTimer);
  nameTimer = setTimeout(() => { page.value = 1; fetchUsers(1, val, searchEmail.value); }, SEARCH_DEBOUNCE_MS);
});
watch(searchEmail, (val) => {
  clearTimeout(emailTimer);
  emailTimer = setTimeout(() => { page.value = 1; fetchUsers(1, searchName.value, val); }, SEARCH_DEBOUNCE_MS);
});
watch(page, () => fetchUsers());

const toggleMenu = (index) => {
  menuOpen.value = menuOpen.value.map((v, i) => i === index ? !v : false);
};
const closeAllMenus = () => { menuOpen.value = []; };

// Add user
const getAddSchema = () =>
  Yup.object().shape({
    name:            Yup.string().required(t('nameRequired')),
    email:           Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    password:        Yup.string().min(8, t('passwordMin')).required(t('passwordRequired')),
    confirmPassword: Yup.string()
                       .oneOf([Yup.ref('password'), null], t('passwordsMustMatch'))
                       .required(t('confirmPasswordRequired')),
  });

const submitAddUser = async () => {
  Object.keys(addErrors).forEach((k) => delete addErrors[k]);
  try {
    await getAddSchema().validate(addForm, { abortEarly: false });
  } catch (err) {
    err.inner.forEach((e) => { addErrors[e.path] = e.message; });
    return;
  }
  await axios.post(`${API_BASE_URL}/api/manage/users/add-user`, addForm, { headers: authHeaders() });
  modalAddUser.value = false;
  refreshUsers();
};

// Change role
const openChangeRole = (userId) => {
  changeRoleUserId.value = userId;
  modalChangeRole.value = true;
  closeAllMenus();
};
const submitChangeRole = async () => {
  await axios.post(`${API_BASE_URL}/api/manage/roles/setRole`,
    { roleId: changeRoleId.value, userid: changeRoleUserId.value },
    { headers: authHeaders() }
  );
  modalChangeRole.value = false;
  refreshUsers();
};

const userStatusHandler = async () => {
  await axios.post(`${API_BASE_URL}/api/manage/users/change-status`,
    { id: modalApprovalId.value }, { headers: authHeaders() });
  modalApprovalId.value = null;
  refreshUsers();
};
const userVerifyHandler = async () => {
  await axios.post(`${API_BASE_URL}/api/manage/users/verify`,
    { id: modalVerifyId.value }, { headers: authHeaders() });
  modalVerifyId.value = null;
  refreshUsers();
};
const userPasswordHandler = async (values) => {
  await axios.post(`${API_BASE_URL}/api/manage/users/change-password`,
    { id: modalPasswordId.value, ...values }, { headers: authHeaders() });
  modalPasswordId.value = null;
  refreshUsers();
};

onMounted(async () => {
  fetchUsers();
  try {
    const [rolesRes, rolesForAddRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/manage/roles/all`, { headers: authHeaders() }),
      axios.get(`${API_BASE_URL}/api/manage/roles/foradd`, { headers: authHeaders() }),
    ]);
    roles.value = rolesRes.data;
    rolesForUsers.value = rolesForAddRes.data;
  } catch (err) {
    console.error(err);
  }
});
</script>