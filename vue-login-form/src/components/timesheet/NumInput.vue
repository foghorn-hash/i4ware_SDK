<template>
  <div>
    <input
      ref="inputRef"
      type="number"
      class="form-control form-control-sm"
      :value="value"
      :step="step"
      :min="min"
      :max="max"
      :placeholder="placeholder"
      :class="className"
      :style="style"
      @change="handleChange"
      @wheel.prevent="handleWheel"
    />
    <small v-if="error" class="text-danger">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  value: [Number, String],
  step: { type: Number, default: 0.25 },
  min:  { type: Number, default: 0.1 },
  max:  { type: Number, default: 999.99 },
  placeholder: String,
  className: String,
  style: Object,
});
const emit = defineEmits(['update:value']);
const error    = ref('');
const inputRef = ref(null);

const handleChange = (e) => {
  const val = Number(e.target.value || 0);
  if (val > props.max)      { error.value = t('messageTooBig'); return; }
  else if (val < props.min) { error.value = t('messageTooSmall'); return; }
  error.value = '';
  emit('update:value', val);
};

const handleWheel = (e) => {
  let val = Number(props.value || 0);
  val += e.deltaY < 0 ? props.step : -props.step;
  val = Math.min(Math.max(val, props.min), props.max);
  emit('update:value', val);
};
</script>