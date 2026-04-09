<script setup>
import { computed, ref, onMounted, onErrorCaptured } from "vue";
import { RouterView } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import logoUrl from "./assets/52311-logo-transparent.png";
import axios from "axios";
import { API_BASE_URL } from "./constants/apiConstants";

const showLicense = ref(false);
const route = useRoute();
const toggleLicense = () => { showLicense.value = !showLicense.value; };

const setting = ref({ disable_license_details: false });
onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/settings`, { withCredentials: true });
    if (res.status === 200) {
      const obj = {};
      for (const element of res.data.data) {
        obj[element.setting_key] = element.setting_value === "1";
      }
      setting.value = obj;
    }
  } catch (err) {
    console.error("Settings API error:", err);
  }
});


const appError = ref(null);
onErrorCaptured((err) => {
  appError.value = err.message;
  return false;
});
</script>

<template>
  <div v-if="appError" class="container mt-4">
    <div class="alert alert-danger">
      An error occurred: {{ appError }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="appError = null">Try again</button>
    </div>
  </div>

  <template v-else>
    <div class="app-background"></div>
    <div class="app-logo-header">
      <a href="#/public">
        <img :src="logoUrl" alt="logo" style="width: 380px; height: 100%" />
      </a>
    </div>
    <div class="app">
      <div class="container">
        <AppHeader />
        <RouterView />
      </div>

      <template v-if="!setting.disable_license_details">
        <button class="app-license-button" type="button" @click="toggleLicense">
          {{ $t('app_license') }}
        </button>
        <div v-if="showLicense" class="license-panel">
          <h5 class="mb-3">{{ $t('app_license') }}</h5>
          <p>{{ $t('app_copyright') }}</p>
          <p>{{ $t('app_permission') }}</p>
          <p>{{ $t('app_conditions') }}</p>
          <p>{{ $t('app_warranty') }}</p>
          <button class="btn btn-sm btn-outline-light" type="button" @click="toggleLicense">
            {{ $t('close') }}
          </button>
        </div>
      </template>
    </div>
  </template>
</template>