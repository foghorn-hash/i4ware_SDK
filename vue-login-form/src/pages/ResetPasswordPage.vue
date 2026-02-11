<template>
  <div class="page-card">
    <h3 class="mb-3">Reset password</h3>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" placeholder="you@example.com" />
      </div>
      <button class="btn btn-warning" type="submit">Send reset link</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");

const submit = () => {
  console.log("Reset request", { email: email.value });
};
</script>
