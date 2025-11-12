import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

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

  export default function SummaryPanel({ strings, totals }) {
    return (
    /* ... Pidä taulukko-osa sellaisenaan, vain setR/addRow/removeRow/clearAll käyttävät nyt API:a ... */
    /* Yhteenveto pidetään ennallaan */
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
);
}