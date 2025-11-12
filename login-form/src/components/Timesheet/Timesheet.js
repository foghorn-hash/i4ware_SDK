import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Table, Form, Button, Card } from 'react-bootstrap';
import './Timesheet.css';
import { API_BASE_URL,  API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { LanguageContext } from "../../LanguageContext";
import TimesheetForm from "./TimesheetForm";
import { useAuthToken, api } from './hooks/useAuthToken';
import { toApiRow, fromApiRow, makeRow, calculateTotals } from './utils/helpers';
import SummaryPanel from "./Summary";
import { useTimesheet } from './hooks/useTimesheet';
import { useAutosaveMeta, useAutosaveRows } from './hooks/useAutosave';
import { useRowActions } from "./hooks/useRowActions";


export default function Timesheet() {

  const CURRENT_USER_ID = 1; // hae oikeasti authista
  const { strings } = useContext(LanguageContext); //käännös
  const { authToken, userId } = useAuthToken();

  const { timesheetId, rows, setRows, meta, setMeta } =
    useTimesheet(CURRENT_USER_ID, authToken);

  const [showExtras, setShowExtras] = useState(true);
  const [showOvertime, setShowOvertime] = useState(true);
  const [showExtrasMessage, setShowExtrasMessage] = useState(false);
  const [showOvertimeMessage, setShowOvertimeMessage] = useState(false);

  const { setR, removeRow, addRow, unwrap, createAndSaveRow } = useRowActions(
    timesheetId,
    rows,
    setRows,
    userId,
    meta,
    setMeta,
    setStatusMessage,
    strings
  );

  const saveTimers = useRef({}); // debounce per rowId
  const metaTimer = useRef(null);
  
  useAutosaveMeta(meta, timesheetId);

  useEffect(() => {
    if (!timesheetId) {
      // console.log("⏳ Waiting for timesheetId...");
      return;
    }
  
    (async () => {
      try {
        const res = await api.get(`/api/timesheet/timesheets/${timesheetId}/rows`);
        const rawRows = Array.isArray(unwrap(res)) ? unwrap(res) : [];
        setRows(rawRows.map(fromApiRow));
        // console.log("✅ Rows loaded:", rawRows.length, "for timesheet", timesheetId);
      } catch (e) {
        // console.error("❌ Failed to fetch rows", e);
      }
    })();
  }, [timesheetId]);
  

  
  
  



  const [statusMessage, setStatusMessage] = useState('');

  
  

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
      setStatusMessage(strings.errorSendForm);
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

  const totals = useMemo(() => calculateTotals(rows), [rows]);

  /* ====== TÄSTÄ ALASPÄIN: sinun alkuperäinen renderöinti (lyhennetty header…) ====== */
  return (
    <Container fluid className="tcontainer py-4 bg-dark min-vh-100">
      <Container style={{maxWidth: 1600}}>
        <Card className="shadow-sm mb-3">
          <Card.Body>
            <TimesheetForm
              meta={meta}
              setMeta={setMeta}
              submitted={submitted}
              handleSubmit={handleSubmit}
              clearAll={clearAll}
              toggleExtras={toggleExtras}
              toggleOvertime={toggleOvertime}
              showExtras={showExtras}
              showOvertime={showOvertime}
              showExtrasMessage={showExtrasMessage}
              showOvertimeMessage={showOvertimeMessage}
              strings={strings}
              statusMessage={statusMessage}
            />
          </Card.Body>
        </Card>
        
        <SummaryPanel strings={strings} totals={totals} />
      </Container>
    </Container>
  );
}