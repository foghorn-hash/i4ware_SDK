<template>
  <div class="page-card">
    <h3 class="mb-3">Set a new password</h3>
    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">New Password</label>
        <input v-model="password" type="password" class="form-control" placeholder="New password" />
      </div>
      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <input v-model="confirmPassword" type="password" class="form-control" placeholder="Confirm password" />
      </div>
      <button class="btn btn-primary" type="submit">Update password</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const password = ref("");
const confirmPassword = ref("");

const submit = () => {
  console.log("Set new password", { hasPassword: password.value.length > 0 });
};
</script>
