<template>
  <div class="d-flex justify-content-center">
    <div class="card col-12 col-lg-4 verification-card mt-2 hv-center">

      <VerificationComponent />

      <div class="mt-2">
        <span class="account-question">{{ t('goToLogin') }} </span>
        <span class="verificationText" @click="router.push('/login')">{{ t('loginHere') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import VerificationComponent from '../components/VerificationComponent.vue';

const router = useRouter();
const { locale } = useI18n();

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;
});
</script>