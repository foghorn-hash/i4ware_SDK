import { ref, reactive, onMounted } from 'vue';
import { api, setupApiAuth } from './useTimesheetApi';
import { fromApiRow } from '../utils/timesheetHelpers';

export function useTimesheet() {
  const timesheet = ref(null);
  const rows      = ref([]);
  const meta      = reactive({
    nimi: '', tyontekija: '', ammattinimike: '',
    project: '', pvm: '', klo_alku: '', klo_loppu: '',
    norm: '', lisatLa: '', lisatSu: '', lisatIlta: '', lisatYo: '',
    ylityoVrk50: '', ylityoVrk100: '', ylityoVko50: '', ylityoVko100: '',
    atv: '', matk: '', paivaraha: 'ei', ateriakorvaus: '',
    km: '', tyokalukorvaus: '', km_selite: '', huom: '', memo: '',
  });

  const timesheetId = ref(null);

  const createTimesheet = async () => {
    if (timesheet.value?.id) return timesheet.value.id;
    try {
      const res = await api.post('/api/timesheet/timesheets', {
        nimi: meta.nimi,
        tyontekija: meta.tyontekija,
        ammattinimike: meta.ammattinimike,
        status: 'Luotu',
      });
      const ts = res.data?.data ?? res.data;
      timesheet.value  = ts;
      timesheetId.value = ts.id;
      return ts.id;
    } catch (err) {
      console.error('Timesheet creation failed:', err);
      return null;
    }
  };

  onMounted(async () => {
    setupApiAuth();
    try {
      const res = await api.get('/api/timesheet/timesheets', {
        params: { per_page: 1, order_by: 'created_at desc' },
      });
      const data = res.data?.data ?? res.data;
      const ts   = Array.isArray(data) ? data[0] : data;
      if (!ts?.id) return;

      timesheet.value   = ts;
      timesheetId.value  = ts.id;
      meta.nimi          = ts.nimi ?? '';
      meta.tyontekija    = ts.tyontekija ?? '';
      meta.ammattinimike = ts.ammattinimike ?? '';

      const rowsRes = await api.get(`/api/timesheet/timesheets/${ts.id}/rows`);
      const rowData = rowsRes.data?.data ?? rowsRes.data ?? [];
      rows.value = rowData.map(fromApiRow);
    } catch (err) {
      console.error('INIT failed:', err);
    }
  });

  return { timesheet, timesheetId, rows, meta, createTimesheet };
}