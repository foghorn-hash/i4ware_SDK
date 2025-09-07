import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Table, Form, Button, Card } from 'react-bootstrap';
import './Timesheet.css';
import { API_BASE_URL,  API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";

/** === API setup === */
const API_BASE = API_BASE_URL;
const AUTH_TOKEN = localStorage.getItem(ACCESS_TOKEN_NAME); // esim. "eyJhbGciOi..."

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});
if (AUTH_TOKEN) api.defaults.headers.common["Authorization"] = `Bearer ${AUTH_TOKEN}`;

/** === helpers: camelCase <-> snake_case === */
const toApiRow = (r, userId, timesheetId) => ({
  user_id: userId,
  timesheet_id: timesheetId,
  row_no: r.id ?? r.row_no,
  status: r.status,
  project: r.project || null,
  pvm: r.pvm || null,
  klo: r.klo || null,
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
  paivaraha_osa: !!r.paivaraha_osa,
  paivaraha_koko: !!r.paivaraha_koko,
  ateriakorvaus: Number(r.ateriakorvaus || 0),
  km: Number(r.km || 0),
  tyokalukorvaus: Number(r.tyokalukorvaus || 0),
  km_selite: r.km_selite || "",
  huom: r.huom || "",
  memo: r.memo || "",
});

const fromApiRow = (r) => ({
  id: r.id,                  // käytetään serverin id:tä rivin tunnisteena
  status: r.status,
  project: r.project ?? "",
  pvm: r.pvm ?? "",
  klo: r.klo ? r.klo.slice(0,5) : "00:00",
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
  paivaraha_osa: !!r.paivaraha_osa,
  paivaraha_koko: !!r.paivaraha_koko,
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
  klo: '00:00',
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
  paivaraha_osa: false,
  paivaraha_koko: false,
  ateriakorvaus: 0,
  km: 0,
  tyokalukorvaus: 0,
  km_selite: '',
  huom: '',
  memo: '',
});

export default function Timeshaat() {
  const CURRENT_USER_ID = 1; // hae oikeasti authista
  const [timesheetId, setTimesheetId] = useState(null);

  const [meta, setMeta] = useState({
    nimi: 'Matti Kiviharju, 25.07.2025',
    tyontekija: 'Matti Kiviharju',
    ammattinimike: '',
  });

  const [rows, setRows] = useState(() => Array.from({ length: 0 }, (_, i) => makeRow(i + 1)));
  const [showExtras, setShowExtras] = useState(true);
  const [showOvertime, setShowOvertime] = useState(true);
  const saveTimers = useRef({}); // debounce per rowId
  const metaTimer = useRef(null);

  /** === INIT: varmista tuntikortti + lataa rivit === */
  useEffect(() => {
    (async () => {
      try {
        // 1) yritä löytää käyttäjän uusin samalla nimellä
        const search = await api.get('/timesheets', { params: { user_id: CURRENT_USER_ID, q: meta.nimi, per_page: 1 }});
        let ts = search.data?.data?.[0];

        // 2) jos ei löydy, luo
        if (!ts) {
          const created = await api.post('/timesheets', {
            user_id: CURRENT_USER_ID, // backend ei pakollinen tässä controllerissa, mutta varmuudeksi
            nimi: meta.nimi,
            tyontekija: meta.tyontekija,
            ammattinimike: meta.ammattinimike,
            status: 'Luotu'
          });
          ts = created.data;
        }

        setTimesheetId(ts.id);

        // 3) lataa rivit
        const res = await api.get(`/timesheets/${ts.id}/rows`, { params: { per_page: 500, order_by: 'row_no,pvm,id' }});
        const srvRows = res.data?.data ?? [];
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
        await api.put(`/timesheets/${timesheetId}`, {
          nimi: meta.nimi,
          tyontekija: meta.tyontekija,
          ammattinimike: meta.ammattinimike,
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
          const payload = toApiRow(r, CURRENT_USER_ID, timesheetId);
          const created = await api.post(`/timesheets/${timesheetId}/rows`, payload);
          const newRow = fromApiRow(created.data);
          setRows(prev => prev.map(x => x.id === r.id ? newRow : x));
        } else {
          const payload = toApiRow(r, CURRENT_USER_ID, timesheetId);
          await api.put(`/timesheets/${timesheetId}/rows/${r.id}`, payload);
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

  const addRow = async () => {
    // Lisää ensin lokaali tmp-rivi (snappy UI), server sync hoitaa POSTin
    await api.post('/api/timesheet/1/timesheets/rows', { user_id: CURRENT_USER_ID, nimi: meta.nimi, tyontekija: meta.tyontekija, ammattinimike: meta.ammattinimike, status: 'Luotu' });
    const tmpId = `tmp_${Date.now()}`;
    setRows(prev => [...prev, { ...makeRow( (rows?.length||0)+1 ), id: tmpId }]);
    queueSaveRow(tmpId);
  };

  const removeRow = async (id) => {
    try {
      // jos tmp-riviä ei ole serverillä, poista vain lokaalista
      if (typeof id === 'string' && id.startsWith('tmp_')) {
        setRows(prev => prev.filter(r => r.id !== id));
        return;
      }
      await api.delete(`/timesheets/${timesheetId}/rows/${id}`);
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

  /* ====== TÄSTÄ ALASPÄIN: sinun alkuperäinen renderöinti (lyhennetty header…) ====== */
  return (
    <Container fluid className="tcontainer py-4 bg-dark min-vh-100">
      <Container style={{maxWidth: 1600}}>
        <Card className="shadow-sm mb-3">
          <Card.Body>
            <Row className="g-3">
              <Col md>
                <Form.Group>
                  <Form.Label className="small text-muted">Tuntikortin nimi</Form.Label>
                  <Form.Control value={meta.nimi} onChange={e=>setMeta({...meta, nimi:e.target.value})} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label className="small text-muted">Työntekijä</Form.Label>
                  <Form.Control value={meta.tyontekija} onChange={e=>setMeta({...meta, tyontekija:e.target.value})} />
                </Form.Group>
              </Col>
              <Col md>
                <Form.Group>
                  <Form.Label className="small text-muted">Ammattinimike</Form.Label>
                  <Form.Control value={meta.ammattinimike} onChange={e=>setMeta({...meta, ammattinimike:e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-2 mt-3">
              <Col xs="auto"><Button size="sm" variant="primary" onClick={()=>setShowExtras(s=>!s)}>{showExtras? 'Lisät piiloon':'Lisät näkyviin'}</Button></Col>
              <Col xs="auto"><Button size="sm" variant="secondary" onClick={()=>setShowOvertime(s=>!s)}>{showOvertime? 'Ylityöt piiloon':'Ylityöt näkyviin'}</Button></Col>
              <Col className="text-end">
                <Button size="sm" variant="success" className="me-2" onClick={addRow}>➕ Lisää rivi</Button>
                <Button size="sm" variant="outline-danger" onClick={clearAll}>🗑 Tyhjennä kaikki</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ... Pidä taulukko-osa sellaisenaan, vain setR/addRow/removeRow/clearAll käyttävät nyt API:a ... */}

        {/* Yhteenveto pidetään ennallaan */}
        <Card className="shadow-sm">
          <Card.Header as="h6">Yhteenveto</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Summary label="Norm. tunnit" value={totals.norm} suffix=" h" />
              <Summary label="Lisät la" value={totals.lisatLa} suffix=" h" />
              <Summary label="Lisät su" value={totals.lisatSu} suffix=" h" />
              <Summary label="Lisät Ilta" value={totals.lisatIlta} suffix=" h" />
              <Summary label="Lisät Yö" value={totals.lisatYo} suffix=" h" />
              <Summary label="Ylityö vrk 50%" value={totals.ylityoVrk50} suffix=" h" />
              <Summary label="Ylityö vrk 100%" value={totals.ylityoVrk100} suffix=" h" />
              <Summary label="Ylityö vko 50%" value={totals.ylityoVko50} suffix=" h" />
              <Summary label="Ylityö vko 100%" value={totals.ylityoVko100} suffix=" h" />
              <Summary label="ATV" value={totals.atv} suffix=" h" />
              <Summary label="Matkatunnit" value={totals.matk} suffix=" h" />
              <Summary label="Ateriakorvaus" value={totals.ateriakorvaus} prefix="€ " />
              <Summary label="Kilometrikorvaus (km)" value={totals.km} suffix=" km" />
              <Summary label="Työkalukorvaus" value={totals.tyokalukorvaus} prefix="€ " />
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
