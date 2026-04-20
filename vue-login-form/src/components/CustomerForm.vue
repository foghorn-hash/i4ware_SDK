<template>
  <form @submit.prevent="sendDetailsToServer">
    <div class="mb-3">
      <label class="form-label">Customer Name</label>
      <input type="text" name="customerName" class="form-control" placeholder="Customer name" v-model="customerName" />
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const emit = defineEmits(['close']);
const customerName = ref('');

const sendDetailsToServer = async (e) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/reports/customer`,
      { customerName: customerName.value },
      { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` } }
    );
    if (response.status === 201) {
      customerName.value = '';
      alert('Customer added successfully!');
      emit('close');
    }
  } catch (err) {
    alert(err.response?.data?.data);
  }
};
</script>