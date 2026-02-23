import React, { useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


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
  const { t, i18n } = useTranslation();


  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  return (
    /* ... Pidä taulukko-osa sellaisenaan, vain setR/addRow/removeRow/clearAll käyttävät nyt API:a ... */
    /* Yhteenveto pidetään ennallaan */
    <Card className="shadow-sm">
      <Card.Header as="h6">{t('summaryHeader')}</Card.Header>
      <Card.Body>
        <Row className="g-3">
          <Summary label={t('normalHoursLabel')} value={totals.norm} suffix=" h" />
          <Summary label={t('extrasLaLabel')} value={totals.lisatLa} suffix=" h" />
          <Summary label={t('extrasSuLabel')} value={totals.lisatSu} suffix=" h" />
          <Summary label={t('extrasEveningLabel')} value={totals.lisatIlta} suffix=" h" />
          <Summary label={t('extrasNightLabel')} value={totals.lisatYo} suffix=" h" />
          <Summary label={t('overtimeVrk50Label')} value={totals.ylityoVrk50} suffix=" h" />
          <Summary label={t('overtimeVrk100Label')} value={totals.ylityoVrk100} suffix=" h" />
          <Summary label={t('overtimeVko50Label')} value={totals.ylityoVko50} suffix=" h" />
          <Summary label={t('overtimeVko100Label')} value={totals.ylityoVko100} suffix=" h" />
          <Summary label={t('atvLabel')} value={totals.atv} suffix=" h" />
          <Summary label={t('travelLabel')} value={totals.matk} suffix=" h" />
          <Summary label={t('mealLabel')} value={totals.ateriakorvaus} suffix=" €" />
          <Summary label={t('kmLabel')} value={totals.km} suffix=" km" />
          <Summary label={t('toolCompLabel')} value={totals.tyokalukorvaus} suffix=" €" />
        </Row>
      </Card.Body>
    </Card>
  );
}