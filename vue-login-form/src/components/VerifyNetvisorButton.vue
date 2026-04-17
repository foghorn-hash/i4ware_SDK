<template>
  <div>
    <div v-if="showAlert" :class="`alert alert-${alertVariant} alert-dismissible`" role="alert">
      {{ alertMessage }}
      <button type="button" class="btn-close" @click="showAlert = false" />
    </div>

    <button
      class="btn"
      :class="enableNetvisor ? 'btn-primary' : 'btn-secondary'"
      :disabled="!enableNetvisor"
      @click="handleVerifyNetvisor"
    >
      {{ enableNetvisor ? 'Verify Netvisor' : 'Enable Netvisor to Verify' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  apiBaseUrl: String,
  token: String,
  enableNetvisor: Boolean,
});

const alertMessage = ref('');
const alertVariant = ref('');
const showAlert = ref(false);

let alertTimer = null;

watch(showAlert, (val) => {
  if (val) {
    alertTimer = setTimeout(() => { showAlert.value = false; }, 5000);
  } else {
    clearTimeout(alertTimer);
  }
});

const handleVerifyNetvisor = async () => {
  if (!props.enableNetvisor) {
    alertMessage.value = 'Netvisor is not enabled. Please enable it in settings first.';
    alertVariant.value = 'warning';
    showAlert.value = true;
    return;
  }

  try {
    const response = await axios.get(`${props.apiBaseUrl}/api/netvisor/invoices`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.token}`,
      },
    });

    const statusField = response.data?.ResponseStatus?.Status;
    const statusCode = Array.isArray(statusField) ? statusField[0] : statusField;

    if (statusCode === 'FAILED' || response.data?.error === true) {
      const detail = Array.isArray(statusField)
        ? (statusField[1] || '')
        : (response.data?.message || '');
      alertMessage.value = 'Incorrect Netvisor details. Please check your Netvisor credentials in the server configuration.' + (detail ? ` (${detail})` : '');
      alertVariant.value = 'danger';
      showAlert.value = true;
      return;
    }

    alertMessage.value = 'Netvisor Connection Successful!';
    alertVariant.value = 'success';
    showAlert.value = true;

  } catch (error) {
    if (error.response?.status === 403) {
      alertMessage.value = 'Netvisor is not enabled. Please enable it in settings first.';
      alertVariant.value = 'warning';
    } else if (error.response?.status === 422) {
      alertMessage.value = 'Incorrect Netvisor details. Please check your Netvisor credentials in the server configuration.';
      alertVariant.value = 'danger';
    } else {
      alertMessage.value = 'Netvisor Connection Failed! ' + (error.response?.data?.message || '');
      alertVariant.value = 'danger';
    }
    showAlert.value = true;
  }
};
</script>