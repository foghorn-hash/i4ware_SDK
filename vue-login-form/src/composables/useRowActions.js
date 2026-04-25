import { ref } from 'vue';
import { api } from './useTimesheetApi';
import { useAutosaveMeta, useAutosaveRows } from './useAutosave';
import { fromApiRow } from '../utils/timesheetHelpers';

export function useRowActions(timesheetId, rows, meta, createTimesheet, t) {
  const submitted         = ref(false);
  const statusMessage     = ref('');
  const statusType        = ref('');
  const showExtras        = ref(true);
  const showOvertime      = ref(true);
  const showExtrasMessage   = ref(false);
  const showOvertimeMessage = ref(false);

  useAutosaveMeta(meta, timesheetId);
  const { queueSaveRow } = useAutosaveRows(rows, timesheetId);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

  const setStatus = (type, msg, duration = 3000) => {
    statusType.value    = type;
    statusMessage.value = msg;
    setTimeout(() => { statusMessage.value = ''; statusType.value = ''; }, duration);
  };

  const setR = (id, key, val) => {
    const idx = rows.value.findIndex(r => r.id === id);
    if (idx !== -1) rows.value[idx][key] = val;
    queueSaveRow(id);
  };

  const removeRow = async (id) => {
    try {
      if (typeof id === 'string' && id.startsWith('tmp_')) {
        rows.value = rows.value.filter(r => r.id !== id);
        return;
      }
      await api.delete(`/api/timesheet/timesheets/${timesheetId.value}/rows/${id}`);
      rows.value = rows.value.filter(r => r.id !== id);
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const createAndSaveRow = async (metaData, clearForm = false, realTimesheetId = null) => {
    const effectiveId = realTimesheetId ?? timesheetId.value;
    try {
      const payload = {
        row_no: (rows.value?.length || 0) + 1,
        status: 'Luotu',
        project: metaData.project || null,
        pvm: metaData.pvm || null,
        klo_alku: metaData.klo_alku || null,
        klo_loppu: metaData.klo_loppu || null,
        norm: Number(metaData.norm || 0),
        lisat_la: Number(metaData.lisatLa || 0),
        lisat_su: Number(metaData.lisatSu || 0),
        lisat_ilta: Number(metaData.lisatIlta || 0),
        lisat_yo: Number(metaData.lisatYo || 0),
        ylityo_vrk_50: Number(metaData.ylityoVrk50 || 0),
        ylityo_vrk_100: Number(metaData.ylityoVrk100 || 0),
        ylityo_vko_50: Number(metaData.ylityoVko50 || 0),
        ylityo_vko_100: Number(metaData.ylityoVko100 || 0),
        atv: Number(metaData.atv || 0),
        matk: Number(metaData.matk || 0),
        paivaraha: ['ei', 'osa', 'koko'].includes(metaData.paivaraha) ? metaData.paivaraha : 'ei',
        ateriakorvaus: Number(metaData.ateriakorvaus || 0),
        km: Number(metaData.km || 0),
        tyokalukorvaus: Number(metaData.tyokalukorvaus || 0),
        km_selite: metaData.km_selite || '',
        huom: metaData.huom || '',
        memo: metaData.memo || '',
      };

      const created    = await api.post(`/api/timesheet/timesheets/${effectiveId}/rows`, payload);
      const createdPayload = unwrap(created);
      const newRow     = fromApiRow(Array.isArray(createdPayload) ? createdPayload[0] : createdPayload);
      rows.value.push(newRow);

      setStatus('success', t('successSendForm'));

      if (clearForm) {
        const clearFields = [
          'project','pvm','klo_alku','klo_loppu','norm',
          'lisatLa','lisatSu','lisatIlta','lisatYo',
          'ylityoVrk50','ylityoVrk100','ylityoVko50','ylityoVko100',
          'atv','matk','paivaraha','ateriakorvaus','km','tyokalukorvaus',
          'km_selite','huom','memo',
        ];
        clearFields.forEach(f => { meta[f] = f === 'paivaraha' ? 'ei' : ''; });
      }
    } catch (err) {
      setStatus('error', t('errorSendForm'), 4000);
      if (err.response?.data?.errors) console.log('Validation errors:', err.response.data.errors);
    }
  };

  const handleSubmit = async () => {
    submitted.value = true;
    const missingRequired =
      !meta.nimi || !meta.tyontekija || !meta.ammattinimike ||
      !meta.project || !meta.pvm || !meta.klo_alku || !meta.klo_loppu ||
      meta.norm === '' || Number(meta.norm) <= 0;

    if (missingRequired) {
      setStatus('error', t('errorSendForm'), 4000);
      return;
    }

    let id = timesheetId.value;
    if (!id) {
      id = await createTimesheet();
      if (!id) return;
    }

    await createAndSaveRow(meta, true, id);
    submitted.value = false;
  };

  const clearAll = () => {
    const userFields = [
      'project','pvm','klo_alku','klo_loppu','norm',
      'lisatLa','lisatSu','lisatIlta','lisatYo',
      'ylityoVrk50','ylityoVrk100','ylityoVko50','ylityoVko100',
      'atv','matk','paivaraha','ateriakorvaus','km','tyokalukorvaus',
      'km_selite','huom','memo',
    ];

    const isEmpty = userFields.every(f => {
      const v = meta[f];
      return v === '' || v === 0 || v === null || v === undefined || (f === 'paivaraha' && v === 'ei');
    });

    if (isEmpty) { setStatus('info', t('emptyClearForm'), 4000); return; }

    userFields.forEach(f => {
      meta[f] = f === 'paivaraha' ? 'ei' : f === 'pvm' ? undefined : '';
    });
    setStatus('success', t('successClearForm'), 4000);
  };

  const addRow = async () => {
    let id = timesheetId.value;
    if (!id && createTimesheet) {
      id = await createTimesheet();
      if (!id) return;
    }
    await createAndSaveRow(meta, false);
  };

  const handleMetaChange = (field, value) => {
    if (meta.klo_alku && meta.klo_loppu && field === 'klo_loppu' && meta.klo_alku > value) {
      setStatus('danger', t('timeValidationMessage'));
      return;
    }
    meta[field] = value;
  };

  const toggleExtras = () => {
    showExtras.value = !showExtras.value;
    showExtrasMessage.value = true;
    setTimeout(() => { showExtrasMessage.value = false; }, 4000);
  };

  const toggleOvertime = () => {
    showOvertime.value = !showOvertime.value;
    showOvertimeMessage.value = true;
    setTimeout(() => { showOvertimeMessage.value = false; }, 4000);
  };

  return {
    submitted, statusMessage, statusType,
    showExtras, showOvertime, showExtrasMessage, showOvertimeMessage,
    setR, removeRow, addRow, handleSubmit, clearAll,
    toggleExtras, toggleOvertime, handleMetaChange,
  };
}