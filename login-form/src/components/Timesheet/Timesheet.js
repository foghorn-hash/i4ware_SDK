import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Table, Form, Button, Card } from 'react-bootstrap';
import './Timesheet.css';
import { API_BASE_URL,  API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { LanguageContext } from "../../LanguageContext";

/** === API setup === */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" } // НЕ ставим Authorization здесь
});

function getStoredToken() {
  try {
    const raw = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (!raw) return null;

    // Если это JSON (объект) — попробуем распарсить и взять поле token
    try {
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      // возможные имена поля: token, access_token, authToken
      return parsed.token ?? parsed.access_token ?? parsed.authToken ?? null;
    } catch (err) {
      // не JSON — возможно это уже «чистая» строка токена
      return raw;
    }
  } catch (e) {
    console.error("getStoredToken error", e);
    return null;
  }
}

const unwrap = (res) => {
  return res?.data?.data ?? res?.data ?? res;
};

/** === helpers: camelCase <-> snake_case === */
const toApiRow = (r, userId, timesheetId, rowNo) => ({
  user_id: userId,
  timesheet_id: timesheetId,
  row_no: rowNo,
  status: r.status,
  project: r.project || null,
  pvm: r.pvm || null,
  klo_alku: r.klo_alku || null,
  klo_loppu: r.klo_loppu || null,
  norm: Number(r.norm || 0),
  lisat_la: Number(r.lisatLa || 0),
  lisat_su: Number(r.lisatSu || 0),
  lisat_ilta: Number(r.lisatIlta || 0),
  lisat_yo: Number(r.lisatYo || 0),
  ylityo_vrk_50: Number(r.ylityoVrk50 || 0),
  ylityo_vrk_100: Number(r.ylityoVrk100 || 0),
  ylityo_vko_50: Number(r.ylityoVko50 || 0),
  ylityo_vko_100: Number(r.ylityoVko100 || 0),
  atv: Number(r.atv || 0),
  matk: Number(r.matk || 0),
  paivaraha: r.paivaraha || 'ei',
  ateriakorvaus: Number(r.ateriakorvaus || 0),
  km: Number(r.km || 0),
  tyokalukorvaus: Number(r.tyokalukorvaus || 0),
  km_selite: r.km_selite || "",
  huom: r.huom || "",
  memo: r.memo || "",
});

const fromApiRow = (r) => ({
  id: r.id,                  // käytetään serverin id:tä rivin tunnisteena
  row_no: r.row_no ?? 0,
  status: r.status,
  project: r.project ?? "",
  pvm: r.pvm ?? "",
  klo_alku: r.klo_alku ?? "00:00",
  klo_loppu: r.klo_loppu ?? "00:00",
  norm: Number(r.norm ?? 0),
  lisatLa: Number(r.lisat_la ?? 0),
  lisatSu: Number(r.lisat_su ?? 0),
  lisatIlta: Number(r.lisat_ilta ?? 0),
  lisatYo: Number(r.lisat_yo ?? 0),
  ylityoVrk50: Number(r.ylityo_vrk_50 ?? 0),
  ylityoVrk100: Number(r.ylityo_vrk_100 ?? 0),
  ylityoVko50: Number(r.ylityo_vko_50 ?? 0),
  ylityoVko100: Number(r.ylityo_vko_100 ?? 0),
  atv: Number(r.atv ?? 0),
  matk: Number(r.matk ?? 0),
  paivaraha: r.paivaraha ?? "ei",
  ateriakorvaus: Number(r.ateriakorvaus ?? 0),
  km: Number(r.km ?? 0),
  tyokalukorvaus: Number(r.tyokalukorvaus ?? 0),
  km_selite: r.km_selite ?? "",
  huom: r.huom ?? "",
  memo: r.memo ?? "",
});

/** === tee uusi lokaali rivi kun lisäät + ennen serveriä === */
const makeRow = (id) => ({
  id,
  status: 'Luotu',
  project: '',
  pvm: '',
  klo_alku: '00:00',
  klo_loppu: '00:00',
  norm: 0,
  lisatLa: 0,
  lisatSu: 0,
  lisatIlta: 0,
  lisatYo: 0,
  ylityoVrk50: 0,
  ylityoVrk100: 0,
  ylityoVko50: 0,
  ylityoVko100: 0,
  atv: 0,
  matk: 0,
  paivaraha: 'ei',
  ateriakorvaus: 0,
  km: 0,
  tyokalukorvaus: 0,
  km_selite: '',
  huom: '',
  memo: '',
});

export default function Timesheet() {

  const CURRENT_USER_ID = 1; // hae oikeasti authista
  const [timesheetId, setTimesheetId] = useState(null);
  const { strings } = useContext(LanguageContext); //käännös

  // --- NEW: track token in state so effects can re-run when token appears/changes
  const [authToken, setAuthToken] = useState(() => getStoredToken());

  // whenever authToken is set in state, ensure axios has header
  useEffect(() => {
    if (authToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      console.log("✅ api Authorization set to JWT (first 20 chars):", authToken?.slice?.(0,20) + "...");
    } else {
      delete api.defaults.headers.common["Authorization"];
      console.log("ℹ️ api Authorization removed");
    }
  }, [authToken]);

  // listen storage events so authToken updates when login happens in other window/tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === ACCESS_TOKEN_NAME) {
        setAuthToken(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Helper: also expose a global event listener so your login flow can dispatch
  // window.dispatchEvent(new Event('auth:changed')) after setting localStorage, if you want.
  useEffect(() => {
    const onAuthChanged = () => setAuthToken(localStorage.getItem(ACCESS_TOKEN_NAME));
    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, []);

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

  const [rows, setRows] = useState(() => Array.from({ length: 0 }, (_, i) => makeRow(i + 1)));

  const [showExtras, setShowExtras] = useState(true);
  const [showOvertime, setShowOvertime] = useState(true);
  const [showExtrasMessage, setShowExtrasMessage] = useState(false);
  const [showOvertimeMessage, setShowOvertimeMessage] = useState(false);

  const saveTimers = useRef({}); // debounce per rowId
  const metaTimer = useRef(null);

    /** === varmista että api käyttää oikeaa tokenia === */
    useEffect(() => {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("✅ Authorization header asetettu");
        setAuthToken(token); // <-- tämä on tärkein, triggeraa initin
      } else {
        console.warn("⚠️ Ei tokenia localStoragessa — käyttäjä ei ole kirjautunut sisään?");
      }
    }, []); // vain kerran mountissa
  
    /** === INIT: varmista tuntikortti + lataa rivit === */
    useEffect(() => {
      if (!authToken) {
        console.log("⏳ Odotetaan tokenia ennen init()");
        return;
      }
  
      (async () => {
        try {
          console.log("🚀 INIT alkaa, token:", authToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  
          // 1️⃣ Hae viimeisin timesheet
          const res = await api.get('/api/timesheet/timesheets', {
            params: { user_id: CURRENT_USER_ID, per_page: 1, order_by: 'created_at desc' }
          });
  
          const data = res.data?.data ?? res.data;
          const ts = Array.isArray(data) ? data[0] : data;
  
          let timesheet = ts;
          if (!timesheet?.id) {
            // 2️⃣ Jos ei löydy, luodaan uusi
            const createRes = await api.post('/api/timesheet/timesheets', {
              user_id: CURRENT_USER_ID,
              nimi: '',
              tyontekija: '',
              ammattinimike: '',
              status: 'Luotu',
              domain: '',
            });
            timesheet = createRes.data;
          }
  
          if (!timesheet?.id) {
            console.error("❌ Ei saatu timesheet-id:tä API:sta");
            return;
          }
  
          console.log("✅ Löytyi timesheet:", timesheet.id);
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
  
          console.log("✅ INIT valmis — rivit ladattu:", rowData.length);
        } catch (err) {
          console.error("❌ INIT epäonnistui:", err);
        }
      })();
    }, [authToken]); // käynnistyy heti, kun token oikeasti on asetettu  

  useEffect(() => {
    if (!timesheetId) {
      console.log("⏳ Waiting for timesheetId...");
      return;
    }
  
    (async () => {
      try {
        const res = await api.get(`/api/timesheet/timesheets/${timesheetId}/rows`);
        const rawRows = Array.isArray(unwrap(res)) ? unwrap(res) : [];
        setRows(rawRows.map(fromApiRow));
        console.log("✅ Rows loaded:", rawRows.length, "for timesheet", timesheetId);
      } catch (e) {
        console.error("❌ Failed to fetch rows", e);
      }
    })();
  }, [timesheetId]);
  

  /** === meta-autosave (debounce) === */
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
  }, [meta, timesheetId]);

  /** === totals === */
  const totals = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return {
      norm:0, lisatLa:0, lisatSu:0, lisatIlta:0, lisatYo:0,
      ylityoVrk50:0, ylityoVrk100:0, ylityoVko50:0, ylityoVko100:0,
      atv:0, matk:0, ateriakorvaus:0, km:0, tyokalukorvaus:0
    };
    
    return rows.reduce((acc, r) => ({
      norm: acc.norm + Number(r.norm||0),
      lisatLa: acc.lisatLa + Number(r.lisatLa||0),
      lisatSu: acc.lisatSu + Number(r.lisatSu||0),
      lisatIlta: acc.lisatIlta + Number(r.lisatIlta||0),
      lisatYo: acc.lisatYo + Number(r.lisatYo||0),
      ylityoVrk50: acc.ylityoVrk50 + Number(r.ylityoVrk50||0),
      ylityoVrk100: acc.ylityoVrk100 + Number(r.ylityoVrk100||0),
      ylityoVko50: acc.ylityoVko50 + Number(r.ylityoVko50||0),
      ylityoVko100: acc.ylityoVko100 + Number(r.ylityoVko100||0),
      atv: acc.atv + Number(r.atv||0),
      matk: acc.matk + Number(r.matk||0),
      ateriakorvaus: acc.ateriakorvaus + Number(r.ateriakorvaus||0),
      km: acc.km + Number(r.km||0),
      tyokalukorvaus: acc.tyokalukorvaus + Number(r.tyokalukorvaus||0),
    }), {
      norm:0, lisatLa:0, lisatSu:0, lisatIlta:0, lisatYo:0,
      ylityoVrk50:0, ylityoVrk100:0, ylityoVko50:0, ylityoVko100:0,
      atv:0, matk:0, ateriakorvaus:0, km:0, tyokalukorvaus:0
    });
  }, [rows]);
  
  /** === server-sync helpers === */
  const createAndSaveRow = async (metaData, clearForm = false) => {
    if (!timesheetId) {
      setStatusMessage('Timesheet ei ole vielä valmis');
      return;
    }
  
    try {
      // luo payload serveriä varten
      const payload = {
        user_id: Number(CURRENT_USER_ID),
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
  
  const queueSaveRow = (rowId) => {
    if (!timesheetId) return;
    if (saveTimers.current[rowId]) clearTimeout(saveTimers.current[rowId]);
    saveTimers.current[rowId] = setTimeout(async () => {
      try {
        const r = rows.find(x => x.id === rowId);
        if (!r) return;
  
        const payload = toApiRow(r, CURRENT_USER_ID, timesheetId);
        await api.put(`/api/timesheet/timesheets/${timesheetId}/rows/${r.id}`, payload);
      } catch (e) {
        console.error("Row save failed", e);
      }
    }, 1000); // lyhyt debounce
  };

  /** === UI actions bound to API === */
  const setR = (id, key, val) => {
    setRows(prev => {
      const next = prev.map(r => r.id===id ? { ...r, [key]: val } : r);
      return next;
    });
    queueSaveRow(id);
  };

  const [statusMessage, setStatusMessage] = useState('');

  const addRow = () => createAndSaveRow(meta, false);
  
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

  const clearAll = async () => {
    try {
  
      // tyhjennä lomakkeen meta-tiedot
      setMeta(prev => ({
        ...prev,
        project: '',
        pvm: undefined,
        klo_alku: null,
        klo_loppu: null,
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
  
      setStatusMessage(strings.successClearForm);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e) {
      console.error("Clear failed", e);
      setStatusMessage(strings.errorClearForm);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  /** === Numero-input joka forwardaa style ym. === */
  const Num = ({ value, onChange, step = 0.25, min = 0, max = 999.99, placeholder, style, className, required = false, ...rest }) => {
    const [error, setError] = React.useState('');
  
    const handleChange = (e) => {
      let val = Number(e.target.value || 0);
  
      if (val > max) {
        setError('Liian iso luku');
        return;
      } else if (val < min) {
        setError(`Ei voi olla pienempi kuin ${min}`);
        return;
      } else {
        setError('');
      }
  
      onChange(val);
    };
  
    return (
      <div>
        <Form.Control
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          size="sm"
          style={style}
          className={className}
          required={required}
          {...rest}
        />
        {error && <Form.Text className="text-danger">{error}</Form.Text>}
      </div>
    );
  };  

  const NumberValidator = ({ value, min = 0.1, max = 999.99 }) => {
    const { strings } = useContext(LanguageContext); 
  
    if (value === '' || value === null) return null;
  
    const val = Number(value);
  
    if (val < min) {
      return <Form.Text className="text-danger">{strings.messageTooSmall}</Form.Text>;
    }
  
    if (val > max) {
      return <Form.Text className="text-danger">{strings.messageTooBig}</Form.Text>;
    }
  
    return null;
  };

  const [submitted, setSubmitted] = useState(false);

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
      setStatusMessage(strings.successErrorForm);
      setTimeout(() => setStatusMessage(''), 4000);
      return;
    }
  
    // jos kaikki kunnossa – luodaan rivi
    createAndSaveRow(meta, true); // true = tyhjentää lomakkeen lähetyksen jälkeen
    setSubmitted(false);
  };

  const toggleExtras = () => {
    setShowExtras(s => !s);
    setShowExtrasMessage(true);
    //jos haluaa aikarajan -> setShowExtrasMessage(false), 4000);
    setTimeout(() => setShowExtrasMessage(true)); 
  };

  const toggleOvertime = () => {
    setShowOvertime(s => !s);
    setShowOvertimeMessage(true);
    setTimeout(() => setShowOvertimeMessage(true));
  };

  /* ====== TÄSTÄ ALASPÄIN: sinun alkuperäinen renderöinti (lyhennetty header…) ====== */
  return (
    <Container fluid className="tcontainer py-4 bg-dark min-vh-100">
      <Container style={{maxWidth: 1600}}>
        <Card className="shadow-sm mb-3">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.timesheetNameLabel}</Form.Label>
                    <Form.Control 
                      value={meta.nimi} 
                      onChange={e=>setMeta({...meta, nimi:e.target.value})} 
                      placeholder={strings.timesheetNamePlaceholder}
                    /> 
                   {submitted && !meta.nimi && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.employeeLabel}</Form.Label>
                    <Form.Control 
                      value={meta.tyontekija} 
                      onChange={e=>setMeta({...meta, tyontekija:e.target.value})} 
                      placeholder={strings.employeePlaceholder}
                    />
                    {submitted && !meta.tyontekija && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.jobTitleLabel}</Form.Label>
                    <Form.Control 
                      value={meta.ammattinimike} 
                      onChange={e=>setMeta({...meta, ammattinimike:e.target.value})} 
                      placeholder={strings.jobTitlePlaceholder}
                    />
                    {submitted && !meta.ammattinimike && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <hr></hr>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.projectLabel}</Form.Label>
                    <Form.Control 
                      value={meta.project} 
                      onChange={e=>setMeta({...meta, project:e.target.value})} 
                      placeholder={strings.projectPlaceholder}
                    />
                    {submitted && !meta.project && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.dateLabel}</Form.Label>
                    <Form.Control 
                      type="date" 
                      key={`pvm-${meta.pvm}`}
                      value={meta.pvm} 
                      onChange={e=>setMeta({...meta, pvm:e.target.value})}
                    />
                    {submitted && !meta.pvm && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.startTimeLabel}</Form.Label>
                    <Form.Control 
                      className="flex-grow-1"
                      type="time"
                      key={`klo_alku-${meta.klo_alku}`}
                      value={meta.klo_alku || ''} 
                      onChange={e => setMeta({ ...meta, klo_alku: e.target.value })}
                    />
                    {submitted && !meta.klo_alku && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.endTimeLabel}</Form.Label>
                    <Form.Control 
                      className="flex-grow-1"
                      type="time" 
                      key={`klo_loppu-${meta.klo_loppu}`}
                      value={meta.klo_loppu || ''} 
                      onChange={e => setMeta({ ...meta, klo_loppu: e.target.value })}
                    />
                    {submitted && !meta.klo_loppu && (
                      <span className="error" style={{color: 'red'}}>{strings.requiredField}</span>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.normalHoursLabel}</Form.Label>
                    <Form.Control 
                      type="number" 
                      step={0.1} 
                      value={meta.norm} 
                      onChange={e=>setMeta({...meta, norm:e.target.value})} 
                      placeholder={strings.normalHoursPlaceholder}
                    />
                    {submitted && (meta.norm === '' || Number(meta.norm) <= 0) && (
                      <span className="error" style={{ color: 'red' }}>{strings.requiredField}</span>
                    )}
                    <NumberValidator value={meta.norm} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

              {showExtras && (
              <>
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.extrasLaLabel}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.lisatLa} 
                      onChange={e=>setMeta({...meta, lisatLa:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                    <NumberValidator value={meta.lisatLa} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.extrasSuLabel}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.lisatSu} 
                      onChange={e=>setMeta({...meta, lisatSu:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                    <NumberValidator value={meta.lisatSu} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.extrasEveningLabel}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.lisatIlta} 
                      onChange={e=>setMeta({...meta, lisatIlta:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                    <NumberValidator value={meta.lisatIlta} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.extrasNightLabel}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.lisatYo} 
                      onChange={e=>setMeta({...meta, lisatYo:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    {showExtrasMessage && <Form.Text className="text-info">{strings.showExtrasPlaceholder}</Form.Text>}
                    <NumberValidator value={meta.lisatYo} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>
              </>
              )}
    
              {showOvertime && (
              <>
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.overtimeVrk50Label}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.ylityoVrk50} 
                      onChange={e=>setMeta({...meta, ylityoVrk50:e.target.value})} 
                      placeholder={strings.overtimePlaceholder}
                    />
                    {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                    <NumberValidator value={meta.ylityoVrk50} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.overtimeVrk100Label}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.ylityoVrk100} 
                      onChange={e=>setMeta({...meta, ylityoVrk100:e.target.value})} 
                      placeholder={strings.overtimePlaceholder}
                    />
                    {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                    <NumberValidator value={meta.ylityoVrk100} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.overtimeVko50Label}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.ylityoVko50} 
                      onChange={e=>setMeta({...meta, ylityoVko50:e.target.value})} 
                      placeholder={strings.overtimePlaceholder}
                    />
                    {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                    <NumberValidator value={meta.ylityoVko50} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.overtimeVko100Label}</Form.Label>
                    <Form.Control 
                      type="number"
                      step={0.1} 
                      value={meta.ylityoVko100} 
                      onChange={e=>setMeta({...meta, ylityoVko100:e.target.value})} 
                      placeholder={strings.overtimePlaceholder}
                    />
                    {showOvertimeMessage && <Form.Text className="text-info">{strings.showOvertimePlaceholder}</Form.Text>}
                    <NumberValidator value={meta.ylityoVko100} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>
              </>
              )}
     
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.atvLabel}</Form.Label>
                    <Form.Control 
                      type="number" 
                      step={0.1} 
                      value={meta.atv} 
                      onChange={e=>setMeta({...meta, atv:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    <NumberValidator value={meta.atv} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>
    
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.travelLabel}</Form.Label>
                    <Form.Control 
                      type="number" 
                      step={0.1} 
                      value={meta.matk} 
                      onChange={e=>setMeta({...meta, matk:e.target.value})} 
                      placeholder={strings.extrasPlaceholder}
                    />
                    <NumberValidator value={meta.matk} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>
    
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.mealLabel}</Form.Label>
                    <Form.Control 
                      type="number"
                      value={meta.ateriakorvaus} 
                      onChange={e=>setMeta({...meta, ateriakorvaus:e.target.value})}
                      placeholder={strings.mealLabel}
                    />
                    <NumberValidator value={meta.ateriakorvaus} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>  

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.kmLabel}</Form.Label>
                    <Form.Control 
                      type="number" 
                      step={0.1} 
                      value={meta.km} 
                      onChange={e=>setMeta({...meta, km:e.target.value})}
                      placeholder={strings.kmPlaceholder}
                    />
                    <NumberValidator value={meta.km} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.toolCompLabel}</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={meta.tyokalukorvaus} 
                      onChange={e=>setMeta({...meta, tyokalukorvaus:e.target.value})} 
                      placeholder={strings.toolCompPlaceholder}
                    />
                    <NumberValidator value={meta.tyokalukorvaus} min={0.1} max={999.99} message="Liian iso luku" />
                  </Form.Group>
                </Col>

              {parseFloat(meta.km) > 0 && (
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.kmNoteLabel}</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      value={meta.km_selite} 
                      onChange={e=>setMeta({...meta, km_selite:e.target.value})} 
                      placeholder={strings.kmNotePlaceholder}
                    />
                    <Form.Text className="text-info">
                      {strings.kmDescInfo}
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">Päiväraha</Form.Label>
                    <Form.Select
                      className="form-control"
                      value={meta.paivaraha || 'ei'}
                      onChange={(e) => setMeta({...meta, paivaraha: e.target.value})}
                    >
                      <option value="ei">Ei</option>
                      <option value="osa">Osa</option>
                      <option value="koko">Koko</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.noteLabel}</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      value={meta.huom} 
                      onChange={e=>setMeta({...meta, huom:e.target.value})} 
                      placeholder={strings.notePlaceholder}
                    />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.memoLabel}</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      value={meta.memo} 
                      onChange={e=>setMeta({...meta, memo:e.target.value})} 
                      placeholder={strings.memoPlaceholder}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {statusMessage && (
                <Row className="mb-2">
                  <Col>
                    <div className={`save-status ${statusMessage.includes('epäonnistui') ? 'error' : 'success'}`}>
                      {statusMessage}
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="g-2 mt-3">
                <Col xs="auto"><Button size="sm" variant="primary" onClick={toggleExtras}>{showExtras? strings.toggleExtrasHide : strings.toggleExtrasShow}</Button></Col>
                <Col xs="auto"><Button size="sm" variant="secondary" onClick={toggleOvertime}>{showOvertime? strings.toggleOvertimeHide : strings.toggleOvertimeShow}</Button></Col>
                <Col className="text-end">
                  <Button size="sm" variant="success" className="me-2" type="submit">{strings.addRowButton}</Button>
                  <Button size="sm" variant="outline-danger" onClick={clearAll}>{strings.clearAllButton}</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* ... Pidä taulukko-osa sellaisenaan, vain setR/addRow/removeRow/clearAll käyttävät nyt API:a ... */}

        {/* Yhteenveto pidetään ennallaan */}
        <Card className="shadow-sm">
          <Card.Header as="h6">{strings.summaryHeader}</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Summary label={strings.normalHoursLabel} value={totals.norm} suffix=" h" />
              <Summary label={strings.extrasLaLabel} value={totals.lisatLa} suffix=" h" />
              <Summary label={strings.extrasSuLabel} value={totals.lisatSu} suffix=" h" />
              <Summary label={strings.extrasEveningLabel} value={totals.lisatIlta} suffix=" h" />
              <Summary label={strings.extrasNightLabel} value={totals.lisatYo} suffix=" h" />
              <Summary label={strings.overtimeVrk50Label} value={totals.ylityoVrk50} suffix=" h" />
              <Summary label={strings.overtimeVrk100Label} value={totals.ylityoVrk100} suffix=" h" />
              <Summary label={strings.overtimeVko50Label} value={totals.ylityoVko50} suffix=" h" />
              <Summary label={strings.overtimeVko100Label} value={totals.ylityoVko100} suffix=" h" />
              <Summary label={strings.atvLabel} value={totals.atv} suffix=" h" />
              <Summary label={strings.travelLabel} value={totals.matk} suffix=" h" />
              <Summary label={strings.mealLabel} value={totals.ateriakorvaus} suffix=" €" />
              <Summary label={strings.kmLabel} value={totals.km} suffix=" km" />
              <Summary label={strings.toolCompLabel} value={totals.tyokalukorvaus} suffix=" €" />
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}

function Summary({ label, value, prefix = '', suffix = '' }) {
  return (
    <Col xs={12} sm={6} md={4} lg={3} xl={2}>
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          <div className="text-muted small">{label}</div>
          <div className="h4 mb-0">{prefix}{Number(value).toFixed(2)}{suffix}</div>
        </Card.Body>
      </Card>
    </Col>
  );
}
