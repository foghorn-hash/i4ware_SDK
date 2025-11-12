import { useEffect, useRef } from "react";
import { api } from "./useAuthToken";
import { toApiRow } from "../utils/helpers";

/** === meta-autosave (debounce) === */
export const useAutosaveMeta = (meta, timesheetId) => {
const metaTimer = useRef(null);

    useEffect(() => {
        if (!timesheetId) return;

        if (metaTimer.current) clearTimeout(metaTimer.current);

        metaTimer.current = setTimeout(async () => {
            try {
                await api.put(`/api/timesheet/timesheets/${timesheetId}`, {
                    nimi: meta.nimi,
                    tyontekija: meta.tyontekija,
                    ammattinimike: meta.ammattinimike,
                });
            } catch (e) {
                console.error("Meta save failed", e);
            }
        }, 1800);

        return () => {
            if (metaTimer.current) clearTimeout(metaTimer.current);
        };
    }, [meta, timesheetId]);
}
    
/** === AUTOSAVE ROWS === */
export const useAutosaveRows = (rows, timesheetId, userId) => {

    const saveTimers = useRef({});

    const queueSaveRow = (rowId) => {
        if (!timesheetId) return;

        if (saveTimers.current[rowId]) clearTimeout(saveTimers.current[rowId]);

        saveTimers.current[rowId] = setTimeout(async () => {
            try {
            const r = rows.find(x => x.id === rowId);
            if (!r) return;
        
            const payload = toApiRow(r, userId, timesheetId);
            await api.put(`/api/timesheet/timesheets/${timesheetId}/rows/${r.id}`, payload);
            } catch (e) {
            console.error("Row save failed", e);
            }
        }, 1000); // lyhyt debounce
    };

    useEffect(() => {
        return () => {
            Object.values(saveTimers.current).forEach(clearTimeout);
        };
    }, []);

    return { queueSaveRow };
}