<template>
  <div>
    <h1>{{ t('passwordChange') }}</h1>

    <form @submit.prevent="handleSubmit">
      <div class="form-group text-left">
        <label>{{ t('password') }}</label>
        <input v-model="form.password" type="password" class="form-control"
          :class="{ 'is-invalid': errors.password }" />
        <div class="invalid-feedback">{{ errors.password }}</div>
      </div>

      <div class="form-group text-left">
        <label>{{ t('confirmPassword') }}</label>
        <input v-model="form.confirmPassword" type="password" class="form-control"
          :class="{ 'is-invalid': errors.confirmPassword }" />
        <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
      </div>

      <div class="spacer"></div>
      <div class="d-flex justify-content-between">
        <button type="submit" class="btn btn-primary">{{ t('change') }}</button>
        <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ t('close') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import * as Yup from 'yup';

const props = defineProps({
  userId: { type: [Number, String], default: null },
});

const emit = defineEmits(['close', 'submit']);

const { t } = useI18n();

const form = reactive({ password: '', confirmPassword: '' });
const errors = reactive({});

const getSchema = () =>
  Yup.object().shape({
    password:        Yup.string().required(t('passwordRequired')),
    confirmPassword: Yup.string().required(t('confirmPasswordRequired'))
                       .oneOf([Yup.ref('password'), null], t('passwordsMustMatch')),
  });

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    await getSchema().validate(form, { abortEarly: false });
    emit('submit', { ...form });
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
  }
};
</script>