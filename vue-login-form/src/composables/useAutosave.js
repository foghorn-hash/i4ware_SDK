import { watch, ref } from 'vue';
import { api } from './useTimesheetApi';
import { toApiRow } from '../utils/timesheetHelpers';

export function useAutosaveMeta(meta, timesheetId) {
  let metaTimer = null;

  watch(meta, () => {
    if (!timesheetId.value) return;
    if (metaTimer) clearTimeout(metaTimer);
    metaTimer = setTimeout(async () => {
      try {
        if (!meta.nimi && !meta.tyontekija && !meta.ammattinimike) return;
        await api.put(`/api/timesheet/timesheets/${timesheetId.value}`, {
          nimi: meta.nimi ?? '',
          tyontekija: meta.tyontekija ?? '',
          ammattinimike: meta.ammattinimike ?? '',
        });
      } catch (e) {
        console.error('Meta save failed', e);
      }
    }, 1800);
  }, { deep: true });
}

export function useAutosaveRows(rows, timesheetId) {
  const saveTimers = {};

  const queueSaveRow = (rowId) => {
    if (!timesheetId.value) return;
    if (saveTimers[rowId]) clearTimeout(saveTimers[rowId]);
    saveTimers[rowId] = setTimeout(async () => {
      try {
        const r = rows.value.find(x => x.id === rowId);
        if (!r) return;
        await api.put(`/api/timesheet/timesheets/${timesheetId.value}/rows/${r.id}`, toApiRow(r, r.row_no));
      } catch (e) {
        console.error('Row save failed', e);
      }
    }, 1000);
  };

  return { queueSaveRow };
}