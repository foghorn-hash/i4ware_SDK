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

  const { strings } = useContext(LanguageContext); //translate
  const { authToken } = useAuthToken();
  
  const {
    timesheet,
    timesheetId,
    rows,
    setRows,
    meta,
    setMeta,
    createTimesheet 
  } = useTimesheet(authToken);

  const { 
    unwrap,
    submitted,
    handleSubmit,
    clearAll,
    toggleExtras,
    toggleOvertime,
    showExtras,
    showOvertime,
    showExtrasMessage,
    showOvertimeMessage,
    statusMessage,
    statusType,
    handleMetaChange
  } 
  = useRowActions( 
    timesheetId, 
    timesheet,
    rows, 
    setRows, 
    meta, 
    setMeta, 
    strings,
    createTimesheet 
  );
  
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
              statusType={statusType}
              handleMetaChange={handleMetaChange} 
            />
          </Card.Body>
        </Card><SummaryPanel strings={strings} totals={totals} />
      </Container>
    </Container>
  );
}