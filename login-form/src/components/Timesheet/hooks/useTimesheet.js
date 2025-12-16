import { useEffect, useState } from "react";
import { api } from "./useAuthToken";
import { fromApiRow, makeRow } from "../utils/helpers";

export const useTimesheet = (authToken) => {
    const [timesheet, setTimesheet] = useState(null);
    const [rows, setRows] = useState(() => []);
    const [meta, setMeta] = useState({
        nimi: '',
        tyontekija: '',
        ammattinimike: '',
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
        paivaraha: 'ei',
        ateriakorvaus: '',
        km: '',
        tyokalukorvaus: '',
        km_selite: '',
        huom: '',
        memo: ''
    });

    const createTimesheet = async () => {
        if (timesheet?.id) return timesheet.id; // if id exist - return

        try {
            const payload = {
                nimi: meta.nimi,
                tyontekija: meta.tyontekija,
                ammattinimike: meta.ammattinimike,
                status: 'Luotu',
                domain: meta.domain
            };            

            const res = await api.post('/api/timesheet/timesheets', payload);
            const ts = res.data?.data ?? res.data;

            setTimesheet(ts);

            return ts.id;
        } catch (err) {
            console.error('Timesheet creation failed:', err);
            if (err.response?.data?.errors) {
                console.log('Validation errors:', err.response.data.errors);
            }
            return null;
        }
    };

    useEffect(() => {
        if (!authToken) return;

        (async () => {
            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

                // 1) Hae viimeisin timesheet
                const res = await api.get('/api/timesheet/timesheets', {
                    params: { per_page: 1, order_by: 'created_at desc' }
                });

                const data = res.data?.data ?? res.data;
                let ts = Array.isArray(data) ? data[0] : data;

                // 2) Jos ei löydy, käyttää createTimesheet
                if (!ts?.id) {
                    setTimesheet(null);
                    return;
                }
                
                setTimesheet(ts);

                // 3) Päivitä meta
                setMeta(prev => ({
                    nimi: ts.nimi ?? prev.nimi,
                    tyontekija: ts.tyontekija ?? prev.tyontekija,
                    ammattinimike: ts.ammattinimike ?? prev.ammattinimike,
                    domain: ts.domain || prev.domain
                }));

                // 4) Lataa rivit, jos on id
                if (!ts.id) return;

                const rowsRes = await api.get(`/api/timesheet/timesheets/${ts.id}/rows`);
                const rowData = rowsRes.data?.data ?? rowsRes.data ?? [];
                setRows(rowData.map(fromApiRow));

            } catch (err) {
                console.error("INIT failed:", err);
            }
        })();
    }, [authToken]);

    return {
        timesheet,
        timesheetId: timesheet?.id ?? null,
        rows,
        setRows,
        meta,
        setMeta,
        createTimesheet 
    };
};
