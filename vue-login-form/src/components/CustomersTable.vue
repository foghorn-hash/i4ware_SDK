<template>
  <div>
    <div v-if="loading" class="loading-screen">
      <img :src="loadingSpinner" :alt="t('loading')" />
    </div>
    <p v-else-if="error" style="color: red">{{ error }}</p>
    <template v-else>
      <h2>{{ t('customertitle') }}</h2>
      <table class="table customer-table table-bordered">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.id }}</td>
            <td>{{ customer.name }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';

const { t } = useI18n();
const customers = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reports/customer`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    customers.value = response.data.data;
  } catch {
    error.value = t('customererror');
  } finally {
    loading.value = false;
  }
});
</script>