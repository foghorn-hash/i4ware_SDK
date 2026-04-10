<template>
  <div :class="['successMessage', isSuccess ? 'success' : 'error']">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const status = ref(null);
const message = ref(null);

const isSuccess = computed(() =>
  status.value === 'success' || status.value === 'already-verified'
);

onMounted(() => {
  status.value = route.query.status || 'error';
  message.value = route.query.message || 'Email verification status unknown.';
});
</script>