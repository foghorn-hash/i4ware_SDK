<template>
  <div class="page-card">
    <h3 class="mb-2">{{ title }}</h3>
    <p class="text-muted">This page is a placeholder while the full component is migrated.</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const title = computed(() => route.meta?.title || "Page");
</script>
