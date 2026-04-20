<template>
  <div>
    <div v-if="loading" class="loading-screen">
      <img :src="loadingSpinner" :alt="t('loading')" />
    </div>
    <p v-else-if="error" style="color: red">{{ error }}</p>
    <template v-else>
      <h2>{{ t('transactiontitle') }}</h2>
      <BarChart :chart-data="chartData" :chart-options="chartOptions" style="height: 400px" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { Bar as BarChart } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, CartesianScale } from 'chart.js';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const { t } = useI18n();
const loading = ref(true);
const error = ref(null);

const chartData = ref({ labels: [], datasets: [] });
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: { x: {}, y: {} },
});

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reports/sales-report`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    const data = response.data.root;
    chartData.value = {
      labels: data.map(item => item.saleYear),
      datasets: [{
        label: t('transactionname'),
        data: data.map(item => parseFloat(item.balanceVendor)),
        backgroundColor: '#ff0066',
      }],
    };
  } catch {
    error.value = t('transactionerror');
  } finally {
    loading.value = false;
  }
});
</script>