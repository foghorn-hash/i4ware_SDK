<template>
  <div style="margin-top: 2em">
    <h3 class="my-2">{{ editRole ? t('editRole') : t('addRole') }}</h3>

    <div class="my-2">
      <form class="row g-3 mt-5" @submit.prevent="handleSubmit">

        <div class="col-12">
          <div class="col-4">
            <label>{{ t('roleName') }}</label>
            <input v-model="form.name" type="text" class="form-control"
              :class="{ 'is-invalid': errors.name }" />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>
        </div>

        <div class="col-12" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; width:100%">
          <h5 class="col-span-2">{{ t('permission') }}</h5>
          <div v-for="permission in permissions" :key="permission.id" class="col-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`permission_${permission.id}`"
                :value="permission.id"
                :checked="selectedPermissions.includes(permission.id)"
                @change="togglePermission(permission.id, $event.target.checked)"
              />
              <label class="form-check-label noselect" :for="`permission_${permission.id}`">
                {{ permission.permission_name }}<br />
                ({{ permission.domain ?? t('allDomains') }})
              </label>
            </div>
          </div>
        </div>

        <div class="col-12" style="margin-bottom:50px">
          <button type="submit" class="btn btn-primary">{{ t('save') }}</button>
          <button type="button" class="btn btn-secondary" style="margin-left:100px"
            @click="router.push('/manage-roles')">
            Back
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const router = useRouter();
const { t } = useI18n();

const locationState = history.state ?? {};
const editRole = ref(locationState.from === 'edit' ? locationState.item : null);

const form = reactive({
  name: editRole.value?.name ?? '',
});
const errors = reactive({});
const permissions = ref([]);
const selectedPermissions = ref([]);

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const schema = Yup.object().shape({
  name: Yup.string().required(t('required')),
});

onMounted(async () => {
  try {
    const params = editRole.value ? { params: { roleId: editRole.value.id } } : {};
    const res = await axios.get(
      `${API_BASE_URL}/api/manage/permissions`,
      { ...params, headers: authHeaders() }
    );
    permissions.value = res.data.data;
    if (res.data.allowedPermissions) {
      selectedPermissions.value = res.data.allowedPermissions.map((el) => el.permission_id);
    }
  } catch (err) {
    console.error(err);
  }
});

const togglePermission = (id, checked) => {
  if (checked) {
    selectedPermissions.value = [...selectedPermissions.value, id];
  } else {
    selectedPermissions.value = selectedPermissions.value.filter((p) => p !== id);
  }
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    await schema.validate(form, { abortEarly: false });
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/manage/roles`,
      {
        name: form.name,
        isActive: 1,
        permissions: selectedPermissions.value,
        id: editRole.value?.id ?? null,
      },
      { headers: authHeaders() }
    );

    if (res.data.success === true) {
      router.push('/manage-roles');
    } else {
      for (const key in res.data.data) {
        if (Object.hasOwn(res.data.data, key)) {
          errors[key] = res.data.data[key][0];
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};
</script>