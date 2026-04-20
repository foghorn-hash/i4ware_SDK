<template>
  <div>
    <div v-if="loading" class="loading-screen">
      <img :src="loadingSpinner" alt="Loading..." />
    </div>
    <p v-else-if="error" style="color: red">{{ error }}</p>
    <template v-else>
      <h2>Cumulative Sales Chart</h2>
      <LineChart :chart-data="chartData" :chart-options="chartOptions" style="height: 400px" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const { t } = useI18n();
const loading = ref(true);
const error = ref(null);
const chartData = ref({ labels: [], datasets: [] });
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => `${t('name')}: ${Number(ctx.raw).toFixed(2)} €`,
      },
    },
  },
  scales: { x: {}, y: {} },
});

onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reports/cumulative-sales`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    const data = response.data.root;
    chartData.value = {
      labels: data.map(d => d.saleDate?.slice(0, 7)),
      datasets: [{
        label: t('name'),
        data: data.map(d => d.cumulativeVendorBalance),
        borderColor: '#8884d8',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      }],
    };
  } catch {
    error.value = 'Failed to fetch cumulative data. Please try again.';
  } finally {
    loading.value = false;
  }
});
</script>