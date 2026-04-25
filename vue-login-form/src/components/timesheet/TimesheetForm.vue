<template>
  <form class="timesheet-form" @submit.prevent="$emit('submit')">
    <div class="row g-3">

      <div class="col-md">
        <label class="small text-muted">{{ t('timesheetNameLabel') }}</label>
        <input class="form-control" :value="meta.nimi" @input="update('nimi', $event.target.value)" :placeholder="t('timesheetNamePlaceholder')" />
        <span v-if="submitted && !meta.nimi" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('employeeLabel') }}</label>
        <input class="form-control" :value="meta.tyontekija" @input="update('tyontekija', $event.target.value)" :placeholder="t('employeePlaceholder')" />
        <span v-if="submitted && !meta.tyontekija" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md-6">
        <label class="small text-muted">{{ t('jobTitleLabel') }}</label>
        <input class="form-control" :value="meta.ammattinimike" @input="update('ammattinimike', $event.target.value)" :placeholder="t('jobTitlePlaceholder')" />
        <span v-if="submitted && !meta.ammattinimike" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <hr />

      <div class="col-md-6">
        <label class="small text-muted">{{ t('projectLabel') }}</label>
        <input class="form-control" :value="meta.project" @input="update('project', $event.target.value)" :placeholder="t('projectPlaceholder')" />
        <span v-if="submitted && !meta.project" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('dateLabel') }}</label>
        <input type="date" class="form-control" :value="meta.pvm" @input="update('pvm', $event.target.value)" />
        <span v-if="submitted && !meta.pvm" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('startTimeLabel') }}</label>
        <input type="time" class="form-control" :value="meta.klo_alku" @input="$emit('meta-change', 'klo_alku', $event.target.value)" />
        <span v-if="submitted && !meta.klo_alku" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('endTimeLabel') }}</label>
        <input type="time" class="form-control" :value="meta.klo_loppu" @input="$emit('meta-change', 'klo_loppu', $event.target.value)" />
        <span v-if="submitted && !meta.klo_loppu" class="text-danger small">{{ t('requiredField') }}</span>
      </div>

      <div class="col-md-6">
        <label class="small text-muted">{{ t('normalHoursLabel') }}</label>
        <input type="number" step="0.1" class="form-control" :value="meta.norm" @input="update('norm', $event.target.value)" :placeholder="t('normalHoursPlaceholder')" />
        <NumberValidator :value="meta.norm" />
      </div>

      <!-- Extras -->
      <template v-if="showExtras">
        <div v-for="field in extraFields" :key="field.key" class="col-3">
          <label class="small text-muted">{{ field.label }}</label>
          <input type="number" step="0.1" class="form-control" :value="meta[field.key]" @input="update(field.key, $event.target.value)" :placeholder="t('extrasPlaceholder')" />
          <small v-if="showExtrasMessage" class="text-info">{{ t('showExtrasPlaceholder') }}</small>
          <NumberValidator :value="meta[field.key]" />
        </div>
      </template>

      <template v-if="showOvertime">
        <div v-for="field in overtimeFields" :key="field.key" class="col-3">
          <label class="small text-muted">{{ field.label }}</label>
          <input type="number" step="0.1" class="form-control" :value="meta[field.key]" @input="update(field.key, $event.target.value)" :placeholder="t('overtimePlaceholder')" />
          <small v-if="showOvertimeMessage" class="text-info">{{ t('showOvertimePlaceholder') }}</small>
          <NumberValidator :value="meta[field.key]" />
        </div>
      </template>

      <div class="col-3">
        <label class="small text-muted">{{ t('atvLabel') }}</label>
        <input type="number" step="0.1" class="form-control" :value="meta.atv" @input="update('atv', $event.target.value)" :placeholder="t('extrasPlaceholder')" />
        <NumberValidator :value="meta.atv" />
      </div>

      <div class="col-3">
        <label class="small text-muted">{{ t('travelLabel') }}</label>
        <input type="number" step="0.1" class="form-control" :value="meta.matk" @input="update('matk', $event.target.value)" :placeholder="t('extrasPlaceholder')" />
        <NumberValidator :value="meta.matk" />
      </div>

      <div class="col-3">
        <label class="small text-muted">{{ t('mealLabel') }}</label>
        <input type="number" class="form-control" :value="meta.ateriakorvaus" @input="update('ateriakorvaus', $event.target.value)" :placeholder="t('mealLabel')" />
        <NumberValidator :value="meta.ateriakorvaus" />
      </div>

      <div class="col-3">
        <label class="small text-muted">{{ t('kmLabel') }}</label>
        <input type="number" step="0.1" class="form-control" :value="meta.km" @input="update('km', $event.target.value)" :placeholder="t('kmPlaceholder')" />
        <NumberValidator :value="meta.km" />
      </div>

      <div v-if="parseFloat(meta.km) > 0" class="col-md">
        <label class="small text-muted">{{ t('kmNoteLabel') }}</label>
        <textarea class="form-control" :value="meta.km_selite" @input="update('km_selite', $event.target.value)" :placeholder="t('kmNotePlaceholder')" />
        <small class="text-info">{{ t('kmDescInfo') }}</small>
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('toolCompLabel') }}</label>
        <input type="number" class="form-control" :value="meta.tyokalukorvaus" @input="update('tyokalukorvaus', $event.target.value)" :placeholder="t('toolCompPlaceholder')" />
        <NumberValidator :value="meta.tyokalukorvaus" />
      </div>

      <div class="col-md">
        <label class="small text-muted">{{ t('dailyAllowance') }}</label>
        <select class="form-control" :value="meta.paivaraha" @change="update('paivaraha', $event.target.value)">
          <option value="ei">{{ t('none') }}</option>
          <option value="osa">{{ t('partial') }}</option>
          <option value="koko">{{ t('full') }}</option>
        </select>
      </div>

      <div class="col-6">
        <label class="small text-muted">{{ t('noteLabel') }}</label>
        <textarea class="form-control" :value="meta.huom" @input="update('huom', $event.target.value)" :placeholder="t('notePlaceholder')" />
      </div>

      <div class="col-6">
        <label class="small text-muted">{{ t('memoLabel') }}</label>
        <textarea class="form-control" :value="meta.memo" @input="update('memo', $event.target.value)" :placeholder="t('memoPlaceholder')" />
      </div>
    </div>

    <div v-if="statusMessage" class="row mb-2 mt-2">
      <div class="col">
        <div :class="statusClass">{{ statusMessage }}</div>
      </div>
    </div>

    <div class="row g-2 mt-3">
      <div class="col-auto">
        <button type="button" class="btn btn-primary btn-sm" @click="$emit('toggle-extras')">
          {{ showExtras ? t('toggleExtrasHide') : t('toggleExtrasShow') }}
        </button>
        <button type="button" class="btn btn-secondary btn-sm ms-1" @click="$emit('toggle-overtime')">
          {{ showOvertime ? t('toggleOvertimeHide') : t('toggleOvertimeShow') }}
        </button>
      </div>
      <div class="col text-end">
        <button type="submit" class="btn btn-success btn-sm me-2">{{ t('addRowButton') }}</button>
        <button type="button" class="btn btn-outline-danger btn-sm" @click="$emit('clear-all')">{{ t('clearAllButton') }}</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  meta: Object,
  submitted: Boolean,
  showExtras: Boolean,
  showOvertime: Boolean,
  showExtrasMessage: Boolean,
  showOvertimeMessage: Boolean,
  statusMessage: String,
  statusType: String,
});

const emit = defineEmits(['submit', 'update:meta', 'meta-change', 'toggle-extras', 'toggle-overtime', 'clear-all']);

const update = (field, value) => {
  emit('update:meta', { ...props.meta, [field]: value });
};

const extraFields = computed(() => [
  { key: 'lisatLa',   label: t('extrasLaLabel')      },
  { key: 'lisatSu',   label: t('extrasSuLabel')      },
  { key: 'lisatIlta', label: t('extrasEveningLabel') },
  { key: 'lisatYo',   label: t('extrasNightLabel')   },
]);

const overtimeFields = computed(() => [
  { key: 'ylityoVrk50',  label: t('overtimeVrk50Label')  },
  { key: 'ylityoVrk100', label: t('overtimeVrk100Label') },
  { key: 'ylityoVko50',  label: t('overtimeVko50Label')  },
  { key: 'ylityoVko100', label: t('overtimeVko100Label') },
]);

const statusClass = computed(() => ({
  'save-status success': props.statusType === 'success',
  'save-status error':   props.statusType === 'error',
  'status-message info': props.statusType === 'info',
  'alert alert-danger':  props.statusType === 'danger',
}));
</script>