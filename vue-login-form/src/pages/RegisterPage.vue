<template>
  <div class="registeration d-flex justify-content-center">
    <div class="card col-12 col-lg-6 register-card mt-2">

      <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
        {{ successMessage }}
      </div>

      <form class="Register-form" @submit.prevent="handleSubmit">

        <div v-if="submitAttempted && !agree" class="alert alert-danger">
          {{ t('selectPrivacyPolicy') }}
        </div>

        <div class="form-group text-left">
          <label>{{ t('name') }}</label>
          <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': errors.name }"
            placeholder="John Doe" />
          <div class="invalid-feedback">{{ errors.name }}</div>
          <small class="form-text text-muted">{{ t('neverShareName') }}</small>
        </div>

        <div class="form-group text-left">
          <label class="select-gender-label">{{ t('gender') }}</label><br />
          <select v-model="form.gender" class="select-gender form-select">
            <option value="male">{{ t('male') }}</option>
            <option value="female">{{ t('female') }}</option>
          </select>
          <small class="form-text text-muted">{{ t('neverShareGender') }}</small>
        </div>

        <div class="form-group text-left">
          <label>{{ t('email') }}</label>
          <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }"
            :placeholder="setting.disable_registeration_from_others ? 'john.doe@i4ware.fi' : 'john.doe@domain.com'" />
          <div class="invalid-feedback">{{ errors.email }}</div>
          <small class="form-text text-muted">{{ t('newershare') }}</small>
        </div>

        <div class="form-group text-left">
          <label>{{ t('domain') }}</label>
          <input v-model="form.domain" type="text" class="form-control" :class="{ 'is-invalid': errors.domain }"
            :placeholder="setting.disable_registeration_from_others ? '' : 'www.domain.com'" />
          <div class="invalid-feedback">{{ errors.domain }}</div>
          <small class="form-text text-muted">
            {{ setting.disable_registeration_from_others ? t('domainInUse') : t('neverShareDomain') }}
          </small>
        </div>

        <template v-if="!setting.disable_registeration_from_others">
          <div class="form-group text-left">
            <label>{{ t('company_name') }}</label>
            <input v-model="form.company_name" type="text" class="form-control"
              :class="{ 'is-invalid': errors.company_name }" />
            <div class="invalid-feedback">{{ errors.company_name }}</div>
            <small class="form-text text-muted">{{ t('neverShareCompany') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('mobile_no') }}</label>
            <input v-model="form.mobile_no" type="text" class="form-control" />
            <small class="form-text text-muted">{{ t('neverShareMobileNo') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('vat_id') }}</label>
            <input v-model="form.vat_id" type="text" class="form-control" />
            <small class="form-text text-muted">{{ t('neverShareVatId') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('business_id') }}</label>
            <input v-model="form.business_id" type="text" class="form-control"
              :class="{ 'is-invalid': errors.business_id }" />
            <div class="invalid-feedback">{{ errors.business_id }}</div>
            <small class="form-text text-muted">{{ t('neverShareBusinessId') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('address_line_1') }}</label>
            <input v-model="form.address_line_1" type="text" class="form-control"
              :class="{ 'is-invalid': errors.address_line_1 }" />
            <div class="invalid-feedback">{{ errors.address_line_1 }}</div>
            <small class="form-text text-muted">{{ t('neverShareAddress') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('address_line_2') }}</label>
            <input v-model="form.address_line_2" type="text" class="form-control" />
            <small class="form-text text-muted">{{ t('neverShareAddress') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('city') }}</label>
            <input v-model="form.city" type="text" class="form-control" :class="{ 'is-invalid': errors.city }" />
            <div class="invalid-feedback">{{ errors.city }}</div>
            <small class="form-text text-muted">{{ t('neverShareCity') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('country') }}</label>
            <input v-model="form.country" type="text" class="form-control" />
            <small class="form-text text-muted">{{ t('neverShareCountry') }}</small>
          </div>

          <div class="form-group text-left">
            <label>{{ t('zip') }}</label>
            <input v-model="form.zip" type="text" class="form-control" :class="{ 'is-invalid': errors.zip }" />
            <div class="invalid-feedback">{{ errors.zip }}</div>
            <small class="form-text text-muted">{{ t('neverShareZip') }}</small>
          </div>
        </template>

        <div class="form-group text-left">
          <label>{{ t('password') }}</label>
          <input v-model="form.password" type="password" class="form-control"
            :class="{ 'is-invalid': errors.password }" />
          <div class="invalid-feedback">{{ errors.password }}</div>
          <small class="form-text text-muted">{{ t('passwordStronglyCrypted') }}</small>
        </div>

        <div class="form-group text-left">
          <label>{{ t('confirmPassword') }}</label>
          <input v-model="form.confirmPassword" type="password" class="form-control"
            :class="{ 'is-invalid': errors.confirmPassword }" />
          <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
          <small class="form-text text-muted">{{ t('passwordStronglyCrypted') }}</small>
        </div>

        <div v-if="setting.show_captcha" class="mt-2">
          <vue-recaptcha :sitekey="recaptchaSiteKey" @verify="onCaptchaVerify" @expired="onCaptchaExpired" />
        </div>

        <div class="form-group form-check mt-2">
          <input type="checkbox" class="form-check-input" id="term" v-model="agree" />
          <label class="form-check-label" for="term">
            {{ t('agreedOn') }}
            <a href="https://www.i4ware.fi/privacy-policy/" target="_blank">{{ t('privacyPolicy') }}</a>
            {{ t('and') }}
            <a href="https://www.i4ware.fi/data-processing-agreement/" target="_blank">{{ t('dataProcessingAgreement')
              }}</a>
          </label>
        </div>

        <button type="submit" class="btn btn-primary mt-3"
          :disabled="loading || (setting.show_captcha ? !captchaSuccess || !agree : !agree)">
          {{ loading ? t('loading') : t('register') }}
        </button>
      </form>

      <div class="mt-2">
        <span class="account-question">{{ t('account') }} </span>
        <span class="loginText" @click="router.push('/login')">{{ t('loginHere') }}</span>
      </div>
    </div>

    <ErrorRegistration :show="modalIsOpen" :error-messages="errorMessages" :success-message="successMessage"
      @close="modalIsOpen = false" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { VueRecaptcha } from 'vue-recaptcha';
import { API_BASE_URL, APP_RECAPTCHA_SITE_KEY } from '../constants/apiConstants';
import { useAuthStore } from '../stores/auth';
import ErrorRegistration from '../components/ErrorRegistration.vue';

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const recaptchaSiteKey = APP_RECAPTCHA_SITE_KEY;

if (authStore.isLogged) {
  router.push('/home');
}

const form = reactive({
  name: '',
  gender: 'male',
  email: '',
  domain: '',
  company_name: '',
  mobile_no: '',
  vat_id: '',
  business_id: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  country: '',
  zip: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({});
const error = ref(null);
const agree = ref(false);
const loading = ref(false);
const captchaValue = ref(null);
const captchaSuccess = ref(false);
const modalIsOpen = ref(false);
const errorMessages = ref([]);
const successMessage = ref(null);
const submitAttempted = ref(false);
const setting = reactive({
  show_captcha: false,
  disable_registeration_from_others: false,
});

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/api/settings`, { withCredentials: true });
    if (res.status === 200) {
      for (const element of res.data.data) {
        setting[element.setting_key] = element.setting_value === '1';
      }
    }
  } catch (err) {
    console.error('Failed to load settings', err);
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
    name: Yup.string().required(t('required')).max(32, t('tooLong')),
    company_name: Yup.string().required(t('required')).max(255, t('tooLong')),
    business_id: Yup.string().required(t('required')).max(32, t('tooLong')),
    address_line_1: Yup.string().required(t('required')).max(255, t('tooLong')),
    city: Yup.string().required(t('required')).max(255, t('tooLong')),
    zip: Yup.string().required(t('required')).max(255, t('tooLong')),
    gender: Yup.string().required(t('required')).max(6, t('tooLong')),
    email: Yup.string().email(t('invalidEmail')).required(t('required')).max(64, t('tooLong')),
    domain: Yup.string()
      .matches(/([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+/, t('invalidDomain'))
      .required(t('required')),
    password: Yup.string().required(t('required')).min(8, t('tooShort')).max(32, t('tooLong')),
    confirmPassword: Yup.string()
      .required(t('required'))
      .oneOf([Yup.ref('password'), null], t('passwordsDontMatch')),
  });

const validateForm = async () => {
  // Clear previous errors
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    await getSchema().validate(form, { abortEarly: false });
    return true;
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
    return false;
  }
};

const handleSubmit = async () => {
  submitAttempted.value = true;
  const valid = await validateForm();
  if (!valid || !agree.value) return;

  loading.value = true;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
      recaptcha: captchaValue.value,
      ...form,
    }, { withCredentials: true });

    const json = response.data;
    if (json.success) {
      successMessage.value = json.message || t('success_registration');
      modalIsOpen.value = true;
      setTimeout(() => router.push('/login'), 5000);
    } else {
      const errs = [];
      for (const value of Object.values(json.data)) {
        errs.push(...value);
      }
      errorMessages.value = errs;
      modalIsOpen.value = true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>