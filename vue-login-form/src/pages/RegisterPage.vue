<template>
  <div class="page-card">
    <h3 class="mb-3">Create account</h3>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="name" type="text" class="form-control" placeholder="Full name" />
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" placeholder="you@example.com" />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" placeholder="Password" />
      </div>
      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <input v-model="confirmPassword" type="password" class="form-control" placeholder="Confirm password" />
      </div>
      <button class="btn btn-success" type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const submit = () => {
  console.log("Register submit", { name: name.value, email: email.value });
};
</script>
