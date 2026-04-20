<template>
  <div>
    <div v-if="loading" class="loading-screen">
      <img :src="loadingSpinner" :alt="t('loading')" />
    </div>
    <p v-else-if="error" style="color: red">{{ error }}</p>
    <template v-else>
      <h2 class="calculator-title">{{ t('incometitle') }} — {{ year }}</h2>
      <div style="margin-bottom: 8px">
        <strong>{{ t('total') }}:</strong> {{ yearTotal.toFixed(2) }} €
      </div>
      <BarChart :chart-data="chartData" :chart-options="chartOptions" style="height: 420px" />
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { Bar as BarChart } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps({
  year: { type: Number, default: () => new Date().getFullYear() },
});

const { t } = useI18n();
const loading = ref(true);
const error = ref(null);
const yearTotal = ref(0);
const chartData = ref({ labels: [], datasets: [] });
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: { label: (ctx) => `${Number(ctx.raw).toFixed(2)} €` },
    },
  },
});

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const r = await axios.get(
      `${API_BASE_URL}/api/reports/merged-monthly-sums?year=${encodeURIComponent(props.year)}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` } }
    );
    const data = Array.isArray(r?.data?.root) ? r.data.root : [];
    yearTotal.value = Number(r?.data?.yearTotal || 0);
    chartData.value = {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Total',
        data: data.map(d => d.total),
        backgroundColor: '#d71bdd',
      }],
    };
  } catch {
    error.value = t('incomeerror');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(() => props.year, fetchData);
</script>