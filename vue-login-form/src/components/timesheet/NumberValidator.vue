<template>
  <small v-if="msg" class="text-danger">{{ msg }}</small>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({ value: [Number, String], min: { default: 0.1 }, max: { default: 999.99 } });

const msg = computed(() => {
  if (props.value === '' || props.value === null || props.value === undefined) return '';
  const v = Number(props.value);
  if (v < props.min) return t('messageTooSmall');
  if (v > props.max) return t('messageTooBig');
  return '';
});
</script>