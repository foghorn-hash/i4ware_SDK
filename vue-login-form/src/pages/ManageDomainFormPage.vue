<template>
  <div style="margin-top: 2em; margin-bottom: 2em">
    <h3 class="my-2">{{ t('manageDomain') }}</h3>
    <div class="my-2">
      <form class="row g-3" @submit.prevent="handleSubmit">

        <div class="col-12">
          <label>{{ t('technicalContactEmail') }}</label>
          <input v-model="form.technical_contact_email" type="email" class="form-control"
            :class="{ 'is-invalid': errors.technical_contact_email }" />
          <div class="invalid-feedback">{{ errors.technical_contact_email }}</div>
        </div>

        <div class="col-md-4">
          <label>{{ t('billingContactEmail') }}</label>
          <input v-model="form.billing_contact_email" type="email" class="form-control"
            :class="{ 'is-invalid': errors.billing_contact_email }" />
          <div class="invalid-feedback">{{ errors.billing_contact_email }}</div>
        </div>

        <div class="col-md-4">
          <label>{{ t('mobileNumber') }}</label>
          <input v-model="form.mobile_no" type="tel" class="form-control"
            :class="{ 'is-invalid': errors.mobile_no }" />
          <div class="invalid-feedback">{{ errors.mobile_no }}</div>
        </div>

        <div class="col-md-4">
          <label>{{ t('vatId') }}</label>
          <input v-model="form.vat_id" type="text" class="form-control" />
        </div>

        <div class="col-md-12">
          <label>{{ t('companyName') }}</label>
          <input v-model="form.company_name" type="text" class="form-control"
            :class="{ 'is-invalid': errors.company_name }" />
          <div class="invalid-feedback">{{ errors.company_name }}</div>
        </div>

        <div class="col-12">
          <label>{{ t('addressLine1') }}</label>
          <input v-model="form.address_line_1" type="text" class="form-control"
            :class="{ 'is-invalid': errors.address_line_1 }" />
          <div class="invalid-feedback">{{ errors.address_line_1 }}</div>
        </div>

        <div class="col-12">
          <label>{{ t('addressLine2') }}</label>
          <input v-model="form.address_line_2" type="text" class="form-control" />
        </div>

        <div class="col-md-4">
          <label>{{ t('city') }}</label>
          <input v-model="form.city" type="text" class="form-control"
            :class="{ 'is-invalid': errors.city }" />
          <div class="invalid-feedback">{{ errors.city }}</div>
        </div>

        <div class="col-md-4">
          <label>{{ t('country') }}</label>
          <input v-model="form.country" type="text" class="form-control"
            :class="{ 'is-invalid': errors.country }" />
          <div class="invalid-feedback">{{ errors.country }}</div>
        </div>

        <div class="col-md-4">
          <label>{{ t('zip') }}</label>
          <input v-model="form.zip" type="text" class="form-control"
            :class="{ 'is-invalid': errors.zip }" />
          <div class="invalid-feedback">{{ errors.zip }}</div>
        </div>

        <div class="col-12 d-flex gap-3">
          <button type="submit" class="btn btn-primary">{{ t('save') }}</button>
          <button type="button" class="btn btn-secondary" @click="router.push('/manage-domains')">
            Back
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const locationState = history.state ?? {};
const isEdit = locationState.from === 'edit';

const form = reactive(
  isEdit && locationState.item
    ? { ...locationState.item }
    : {
        technical_contact_email: '',
        billing_contact_email: '',
        mobile_no: '',
        company_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: '',
        zip: '',
        vat_id: '',
      }
);

const errors = reactive({});

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const getSchema = () =>
  Yup.object().shape({
    technical_contact_email: Yup.string().email(t('invalidEmail')).required(t('required')),
    billing_contact_email:   Yup.string().email(t('invalidEmail')).required(t('required')),
    mobile_no:               Yup.string().typeError(t('mobileNumberStringError')).required(t('required')),
    company_name:            Yup.string().required(t('required')),
    address_line_1:          Yup.string().required(t('required')),
    city:                    Yup.string().required(t('required')),
    country:                 Yup.string().required(t('required')),
    zip:                     Yup.string().required(t('required')),
  });

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    await getSchema().validate(form, { abortEarly: false });
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/manage/domains`,
      form,
      { headers: authHeaders() }
    );
    if (res.data.success === true) {
      router.push('/manage-domains');
    } else {
      for (const key in res.data.data) {
        if (Object.hasOwn(res.data.data, key)) {
          errors[key] = res.data.data[key][0];
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};
</script>