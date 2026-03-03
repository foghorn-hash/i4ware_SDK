import { Table, Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function TimesheetRowsTable({ rows, pagination, fetchRows }) {
  const { t } = useTranslation();

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("projectLabel")}</th>
            <th>{t("dateLabel")}</th>
            <th>{t("normalHoursLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.project}</td>
              <td>{row.pvm}</td>
              <td>{row.norm}</td>
            </tr>
          ))}
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