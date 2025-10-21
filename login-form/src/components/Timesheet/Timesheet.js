import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Table, Form, Button, Card } from 'react-bootstrap';
import './Timesheet.css';
import { API_BASE_URL,  API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { LanguageContext } from "../../LanguageContext";

/** === API setup === */
const API_BASE = API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem(ACCESS_TOKEN_NAME); // esim. "eyJhbGciOi..."

const api = axios.create({
  baseURL: API_BASE,
  headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AUTH_TOKEN}`
  }
});
if (AUTH_TOKEN) api.defaults.headers.common["Authorization"] = `Bearer ${AUTH_TOKEN}`;

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
  // paivaraha_osa: !!r.paivaraha_osa,
  // paivaraha_koko: !!r.paivaraha_koko,
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
  // paivaraha_osa: !!r.paivaraha_osa,
  // paivaraha_koko: !!r.paivaraha_koko,
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
  // paivaraha_osa: false,
  // paivaraha_koko: false,
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
    ateriakorvaus: '',
    km: '',
    tyokalukorvaus: '',
    // paivaraha_koko: '',
    // paivaraha_osa: '',
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

  /** === INIT: varmista tuntikortti + lataa rivit === */
  useEffect(() => {
    (async () => {
      try {
        // 1) yritä löytää käyttäjän uusin samalla nimellä
        const search = await api.get('/api/timesheet/timesheets', { params: { user_id: CURRENT_USER_ID, q: meta.nimi, per_page: 1 }});
        let ts = search.data?.data?.[0];

        // 2) jos ei löydy, luo
        if (!ts) {
          const created = await api.post('/api/timesheet/timesheets', {
            user_id: Number(CURRENT_USER_ID), // backend ei pakollinen tässä controllerissa, mutta varmuudeksi
            nimi: meta.nimi || 'Uusi tuntikortti',
            tyontekija: meta.tyontekija || 'Tuntematon',
            ammattinimike: meta.ammattinimike || '',
            status: 'Luotu',
            domain: '',
          });
          ts = created.data;
        }

        setTimesheetId(ts.id);

        // 3) lataa rivit
        let res = await api.get(`/api/timesheet/timesheets/${ts.id}/rows`, { params: { per_page: 500, order_by: 'row_no,pvm,id' }});
        let srvRows = res.data?.data ?? [];

        // jos rivejä ei ole, luo yksi oletusrivi
        if (srvRows.length === 0) {
          const createdRow = await api.post(`/api/timesheet/timesheets/${ts.id}/rows`, {
            user_id: Number(CURRENT_USER_ID),
            status: 'Luotu'
          });
          srvRows = [createdRow.data]; // käytetään luotua riviä
        }
        setRows(srvRows.map(fromApiRow));
      } catch (e) {
        console.error("Init failed", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** === meta-autosave (debounce) === */
  useEffect(() => {
    if (!timesheetId) return;
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(async () => {
      try {
        await api.put(`/api/timesheet/timesheets/${timesheetId}`, {
          nimi: meta.nimi || 'Uusi tuntikortti',
          tyontekija: meta.tyontekija || 'Tuntematon',
          ammattinimike: meta.ammattinimike  || '',
        });
      } catch (e) {
        console.error("Meta save failed", e);
      }
    }, 600);
  }, [meta, timesheetId]);

  /** === totals === */
  const totals = useMemo(() => rows.reduce((acc, r) => ({
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
  }), { norm:0, lisatLa:0, lisatSu:0, lisatIlta:0, lisatYo:0, ylityoVrk50:0, ylityoVrk100:0, ylityoVko50:0, ylityoVko100:0, atv:0, matk:0, ateriakorvaus:0, km:0, tyokalukorvaus:0 }), [rows]);

  /** === server-sync helpers === */
  const queueSaveRow = (rowId) => {
    if (!timesheetId) return;
    if (saveTimers.current[rowId]) clearTimeout(saveTimers.current[rowId]);
    saveTimers.current[rowId] = setTimeout(async () => {
      try {
        const r = rows.find(x => x.id === rowId);
        if (!r) return;

        // jos rivi on vasta lokaali (id negatiivinen tms.), tee POST
        if (typeof r.id === 'string' && r.id.startsWith('tmp_')) {
          const payload = toApiRow(r, CURRENT_USER_ID, timesheetId, rows.indexOf(r) + 1);
          const created = await api.post(`/api/timesheet/timesheets/${timesheetId}/rows`, payload);
          const newRow = fromApiRow(created.data);
          setRows(prev => prev.map(x => x.id === r.id ? newRow : x));
        } else {
          const payload = toApiRow(r, CURRENT_USER_ID, timesheetId);
          await api.put(`/api/timesheet/timesheets/${timesheetId}/rows/${r.id}`, payload);
        }
      } catch (e) {
        console.error("Row save failed", e);
      }
    }, 500);
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

  const addRow = () => {
    if (!timesheetId) {
      setStatusMessage('Timesheet ei ole vielä valmis, odota hetki.');
      setTimeout(() => setStatusMessage(''), 3000);
      alert("Timesheet ei ole vielä valmis, odota hetki.");
      return;
    }

    try {
      
      const tmpId = `tmp_${Date.now()}`;
      const newRow = { 
        ...makeRow((rows?.length||0)+1), 
        id: tmpId,
        project: meta.project,
        pvm: meta.pvm,
        klo_alku: meta.klo_alku,
        klo_loppu: meta.klo_loppu,
        norm: Number(meta.norm || 0),
        lisatLa: Number(meta.lisatLa || 0),
        lisatSu: Number(meta.lisatSu || 0),
        lisatIlta: Number(meta.lisatIlta || 0),
        lisatYo: Number(meta.lisatYo || 0),
        ylityoVrk50: Number(meta.ylityoVrk50 || 0),
        ylityoVrk100: Number(meta.ylityoVrk100 || 0),
        ylityoVko50: Number(meta.ylityoVko50 || 0),
        ylityoVko100: Number(meta.ylityoVko100 || 0),
        atv: Number(meta.atv || 0),
        matk: Number(meta.matk || 0),
        // paivaraha_koko: !!meta.paivaraha_koko,
        // paivaraha_osa: !!meta.paivaraha_osa,
        ateriakorvaus: Number(meta.ateriakorvaus || 0),
        km: Number(meta.km || 0),
        tyokalukorvaus: Number(meta.tyokalukorvaus || 0),
        km_selite: meta.km_selite,
        huom: meta.huom,
        memo: meta.memo
      };

      setRows(prev => [...prev, newRow]);
      queueSaveRow(tmpId);
  
      setStatusMessage('Rivi lisätty onnistuneesti!');
      setTimeout(() => setStatusMessage(''), 3000);
  
    } catch (err) {
      console.error('Rivin lisääminen epäonnistui:', err);
      setStatusMessage('Rivin lisääminen epäonnistui.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
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

  const clearAll = async () => {
    try {
      // poista kaikki serveriltä
      const ids = rows.map(r => r.id).filter(id => !(typeof id === 'string' && id.startsWith('tmp_')));
      await Promise.all(ids.map(id => api.delete(`/timesheets/${timesheetId}/rows/${id}`)));
      setRows([]);
    } catch (e) {
      console.error("Clear failed", e);
    }
  };

  /** === Numero-input joka forwardaa style ym. === */
  const Num = ({ value, onChange, step = 0.25, style, className, ...rest }) => (
    <Form.Control
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      step={step}
      size="sm"
      style={style}
      className={className}
      {...rest}
    />
  );

  //yhdistää työajan aloittamis ja loppumis ajat klo kenttään
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!timesheetId) {
      alert("Ei ole vielä valmis");
      return;
    }
  
    try {
      // luo payload toApiRow:n kautta
      const tmpId = `tmp_${Date.now()}`;
      const newRowLocal = { ...makeRow(rows.length + 1), id: tmpId };
  
      // yhdistää tiedot meta:sta
      const combinedRow = {
        ...newRowLocal,
        status: 'Luotu',
        project: meta.project,
        pvm: meta.pvm,
        klo_alku: meta.klo_alku,
        klo_loppu: meta.klo_loppu,
        norm: Number(meta.norm || 0),
        lisatLa: Number(meta.lisatLa || 0),
        lisatSu: Number(meta.lisatSu || 0),
        lisatIlta: Number(meta.lisatIlta || 0),
        lisatYo: Number(meta.lisatYo || 0),
        ylityoVrk50: Number(meta.ylityoVrk50 || 0),
        ylityoVrk100: Number(meta.ylityoVrk100 || 0),
        ylityoVko50: Number(meta.ylityoVko50 || 0),
        ylityoVko100: Number(meta.ylityoVko100 || 0),
        atv: Number(meta.atv || 0),
        matk: Number(meta.matk || 0),
        // paivaraha_koko: !!meta.paivaraha_koko,
        // paivaraha_osa: !!meta.paivaraha_osa,
        ateriakorvaus: Number(meta.ateriakorvaus || 0),
        km: Number(meta.km || 0),
        tyokalukorvaus: Number(meta.tyokalukorvaus || 0),
        km_selite: meta.km_selite,
        huom: meta.huom,
        memo: meta.memo
      };
  
      const payload = toApiRow(combinedRow, CURRENT_USER_ID, timesheetId, rows.length + 1);
      const created = await api.post(`/api/timesheet/timesheets/${timesheetId}/rows`, payload);
  
      // saa uuden rivin ja tekee sen frontin ymmärrettäväksi
      const newRow = fromApiRow(created.data);
  
      // lisää lokaalisen state:n
      setRows(prev => [...prev, newRow]);
  
      // tyhjentää lomakkeen
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
        ateriakorvaus: '',
        km: '',
        tyokalukorvaus: '',
        // paivaraha_koko: '',
        // paivaraha_osa: '',
        km_selite: '',
        huom: '',
        memo: ''
      });
  
      alert('Rivi tallennettu onnistuneesti!');
    } catch (err) {
      console.error('Tallennus epäonnistui:', err);
      alert('Tallennus epäonnistui. Tarkista tiedot ja yritä uudelleen.');
    }
  };

  const toggleExtras = () => {
    setShowExtras(s => !s);
    setShowExtrasMessage(true);
    setTimeout(() => setShowExtrasMessage(true)); //jos haluaa aikarajan -> setShowExtrasMessage(false), 4000);
  };

  const toggleOvertime = () => {
    setShowOvertime(s => !s);
    setShowOvertimeMessage(true);
    setTimeout(() => setShowOvertimeMessage(true));
  }

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
                      required
                    /> 
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.employeeLabel}</Form.Label>
                    <Form.Control 
                      value={meta.tyontekija} 
                      onChange={e=>setMeta({...meta, tyontekija:e.target.value})} 
                      placeholder={strings.employeePlaceholder}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.jobTitleLabel}</Form.Label>
                    <Form.Control 
                      value={meta.ammattinimike} 
                      onChange={e=>setMeta({...meta, ammattinimike:e.target.value})} 
                      placeholder={strings.jobTitlePlaceholder}
                      required
                    />
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
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.dateLabel}</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={meta.pvm} 
                      onChange={e=>setMeta({...meta, pvm:e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.startTimeLabel}</Form.Label>
                    <Form.Control 
                      className="flex-grow-1"
                      type="time"
                      required
                      value={meta.klo_alku || ''} 
                      onChange={e => setMeta({ ...meta, klo_alku: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">{strings.endTimeLabel}</Form.Label>
                    <Form.Control 
                      className="flex-grow-1"
                      type="time" 
                      required
                      value={meta.klo_loppu || ''} 
                      onChange={e => setMeta({ ...meta, klo_loppu: e.target.value })}
                    />
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
                      required
                    />
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
                  </Form.Group>
                </Col>

                {/* <Col md>
                  <Form.Group>
                    <Form.Label className="small text-muted">Päiväraha</Form.Label>
                    <Form.Check 
                      type="radio" 
                      label="Koko"
                      name="paivaraha"
                      value="koko"
                      checked={meta.paivaraha_koko==="koko"} 
                      onChange={()=>setMeta({...meta, paivaraha_koko:"koko"})} 
                    />
                    <Form.Check 
                      type="radio" 
                      label="Osa"
                      name="paivaraha"
                      value="osa"
                      checked={meta.paivaraha_osa==="osa"} 
                      onChange={()=>setMeta({...meta, paivaraha_osa:"osa"})} 
                    />
                  </Form.Group>
                </Col> */}

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
                  <Button size="sm" variant="success" className="me-2" onClick={addRow}>{strings.addRowButton}</Button>
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
