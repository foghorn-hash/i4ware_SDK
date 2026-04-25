<template>
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ formType }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')" />
        </div>
        <div class="modal-body">
          <CustomerForm v-if="formType === 'Customer'" @close="$emit('close')" />
          <TransactionForm v-else @close="$emit('close')" />
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show" @click="$emit('close')" />
</template>

<script setup>
import CustomerForm from './CustomerForm.vue';
import TransactionForm from './TransactionForm.vue';

defineProps({
  show: Boolean,
  formType: String,
});

defineEmits(['close']);
</script>