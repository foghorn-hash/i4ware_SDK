<template>
  <div class="userMessage">
    {{ t('welcome') }}, {{ successMessage }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import '../assets/css/UserDataComponent.css';

const { t } = useI18n();
const successMessage = ref('');

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/userdata`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
      withCredentials: true,
    });
    successMessage.value = response.status === 200 ? response.data.name : t('unauthorized');
  } catch {
    successMessage.value = t('unauthorized');
  }
});
</script>