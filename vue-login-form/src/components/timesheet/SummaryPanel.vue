<template>
  <div class="card shadow-sm">
    <div class="card-header"><h6 class="mb-0">{{ t('summaryHeader') }}</h6></div>
    <div class="card-body">
      <div class="row g-3">
        <div v-for="item in summaryItems" :key="item.key" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="text-muted small">{{ item.label }}</div>
              <div class="h4 mb-0">{{ Number(totals[item.key] || 0).toFixed(2) }}{{ item.suffix }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps({ totals: Object });

const summaryItems = computed(() => [
  { key: 'norm',          label: t('normalHoursLabel'),   suffix: ' h' },
  { key: 'lisatLa',       label: t('extrasLaLabel'),      suffix: ' h' },
  { key: 'lisatSu',       label: t('extrasSuLabel'),      suffix: ' h' },
  { key: 'lisatIlta',     label: t('extrasEveningLabel'), suffix: ' h' },
  { key: 'lisatYo',       label: t('extrasNightLabel'),   suffix: ' h' },
  { key: 'ylityoVrk50',   label: t('overtimeVrk50Label'), suffix: ' h' },
  { key: 'ylityoVrk100',  label: t('overtimeVrk100Label'),suffix: ' h' },
  { key: 'ylityoVko50',   label: t('overtimeVko50Label'), suffix: ' h' },
  { key: 'ylityoVko100',  label: t('overtimeVko100Label'),suffix: ' h' },
  { key: 'atv',           label: t('atvLabel'),           suffix: ' h' },
  { key: 'matk',          label: t('travelLabel'),        suffix: ' h' },
  { key: 'ateriakorvaus', label: t('mealLabel'),          suffix: ' €' },
  { key: 'km',            label: t('kmLabel'),            suffix: ' km'},
  { key: 'tyokalukorvaus',label: t('toolCompLabel'),      suffix: ' €' },
]);
</script>