import { api } from "./useAuthToken";
import { fromApiRow } from "../utils/helpers";
import { useAutosaveRows } from "./useAutosave";

export const useRowActions = (
    timesheetId, 
    rows, 
    setRows, 
    userId, 
    meta, 
    setMeta, 
    setStatusMessage, 
    strings) => {
    
    const { queueSaveRow } = useAutosaveRows(rows, timesheetId, userId);

    const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

    /** === UI actions bound to API === */
    const setR = (id, key, val) => {
        setRows(prev => {
        const next = prev.map(r => r.id===id ? { ...r, [key]: val } : r);
        return next;
        });
        queueSaveRow(id);
    };

    const removeRow = async (id) => {
        try {
          // jos tmp-riviä ei ole serverillä, poista vain lokaalista
          if (typeof id === 'string' && id.startsWith('tmp_')) {
            setRows(prev => prev.filter(r => r.id !== id));
            return;
          }
          await api.delete(`/api/timesheet/timesheets/${timesheetId}/rows/${id}`);
          setRows(prev => prev.filter(r => r.id !== id));
        } catch (e) {
          console.error("Delete failed", e);
        }
    };

    /** === server-sync helpers === */
    const createAndSaveRow = async (metaData, clearForm = false) => {
        
        if (!timesheetId) {
            setStatusMessage('Timesheet ei ole vielä valmis');
        return;
        }
    
        try {
        // luo payload serveriä varten
        const payload = {
            user_id: Number(userId),
            timesheet_id: Number(timesheetId),
            row_no: (rows?.length || 0) + 1,
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
            paivaraha: ['ei','osa','koko'].includes(metaData.paivaraha) ? metaData.paivaraha : 'ei',
            ateriakorvaus: Number(metaData.ateriakorvaus || 0),
            km: Number(metaData.km || 0),
            tyokalukorvaus: Number(metaData.tyokalukorvaus || 0),
            km_selite: metaData.km_selite || "",
            huom: metaData.huom || "",
            memo: metaData.memo || "",
        };
    
        // POST serveriin — backend luo id
        const created = await api.post(`/api/timesheet/timesheets/${timesheetId}/rows`, payload);
        const createdPayload = unwrap(created);
        const newRow = fromApiRow(Array.isArray(createdPayload) ? createdPayload[0] : createdPayload);
    
        // lisää lokaalisesti rows
        setRows(prev => [...prev, newRow]);
    
        setStatusMessage(strings.successSendForm);
        setTimeout(() => setStatusMessage(''), 3000);
    
        if (clearForm) {
            setMeta({
                project: '',
                pvm: '',
                klo_alku: '',
                klo_loppu: '',
                norm: '',
                lisatLa: '',
                lisatSu: '',
                lisatIlta: '',
                lisatYo: '',
                ylityoVrk50: '',
                ylityoVrk100: '',
                ylityoVko50: '',
                ylityoVko100: '',
                atv: '',
                matk: '',
                paivaraha: '',
                ateriakorvaus: '',
                km: '',
                tyokalukorvaus: '',
                km_selite: '',
                huom: '',
                memo: ''
            });
        }
    
        } catch (err) {
            console.error('Rivin lisääminen ei onnistunut:', err);
        if (err.response?.data?.errors) {
            console.log('Validation errors:', err.response.data.errors);
        }
        setStatusMessage(strings.errorSend);
        setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    const addRow = () => createAndSaveRow(meta, false);

    return { unwrap, removeRow, setR, addRow, createAndSaveRow };
}