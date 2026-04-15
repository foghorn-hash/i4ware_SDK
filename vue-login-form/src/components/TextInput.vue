<template>
  <div>
    <label class="form-label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="['form-control', { 'is-invalid': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  label:       { type: String, default: '' },
  modelValue:  { type: String, default: '' },
  type:        { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error:       { type: String, default: null },
});
defineEmits(['update:modelValue']);
</script>