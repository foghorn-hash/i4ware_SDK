<template>
  <div class="page-card">
    <h3 class="mb-3">Sign in</h3>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" placeholder="you@example.com" />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" placeholder="Password" />
      </div>
      <div class="form-check mb-3">
        <input id="remember" v-model="remember" class="form-check-input" type="checkbox" />
        <label class="form-check-label" for="remember">Remember me</label>
      </div>
      <button class="btn btn-primary" type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");
const remember = ref(false);

const submit = () => {
  console.log("Login submit", { email: email.value, remember: remember.value });
};
</script>
