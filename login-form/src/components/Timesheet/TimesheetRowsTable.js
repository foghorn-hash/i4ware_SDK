import { Table, Row, Col, Button } from "react-bootstrap";

export default function TimesheetRowsTable({
  rows,
  pagination,
  fetchRows
}) {
  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Project</th>
            <th>Date</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
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
            Previous
          </Button>

          <span>
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>

          <Button
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => fetchRows(pagination.currentPage + 1)}
          >
            Next
          </Button>

        </Col>
      </Row>
    </>
  );
}