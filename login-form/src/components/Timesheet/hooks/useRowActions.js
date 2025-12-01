import { useState } from "react";
import { api } from "./useAuthToken";
import { fromApiRow } from "../utils/helpers";
import { useAutosaveRows, useAutosaveMeta } from "./useAutosave";

export const useRowActions = (
    timesheetId, 
    timesheet,
    rows, 
    setRows, 
    userId,
    meta, 
    setMeta, 
    strings,
) => {
    const [submitted, setSubmitted] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');
    const [showExtras, setShowExtras] = useState(true);
    const [showOvertime, setShowOvertime] = useState(true);
    const [showExtrasMessage, setShowExtrasMessage] = useState(false);
    const [showOvertimeMessage, setShowOvertimeMessage] = useState(false);
    
    useAutosaveMeta(meta, timesheetId);
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
    
        setStatusType('success');
        setStatusMessage(strings.successSendForm);
        setTimeout(() => setStatusMessage(''), 3000);
    
        if (clearForm) {
            setMeta(prev => ({
                ...prev,
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
            }));
        }
    
        } catch (err) {
            // console.error('Rivin lisääminen ei onnistunut:', err);
            setStatusType('error');
            setStatusMessage(strings.errorSendForm);
        setTimeout(() => setStatusMessage(''), 4000);

        if (err.response?.data?.errors) {
            console.log('Validation errors:', err.response.data.errors);
        }
            setStatusMessage(strings.errorSend);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    
    const missingRequired =
        !meta.nimi ||
        !meta.tyontekija ||
        !meta.ammattinimike ||
        !meta.project ||
        !meta.pvm ||
        !meta.klo_alku ||
        !meta.klo_loppu ||
        meta.norm === "" ||
        Number(meta.norm) <= 0;
    
    if (missingRequired) {
        setStatusType('error');
        setStatusMessage(strings.errorSendForm);

        setTimeout(() => {
            setStatusMessage('');
            setStatusType('');
        }, 4000);
        return;
    }
    
    // jos kaikki kunnossa – luodaan rivi
        createAndSaveRow(meta, true); // true = tyhjentää lomakkeen lähetyksen jälkeen
        setSubmitted(false);
    };
    
    const clearAll = async () => {

        const userFields = [
            'project', 'pvm', 'klo_alku', 'klo_loppu', 'norm',
            'lisatLa', 'lisatSu', 'lisatIlta', 'lisatYo',
            'ylityoVrk50', 'ylityoVrk100', 'ylityoVko50', 'ylityoVko100',
            'atv', 'matk', 'paivaraha', 'ateriakorvaus',
            'km', 'tyokalukorvaus', 'km_selite', 'huom', 'memo'
        ];

        try {
            const currentMeta = {};
            userFields.forEach(f => {
                const val = meta[f];
                currentMeta[f] = val === undefined || val === null ? '' : val;
            });

            const emptyValues = {
                paivaraha: 'ei', 
            };
    
            const isEmpty = userFields.every(field => {
                const val = meta[field];
                return val === '' || val === 0 || val === null || val === undefined || val === emptyValues[field];
            });
    
            if (isEmpty) {
                setStatusType('info');
                setStatusMessage(strings.emptyClearForm);
    
                setTimeout(() => {
                    setStatusMessage('');
                    setStatusType('');
                }, 4000);
                return;
            }
        
            const clearedMeta = {};
                userFields.forEach(field => {
                clearedMeta[field] = field === 'pvm' ? undefined : field === 'klo_alku' || field === 'klo_loppu' ? null : '';
            });

            // tyhjennä lomakkeen meta-tiedot
            setMeta(prev => ({
                ...prev,
                ...clearedMeta
            }));
    
            setStatusType('success');
            setStatusMessage(strings.successClearForm);

            setTimeout(() => {
                setStatusMessage('');
                setStatusType('');
            }, 4000);

        } catch (e) {
            setStatusType('error');
            setStatusMessage(strings.errorClearForm);

            setTimeout(() => {
                setStatusMessage('');
                setStatusType('');
            }, 4000);
        }
    };

    const toggleExtras = () => {
        setShowExtras(s => !s);
        setShowExtrasMessage(true);
        setTimeout(() => setShowExtrasMessage(false), 4000); 
    };

    const toggleOvertime = () => {
        setShowOvertime(s => !s);
        setShowOvertimeMessage(true);
        setTimeout(() => setShowOvertimeMessage(false), 4000);
    };

    const addRow = () => createAndSaveRow(meta, false);

    const handleMetaChange = (field, value) => {
        const updated = { ...meta, [field]: value };
    
        if (updated.klo_alku && updated.klo_loppu) {
            if (updated.klo_alku > updated.klo_loppu) {
                setStatusMessage(strings.timeValidationMessage);
                setStatusType("danger");
                return; 
            } else {
                setStatusMessage("");
            }
        }
    
        setMeta(updated);
    };

    return {
        unwrap,
        setR,
        removeRow,
        addRow,
        createAndSaveRow,
        submitted,
        statusMessage,
        statusType,
        handleSubmit,
        clearAll,
        toggleExtras,
        toggleOvertime,
        showExtras,
        showOvertime,
        showExtrasMessage,
        showOvertimeMessage,
        setStatusMessage,
        setStatusType,
        setSubmitted,
        handleMetaChange,
    };
}