<template>
  <div
    v-if="errorMessage !== null"
    class="alert alert-danger alert-dismissable mt-4"
    role="alert"
    id="alertPopUp"
  >
    <div class="d-flex alertMessage">
      <span>{{ errorMessage }}</span>
      <button
        type="button"
        class="button close"
        aria-label="Close"
        @click="$emit('hide')"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  errorMessage: { type: String, default: null },
});

defineEmits(['hide']);
</script>