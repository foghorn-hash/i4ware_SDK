<template>
  <div class="d-flex justify-content-center">
    <div class="card col-12 col-lg-4 login-card mt-2 hv-center">

      <div v-if="error" class="alert alert-danger mt-2" role="alert">
        {{ error }}
      </div>

      <form class="Login-form">
        <div class="form-group text-left">
          <label for="email">{{ t('email') }}</label>
          <input
            type="email"
            class="form-control"
            id="email"
            :placeholder="t('enteremail')"
            v-model="email"
          />
          <small class="form-text text-muted">{{ t('newershare') }}</small>
        </div>

        <div class="form-group text-left">
          <label for="password">{{ t('password') }}</label>
          <input
            type="password"
            class="form-control"
            id="password"
            :placeholder="t('password')"
            v-model="password"
          />
        </div>

        <button type="submit" class="btn btn-primary" @click.prevent="handleSubmit">
          {{ t('submit') }}
        </button>
      </form>

      <div
        v-if="successMessage"
        class="alert alert-success mt-2"
        role="alert"
      >
        {{ successMessage }}
      </div>

      <div class="registerMessage">
        <span>{{ t('account') }} </span>
        <span class="loginText" @click="router.push('/register')">{{ t('register') }}</span>
        <span> {{ t('forgot') }} </span>
        <span class="loginText" @click="router.push('/reset-password')">{{ t('reset') }}</span>
      </div>
    </div>
    <div class="login-form-spacer"></div>
  </div>
  <div class="login-form-spacer"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA } from '../constants/apiConstants';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref(null);
const successMessage = ref(null);

// Handle ?lang= query param on mount
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }
});

const handleSubmit = async () => {
  error.value = null;

  if (!email.value || !password.value) {
    error.value = t('error_username_or_password');
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/login`,
      { email: email.value, password: password.value },
      { withCredentials: true }
    );

    if (response.data.success === true) {
      successMessage.value = t('success_in_login');

      const userData = {
        ...response.data.data,
        permissions: response.data.permissions,
      };

      authStore.authStateChanged({
        user: userData,
        token: response.data.token,
        isLogged: true,
      });

      localStorage.setItem(ACCESS_TOKEN_NAME, response.data.token);
      localStorage.setItem(ACCESS_USER_DATA, JSON.stringify(userData));

      router.push('/home');
    } else if (response.data.success === false) {
      error.value = t('error');
    } else {
      error.value = t('error_domain_is_expired');
    }
  } catch (err) {
    console.error(err);
    error.value = t('error');
  }
};
</script>