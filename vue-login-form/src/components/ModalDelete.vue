<template>
  <div v-if="show" class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ t('are_you_sure') }}</h5>
          <button class="btn-close" @click="$emit('close')" />
        </div>
        <div class="modal-body">{{ t('are_you_sure_text_delete') }}</div>
        <div class="modal-footer">
          <button class="btn btn-danger" @click="$emit('delete', fileName)">{{ t('yes_delete') }}</button>
          <button class="btn btn-secondary" @click="$emit('close')">{{ t('no_delete') }}</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show" @click="$emit('close')" />
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({ show: Boolean, fileName: String });
defineEmits(['close', 'delete']);
</script>