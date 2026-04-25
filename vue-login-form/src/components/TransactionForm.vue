<template>
  <form v-if="customers.length" @submit.prevent="sendDetailsToServer">
    <div class="mb-3">
      <label class="form-label">Customer Name</label><br />
      <select name="customerID" v-model="form.customerID" class="form-select">
        <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Invoice Number</label>
      <input type="text" class="form-control" v-model="form.invoiceNumber" placeholder="Invoice Number" />
    </div>
    <div class="mb-3">
      <label class="form-label">Total Excluding VAT</label>
      <input type="number" step="0.01" class="form-control" v-model="form.totalExcludingVat" placeholder="Total Excluding VAT" />
    </div>
    <div class="mb-3">
      <label class="form-label">VAT%</label>
      <input type="text" class="form-control" v-model="form.vatPercentage" placeholder="VAT%" />
    </div>
    <div class="mb-3">
      <label class="form-label">Due Date</label>
      <input type="date" class="form-control" v-model="form.dueDate" />
    </div>
    <div class="mb-3">
      <label class="form-label">Status</label>
      <select class="form-select" v-model="form.status">
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const emit = defineEmits(['close']);
const customers = ref([]);
const form = reactive({
  customerID: '',
  invoiceNumber: '',
  totalExcludingVat: '',
  vatPercentage: '',
  dueDate: '',
  status: 'paid',
});

onMounted(async () => {
  const response = await axios.get(`${API_BASE_URL}/api/reports/customer`, {
    headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
  });
  customers.value = response.data.data;
});

const sendDetailsToServer = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/reports/transaction`, form, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    if (response.status === 200) {
      alert('Invoice added successfully!');
      emit('close');
    }
  } catch (err) {
    alert(err.response?.data?.data);
  }
};
</script>