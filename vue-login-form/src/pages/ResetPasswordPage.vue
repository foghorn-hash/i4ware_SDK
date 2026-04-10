<template>
  <div class="d-flex justify-content-center">
    <div class="card col-12 col-lg-4 login-card mt-2 hv-center">

      <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
        {{ successMessage }}
      </div>

      <form class="Reset-form" @submit.prevent="handleSubmit">
        <div class="form-group text-left">
          <label>{{ t('email') }}</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': emailError }"
            :placeholder="setting.disable_registeration_from_others ? 'john.doe@i4ware.fi' : 'john.doe@domain.com'"
          />
          <div class="invalid-feedback">{{ emailError }}</div>
          <small class="form-text text-muted">{{ t('neverShareEmail') }}</small>
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

      <div class="registerMessage mt-2">
        <span>{{ t('noAccount') }} </span>
        <span class="loginText" @click="router.push('/register')">{{ t('register') }}</span>
        <span> {{ t('orLogin') }} </span>
        <span class="loginText" @click="router.push('/login')">{{ t('login') }}</span>
      </div>
    </div>
    <div class="Reset-form-spacer"></div>
  </div>
  <div class="Reset-form-spacer"></div>
  <div class="Reset-form-spacer"></div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { VueRecaptcha } from 'vue-recaptcha';
import { API_BASE_URL, APP_RECAPTCHA_SITE_KEY } from '../constants/apiConstants';

const router = useRouter();
const { t, locale } = useI18n();
const recaptchaSiteKey = APP_RECAPTCHA_SITE_KEY;

const email = ref('');
const emailError = ref(null);
const successMessage = ref(null);
const captchaValue = ref(null);
const captchaSuccess = ref(false);
const setting = reactive({ show_captcha: false, disable_registeration_from_others: false });

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
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

const schema = () => Yup.object().shape({
  email: Yup.string().email(t('invalidEmail')).required(t('required')).max(64, t('tooLong')),
});

const handleSubmit = async () => {
  emailError.value = null;

  try {
    await schema().validate({ email: email.value }, { abortEarly: false });
  } catch (err) {
    emailError.value = err.inner[0]?.message;
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/forget-password`,
      { email: email.value, recaptcha: captchaValue.value },
      { withCredentials: true }
    );
    if (response.data.success === true) {
      successMessage.value = t('passwordResetSuccess');
    } else {
      const data = response.data.data;
      if (data?.email) emailError.value = data.email[0];
    }
  } catch (err) {
    console.error(err);
  }
};
</script>