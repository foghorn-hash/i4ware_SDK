<template>
  <div>
    <button class="transaction-button btn btn-primary" @click="openForm('Transaction')">
      Add Transactions
    </button>
    <button class="transaction-button btn btn-primary" @click="openForm('Customer')">
      Add Customer
    </button>
    <ModalForForm :show="show" :form-type="formType" @close="show = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ModalForForm from './ModalForForm.vue';
import '../assets/css/RevenueCharts.css';

const show = ref(false);
const formType = ref('');

const openForm = (type) => {
  formType.value = type;
  show.value = true;
};
</script>