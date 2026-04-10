<template>
  <div class="reset d-flex justify-content-center">
    <div class="card col-12 col-lg-4 reset-card mt-2 hv-center">

      <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
        {{ successMessage }}
      </div>

      <form class="Reset-form" @submit.prevent="handleSubmit">

        <!-- Email -->
        <div class="form-group text-left">
          <label>{{ t('email') }}</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            placeholder="john.doe@domain.com"
          />
          <div class="invalid-feedback">{{ errors.email }}</div>
          <small class="form-text text-muted">{{ t('neverShareEmail') }}</small>
        </div>

        <div class="form-group text-left">
          <label>{{ t('password') }}</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
          />
          <div class="invalid-feedback">{{ errors.password }}</div>
          <small class="form-text text-muted">{{ t('passwordStronglyCrypted') }}</small>
        </div>

        <div class="form-group text-left">
          <label>{{ t('confirmPassword') }}</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.confirmPassword }"
          />
          <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
          <small class="form-text text-muted">{{ t('passwordStronglyCrypted') }}</small>
        </div>

        <div v-if="setting.show_captcha" class="mt-2">
          <vue-recaptcha :sitekey="recaptchaSiteKey" @verify="onCaptchaVerify" @expired="onCaptchaExpired" />
        </div>

        <button
          type="submit"
          class="btn btn-primary mt-3"
          :disabled="setting.show_captcha ? !captchaSuccess : false"
        >
          {{ t('submit') }}
        </button>
      </form>

      <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
        {{ successMessage }}
      </div>

      <div class="registerMessage">
        <span>{{ t('noAccount') }} </span>
        <span class="loginText" @click="router.push('/register')">{{ t('register') }}</span>
        <span> {{ t('orLogin') }} </span>
        <span class="loginText" @click="router.push('/login')">{{ t('login') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { VueRecaptcha } from 'vue-recaptcha';
import { API_BASE_URL, APP_RECAPTCHA_SITE_KEY } from '../constants/apiConstants';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const recaptchaSiteKey = APP_RECAPTCHA_SITE_KEY;

const form = reactive({ email: '', password: '', confirmPassword: '' });
const errors = reactive({});
const successMessage = ref(null);
const captchaValue = ref(null);
const captchaSuccess = ref(false);
const setting = reactive({ show_captcha: false });

onMounted(async () => {
  const lang = route.query.lang;
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;

  try {
    const res = await axios.get(`${API_BASE_URL}/api/settings`, { withCredentials: true });
    if (res.status === 200) {
      for (const el of res.data.data) {
        setting[el.setting_key] = el.setting_value === '1';
      }
    }
  } catch (err) {
    console.error(err);
  }
});

const onCaptchaVerify = (value) => {
  captchaValue.value = value;
  captchaSuccess.value = !!value;
};

const onCaptchaExpired = () => {
  captchaValue.value = null;
  captchaSuccess.value = false;
};

const getSchema = () =>
  Yup.object().shape({
    email:           Yup.string().email(t('invalidEmail')).required(t('required')).max(64, t('tooLong')),
    password:        Yup.string().required(t('required')).min(8, t('tooShort')).max(32, t('tooLong')),
    confirmPassword: Yup.string().required(t('required')).oneOf([Yup.ref('password'), null], t('passwordsDontMatch')),
  });

const handleSubmit = async () => {

  Object.keys(errors).forEach((k) => delete errors[k]);

  try {
    await getSchema().validate(form, { abortEarly: false });
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
    return;
  }

  const token = route.query.token;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/reset-password?token=${token}`,
      { recaptcha: captchaValue.value, ...form },
      { withCredentials: true }
    );

    if (response.data.success === true) {
      successMessage.value = t('passwordResetSuccessful');
    } else {
      const data = response.data.data;
      for (const key in data) {
        if (Object.hasOwn(data, key)) errors[key] = data[key][0];
      }
    }
  } catch (err) {
    console.error(err);
  }
};
</script>