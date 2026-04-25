<template>
  <div>
    <div v-if="loading" class="loading-screen">
      <img :src="loadingSpinner" alt="Loading..." />
    </div>
    <template v-else>
      <ButtonsToAdd />
      <TransactionsTable />
      <MonthlyIncomeForYear :year="currentYear" />
      <TransactionsTable />
      <CumulativeChart />
      <CustomersTable />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import ButtonsToAdd from '../components/ButtonsToAdd.vue';
import TransactionsTable from '../components/TransactionsTable.vue';
import MonthlyIncomeForYear from '../components/MonthlyIncomeForYear.vue';
import CumulativeChart from '../components/CumulativeChart.vue';
import CustomersTable from '../components/CustomersTable.vue';
import loadingSpinner from '../assets/tube-spinner.svg';

const currentYear = ref(new Date().getFullYear());
const loading = ref(true);

onMounted(async () => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/api/reports/income-years`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    const years = Array.isArray(resp?.data?.years) ? resp.data.years : [];
    if (years.length) {
      const sorted = years.slice().sort((a, b) => a - b);
      const cur = new Date().getFullYear();
      currentYear.value = sorted.includes(cur) ? cur : sorted[sorted.length - 1];
    }
  } catch {
    // keep default year
  } finally {
    loading.value = false;
  }
});
</script>