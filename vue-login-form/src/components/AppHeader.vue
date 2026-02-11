<template>
  <header class="mb-4">
    <h2 class="text-center">{{ title }}</h2>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Login Forms"
  }
});
</script>
