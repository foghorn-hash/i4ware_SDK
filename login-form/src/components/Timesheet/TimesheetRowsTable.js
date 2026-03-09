import { Table, Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import React from "react";

export default function TimesheetRowsTable({ rows, pagination, fetchRows }) {
  const { t } = useTranslation();

  const hourTypes = [
    { key: "norm", label: t("normalHoursLabel") },
    { key: "lisatIlta", label: t("extrasEveningLabel") },
    { key: "lisatYo", label: t("extrasNightLabel") },
    { key: "lisatLa", label: t("extrasLaLabel") },
    { key: "lisatSu", label: t("extrasSuLabel") },
    { key: "ylityoVrk50", label: t("overtimeVrk50Label") },
    { key: "ylityoVrk100", label: t("overtimeVrk100Label") },
    { key: "ylityoVko50", label: t("overtimeVko50Label") },
    { key: "ylityoVko100", label: t("overtimeVko100Label") }
  ];

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("projectLabel")}</th>
            <th>{t("dateLabel")}</th>
            <th>{t("workTypeLabel")}</th>
            <th>{t("hoursLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const visibleTypes = hourTypes.filter(
              (type) => row[type.key] && row[type.key] > 0
            );

            return visibleTypes.map((type, index) => (
              <tr key={`${row.id}-${type.key}`}>
                <td>{index === 0 ? row.project : ""}</td>
                <td>{index === 0 ? formatDate(row.pvm) : ""}</td>
                <td>{type.label}</td>
                <td>{row[type.key]}</td>
              </tr>
            ));
          })}
        </tbody>
      </Table>
      <Row className="mt-3">
        <Col className="d-flex justify-content-between align-items-center">
          <Button
            disabled={pagination.currentPage === 1}
            onClick={() => fetchRows(pagination.currentPage - 1)}
          >
            {t("previous")}
          </Button>
          <span>
            {t("page")} {pagination.currentPage} {t("of")} {pagination.lastPage}
          </span>
          <Button
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => fetchRows(pagination.currentPage + 1)}
          >
            {t("next")}
          </Button>
        </Col>
      </Row>
    </>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}