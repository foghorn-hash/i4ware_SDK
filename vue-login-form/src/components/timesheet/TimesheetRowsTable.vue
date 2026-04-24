<template>
  <div>
    <table class="table table-striped table-bordered table-hover">
      <thead>
        <tr>
          <th>{{ t('projectLabel') }}</th>
          <th>{{ t('dateLabel') }}</th>
          <th>{{ t('workTypeLabel') }}</th>
          <th>{{ t('hoursLabel') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in rows" :key="row.id">
          <tr
            v-for="(type, index) in visibleTypes(row)"
            :key="`${row.id}-${type.key}`"
          >
            <td>{{ index === 0 ? row.project : '' }}</td>
            <td>{{ index === 0 ? formatDate(row.pvm) : '' }}</td>
            <td>{{ type.label }}</td>
            <td>{{ row[type.key] }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="row mt-3">
      <div class="col d-flex justify-content-between align-items-center">
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="pagination.currentPage === 1"
          @click="$emit('fetch', pagination.currentPage - 1)"
        >
          {{ t('previous') }}
        </button>
        <span>{{ t('page') }} {{ pagination.currentPage }} {{ t('of') }} {{ pagination.lastPage }}</span>
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="pagination.currentPage === pagination.lastPage"
          @click="$emit('fetch', pagination.currentPage + 1)"
        >
          {{ t('next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps({ rows: Array, pagination: Object });
defineEmits(['fetch']);

const hourTypes = computed(() => [
  { key: 'norm',         label: t('normalHoursLabel')    },
  { key: 'lisatIlta',    label: t('extrasEveningLabel')  },
  { key: 'lisatYo',      label: t('extrasNightLabel')    },
  { key: 'lisatLa',      label: t('extrasLaLabel')       },
  { key: 'lisatSu',      label: t('extrasSuLabel')       },
  { key: 'ylityoVrk50',  label: t('overtimeVrk50Label')  },
  { key: 'ylityoVrk100', label: t('overtimeVrk100Label') },
  { key: 'ylityoVko50',  label: t('overtimeVko50Label')  },
  { key: 'ylityoVko100', label: t('overtimeVko100Label') },
  { key: 'atv',          label: t('atvLabel')            },
]);

const visibleTypes = (row) => hourTypes.value.filter(type => row[type.key] && row[type.key] > 0);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date  = new Date(dateString);
  const day   = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
};
</script>