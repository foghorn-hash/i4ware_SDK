<template>
  <div class="app-background"></div>
  <div class="app-logo-header">
    <a href="#/public">
      <img :src="logoUrl" alt="logo" style="width: 380px; height: 100%" />
    </a>
  </div>
  <div class="app">
    <div class="container">
      <AppHeader :title="headerTitle" />
      <RouterView />
    </div>
    <button class="app-license-button" type="button" @click="toggleLicense">
      License
    </button>
    <div v-if="showLicense" class="license-panel">
      <h5 class="mb-3">License</h5>
      <p>Copyright (c) 2022-present i4ware Software</p>
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction.
      </p>
      <button class="btn btn-sm btn-outline-light" type="button" @click="toggleLicense">
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, RouterView } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import logoUrl from "./assets/52311-logo-transparent.png";

const showLicense = ref(false);
const route = useRoute();

const headerTitle = computed(() => {
  return route.meta?.title || "Login Forms";
});

const toggleLicense = () => {
  showLicense.value = !showLicense.value;
};
</script>
