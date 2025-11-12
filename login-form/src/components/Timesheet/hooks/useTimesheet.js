import { useEffect, useState } from "react";
import { api } from "./useAuthToken";
import { fromApiRow, makeRow } from "../utils/helpers";

export const useTimesheet = (userId, authToken) => {
    const [timesheetId, setTimesheetId] = useState(null);
    const [rows, setRows] = useState(() => Array.from({ length: 0 }, (_, i) => makeRow(i + 1)));
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

    /** === INIT: varmista tuntikortti + lataa rivit === */
    useEffect(() => {
    if (!authToken) {
        // console.log("⏳ Odotetaan tokenia ennen init()");
        return;
    }

    (async () => {
        try {
        // console.log("🚀 INIT alkaa, token:", authToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        // 1️⃣ Hae viimeisin timesheet
        const res = await api.get('/api/timesheet/timesheets', {
            params: { user_id: userId, per_page: 1, order_by: 'created_at desc' }
        });

        const data = res.data?.data ?? res.data;
        const ts = Array.isArray(data) ? data[0] : data;

        let timesheet = ts;
        if (!timesheet?.id) {
            // 2️⃣ Jos ei löydy, luodaan uusi
            const createRes = await api.post('/api/timesheet/timesheets', {
            user_id: userId,
            nimi: '',
            tyontekija: '',
            ammattinimike: '',
            status: 'Luotu',
            domain: '',
            });
            timesheet = createRes.data;
        }

        if (!timesheet?.id) {
            // console.error("❌ Ei saatu timesheet-id:tä API:sta");
            return;
        }

        // console.log("✅ Löytyi timesheet:", timesheet.id);
        setTimesheetId(timesheet.id);

        // 3️⃣ Päivitä metatiedot
        setMeta(prev => ({
            ...prev,
            nimi: timesheet.nimi ?? prev.nimi,
            tyontekija: timesheet.tyontekija ?? prev.tyontekija,
            ammattinimike: timesheet.ammattinimike ?? prev.ammattinimike ?? ''
        }));

        // 4️⃣ Lataa rivit
        const rowsRes = await api.get(`/api/timesheet/timesheets/${timesheet.id}/rows`);
        const rowData = rowsRes.data?.data ?? rowsRes.data ?? [];
        setRows(rowData.map(fromApiRow));

        // console.log("✅ INIT valmis — rivit ladattu:", rowData.length);
        } catch (err) {
        // console.error("❌ INIT epäonnistui:", err);
        }
    })();
    }, [authToken, userId]); // käynnistyy heti, kun token oikeasti on asetettu  

    return { timesheetId, rows, setRows, meta, setMeta };
}