<template>
  <div class="mt-2">
    <div v-if="!setting" class="loading-screen">
      <img :src="loadingSpinner" alt="Loading..." />
    </div>

    <div v-else-if="canManageSettings" class="mt-5">
      <div v-if="message" class="alert alert-success">{{ message }}</div>

      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          id="defaultCheck1"
          v-model="setting.show_captcha"
          @change="settingUpdate('show_captcha', setting.show_captcha)"
        />
        <label class="form-check-label" for="defaultCheck1">
          {{ t('showCaptcha') }}
        </label>
        <br />

        <input
          class="form-check-input"
          type="checkbox"
          id="defaultCheck2"
          v-model="setting.disable_registeration_from_others"
          @change="settingUpdate('disable_registeration_from_others', setting.disable_registeration_from_others)"
        />
        <label class="form-check-label" for="defaultCheck2">
          {{ t('disableRegistration') }}
        </label>
        <br />

        <input
          class="form-check-input"
          type="checkbox"
          id="defaultCheck3"
          v-model="setting.disable_license_details"
          @change="settingUpdate('disable_license_details', setting.disable_license_details)"
        />
        <label class="form-check-label" for="defaultCheck3">
          {{ t('disableLicenseDetails') }}
        </label>
        <br />

        <input
          class="form-check-input"
          type="checkbox"
          id="defaultCheck4"
          v-model="setting.enable_netvisor"
          @change="settingUpdate('enable_netvisor', setting.enable_netvisor)"
        />
        <label class="form-check-label" for="defaultCheck4">
          {{ t('enableNetvisor') }}
        </label>
      </div>
      <br />

      <VerifyNetvisorButton
        :api-base-url="apiBaseUrl"
        :token="token"
        :enable-netvisor="setting.enable_netvisor"
      />
    </div>

    <div v-else class="mt-5">
      <div class="alert alert-danger">{{ t('noPermission') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { usePermission } from '../composables/usePermission';
import VerifyNetvisorButton from '../components/VerifyNetvisorButton.vue';
import loadingSpinner from '../assets/tube-spinner.svg';

const { t, locale } = useI18n();
const { hasPermission } = usePermission();

const canManageSettings = hasPermission('settings.manage');

const message = ref(null);
const apiBaseUrl = API_BASE_URL;
const token = localStorage.getItem(ACCESS_TOKEN_NAME);

const setting = ref({
  show_captcha: false,
  disable_registeration_from_others: false,
  disable_license_details: false,
  enable_netvisor: false,
});

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

onMounted(async () => {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/api/settings`, getAuthHeaders());
    if (res.status === 200 && Array.isArray(res.data?.data)) {
      for (const element of res.data.data) {
        setting.value[element.setting_key] = element.setting_value === '1';
      }
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
});

const settingUpdate = async (key, value) => {
  try {
    await axios.post(`${API_BASE_URL}/api/manage/updateSettings`, {
      setting_key: key,
      setting_value: value,
    }, getAuthHeaders());

    message.value = t('settingUpdated');
    setTimeout(() => { message.value = null; }, 2500);
  } catch (err) {
    console.error('Failed to update setting:', err);
  }
};
</script>