<template>
  <div>
    <div class="cv-section-heading">{{ t('cvBasicInfo') }}</div>
    <div class="row mb-3">
      <div class="col-12 col-md-6 mb-3 mb-md-0">
        <label class="form-label">{{ t('cvName') }}</label>
        <input class="form-control" :placeholder="t('cvNamePlaceholder')" v-model="local.name" @input="emit('change', { ...local })" />
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">{{ t('cvTitle') }}</label>
        <input class="form-control" :placeholder="t('cvTitlePlaceholder')" v-model="local.title" @input="emit('change', { ...local })" />
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-12 col-md-4 mb-3 mb-md-0">
        <label class="form-label">{{ t('email') }}</label>
        <input type="email" class="form-control" :placeholder="t('cvEmailPlaceholder')" v-model="local.email" @input="emit('change', { ...local })" />
      </div>
      <div class="col-12 col-md-4 mb-3 mb-md-0">
        <label class="form-label">{{ t('cvPhone') }}</label>
        <input class="form-control" :placeholder="t('cvPhonePlaceholder')" v-model="local.phone" @input="emit('change', { ...local })" />
      </div>
      <div class="col-12 col-md-4">
        <label class="form-label">{{ t('cvLocation') }}</label>
        <input class="form-control" :placeholder="t('cvLocationPlaceholder')" v-model="local.location" @input="emit('change', { ...local })" />
      </div>
    </div>
    <div class="cv-section-heading">{{ t('cvSummary') }}</div>
    <textarea class="form-control mb-4" rows="5" :placeholder="t('cvSummaryPlaceholder')" v-model="local.text" @input="emit('change', { ...local })" />
    <div class="cv-section-heading">{{ t('cvGithub') }}</div>
    <input class="form-control" :placeholder="t('cvGithubPlaceholder')" v-model="local.githubUrl" @input="emit('change', { ...local })" />
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({ data: Object });
const emit = defineEmits(['change']);
const local = reactive({ ...props.data });

watch(() => props.data, (val) => Object.assign(local, val), { deep: true });
</script>