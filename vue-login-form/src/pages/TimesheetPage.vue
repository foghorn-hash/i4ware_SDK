<template>
  <div class="tcontainer py-4 bg-dark min-vh-100">
    <div style="max-width: 1600px; margin: 0 auto;">

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <TimesheetForm
            :meta="meta"
            :submitted="submitted"
            :show-extras="showExtras"
            :show-overtime="showOvertime"
            :show-extras-message="showExtrasMessage"
            :show-overtime-message="showOvertimeMessage"
            :status-message="statusMessage"
            :status-type="statusType"
            @submit="handleSubmit"
            @update:meta="Object.assign(meta, $event)"
            @meta-change="handleMetaChange"
            @toggle-extras="toggleExtras"
            @toggle-overtime="toggleOvertime"
            @clear-all="clearAll"
          />
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <TimesheetRowsTable
            :rows="rows"
            :pagination="pagination"
            @fetch="fetchRows"
          />
        </div>
      </div>

      <SummaryPanel :totals="totals" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api, setupApiAuth } from '../composables/useTimesheetApi';
import { useTimesheet } from '../composables/useTimesheet';
import { useRowActions } from '../composables/useRowActions';
import { fromApiRow, calculateTotals } from '../utils/timesheetHelpers';
import TimesheetForm from '../components/timesheet/TimesheetForm.vue';
import TimesheetRowsTable from '../components/timesheet/TimesheetRowsTable.vue';
import SummaryPanel from '../components/timesheet/SummaryPanel.vue';
import '../assets/css/Timesheet.css';

const { t } = useI18n();

setupApiAuth();

const { timesheet, timesheetId, rows, meta, createTimesheet } = useTimesheet();

const {
  submitted, statusMessage, statusType,
  showExtras, showOvertime, showExtrasMessage, showOvertimeMessage,
  handleSubmit, clearAll, toggleExtras, toggleOvertime, handleMetaChange,
} = useRowActions(timesheetId, rows, meta, createTimesheet, t);

const pagination = ref({ currentPage: 1, lastPage: 1, total: 0 });

const fetchRows = async (page = 1) => {
  if (!timesheetId.value) return;
  try {
    const res = await api.get(`/api/timesheet/timesheets/${timesheetId.value}/rows?page=${page}&per_page=10`);
    const response = res.data;
    rows.value = response.data.map(fromApiRow);
    pagination.value = {
      currentPage: response.current_page,
      lastPage:    response.last_page,
      total:       response.total,
    };
  } catch (e) {
    console.error('Failed to fetch rows', e);
  }
};

watch(timesheetId, (id) => { if (id) fetchRows(1); });

const totals = computed(() => calculateTotals(rows.value));
</script>