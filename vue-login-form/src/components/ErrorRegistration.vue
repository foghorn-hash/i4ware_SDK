<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ successMessage ? t('success_registration') : t('error') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <template v-if="successMessage">
            <p>{{ successMessage }}</p>
          </template>
          <template v-else>
            <p>{{ t('error_messages') }}</p>
            <ul>
              <li v-for="(message, index) in localizedErrorMessages" :key="index">
                {{ message }}
              </li>
            </ul>
            <p>{{ t('end_message') }}</p>
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            {{ t('close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  show: Boolean,
  errorMessages: { type: Array, default: () => [] },
  successMessage: { type: String, default: null },
});

defineEmits(['close']);

const { t } = useI18n();

const localizedErrorMessages = computed(() =>
  props.errorMessages.map((message) => {
    switch (message) {
      case 'The email has already been taken.':     return t('email_error');
      case 'The email format is invalid':           return t('email_error_valid');
      case 'The domain has already been taken.':    return t('domain_error');
      case 'The domain format is invalid.':         return t('domain_error_valid');
      default:                                      return message;
    }
  })
);
</script>