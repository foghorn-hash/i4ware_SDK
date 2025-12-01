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

                // 2) Jos ei löydy, luodaan uusi
                if (!ts?.id) {
                    const createRes = await api.post('/api/timesheet/timesheets', {
                        nimi: '',
                        tyontekija: '',
                        ammattinimike: '',
                        status: 'Luotu',
                        domain: '',
                    });
                    ts = createRes.data;
                }

                setTimesheet(ts);

                // 3) Päivitä meta
                setMeta(prev => ({
                    ...prev,
                    nimi: ts.nimi ?? '',
                    tyontekija: ts.tyontekija ?? '',
                    ammattinimike: ts.ammattinimike ?? ''
                }));

                // 4) Lataa rivit
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
        userId: timesheet?.user_id ?? null,
        rows,
        setRows,
        meta,
        setMeta
    };
};
