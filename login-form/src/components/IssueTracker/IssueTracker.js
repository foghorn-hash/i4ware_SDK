import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import TextInput from "./../common/TextInput";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LOADING from "../../tube-spinner.svg";
import Modal from "./../Modal/Modal.js";
import ModalApproval from "./../ModalApproval/ModalApproval.js";


const ISSUES_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

const STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const STATUS_BADGE_CLASS = {
  todo: "badge bg-primary",
  in_progress: "badge bg-warning text-dark",
  done: "badge bg-success",
};

const NewIssueSchema = Yup.object().shape({
  issue_name: Yup.string().required("Issue name is required"),
  description: Yup.string().nullable(),
  assigned_to: Yup.string().nullable(),
});

function IssueTracker() {
  const { t, i18n } = useTranslation();
  const { authState } = React.useContext(AuthContext);

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [detailIssue, setDetailIssue] = useState(null);  // issue object
  const [confirmStatusId, setConfirmStatusId] = useState(null);  // issue id
  const [pendingStatus, setPendingStatus] = useState(null);  // new status value
  const [assignModalIssue, setAssignModalIssue] = useState(null);  // issue object

  const [menuOpen, setMenuOpen] = useState([]);

  const totalPages = Math.max(1, Math.ceil(total / ISSUES_PER_PAGE));
  const hasActiveSearch = debouncedName !== "";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang");
    if (lang && ["en", "fi", "sv"].includes(lang)) i18n.changeLanguage(lang);
  }, [i18n]);


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(searchName.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchName]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setPage(1);
  }, [debouncedName]);


  useEffect(() => {
    fetchIssues(page, debouncedName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedName]);

  const fetchIssues = async (pageNumber, name) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: pageNumber, per_page: ISSUES_PER_PAGE });
      if (name) params.append("name", name);

      const response = await axios.get(
        `${API_BASE_URL}/api/issue-tracker?${params.toString()}`,
        { headers: { Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME) } }
      );

      const data = response.data;
      if (Array.isArray(data)) {
        setIssues(data);
        setTotal(
          data.length < ISSUES_PER_PAGE
            ? (pageNumber - 1) * ISSUES_PER_PAGE + data.length
            : pageNumber * ISSUES_PER_PAGE + 1
        );
      } else {
        setIssues(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIssues = () => fetchIssues(page, debouncedName);

  useEffect(() => {
    request()
      .get("/api/issue-tracker/users")
      .then((res) => {
        if (res && res.data) setUsers(res.data);
      })
      .catch((err) => console.error("Failed to load users:", err));
  }, []);

  const handleAddIssue = (values, { resetForm }) => {
    request()
      .post("/api/issue-tracker", {
        issue_name: values.issue_name,
        description: values.description || null,
        assigned_to: values.assigned_to || null,
      })
      .then(() => { resetForm(); setShowAddModal(false); refreshIssues(); })
      .catch((err) => console.error(err));
  };

  const openStatusConfirm = (issue, newStatus) => {
    setConfirmStatusId(issue.id);
    setPendingStatus(newStatus);
  };

  const confirmStatusChange = () => {
    request()
      .put(`/api/issue-tracker/${confirmStatusId}/status`, { status: pendingStatus })
      .then(() => { setConfirmStatusId(null); setPendingStatus(null); refreshIssues(); })
      .catch((err) => console.error(err));
  };

  const handleReassign = (values) => {
    request()
      .put(`/api/issue-tracker/${assignModalIssue.id}/assign`, {
        assigned_to: values.assigned_to || null,
      })
      .then(() => { setAssignModalIssue(null); refreshIssues(); })
      .catch((err) => console.error(err));
  };

  const handleToggle = (index) => {
    setMenuOpen((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const fmtDate = (dt) =>
    dt
      ? new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const statusLabel = (value) => STATUS_OPTIONS.find((s) => s.value === value)?.label || value;

  return (
    <>
      <Modal show={showAddModal}>
        <div>
          <h1>Add Issue</h1>
          <Formik
            initialValues={{ issue_name: "", description: "", assigned_to: "" }}
            validationSchema={NewIssueSchema}
            onSubmit={handleAddIssue}
          >
            {({ submitForm }) => (
              <form className="row">
                <div className="col-12 mt-2">
                  <TextInput
                    label="Issue Name"
                    placeholder="Short, descriptive title…"
                    name="issue_name"
                  />
                </div>

                <div className="col-12 mt-2">
                  <label className="form-label">Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    className="form-control"
                    rows={4}
                    placeholder="Optional details…"
                  />
                </div>

                <div className="col-12 mt-2">
                  <label className="form-label">Assign To</label>
                  <br />
                  <Field className="select-role" as="select" name="assigned_to">
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </Field>
                </div>

                <div className="spacer" />

                <div>
                  <div className="float-left">
                    <Button onClick={submitForm}>Add Issue</Button>
                  </div>
                  <div className="float-right">
                    <Button onClick={() => setShowAddModal(false)}>Close</Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </Modal>

      <Modal show={detailIssue !== null}>
        {detailIssue && (
          <div>
            <h1>Issue Detail</h1>
            <small className="text-muted">#{String(detailIssue.id).padStart(4, "0")}</small>

            <table className="table table-bordered table-sm mt-3">
              <tbody>
                <tr>
                  <th style={{ width: "35%" }}>Issue Name</th>
                  <td>{detailIssue.issue_name}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={STATUS_BADGE_CLASS[detailIssue.status] || "badge bg-secondary"}>
                      {statusLabel(detailIssue.status)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Assigned To</th>
                  <td>{detailIssue.assignee?.name || <span className="text-muted">Unassigned</span>}</td>
                </tr>
                <tr>
                  <th>Created By</th>
                  <td>{detailIssue.creator?.name || "—"}</td>
                </tr>
                <tr>
                  <th>Created At</th>
                  <td>{fmtDate(detailIssue.created_at)}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td style={{ whiteSpace: "pre-wrap" }}>
                    {detailIssue.description || (
                      <span className="text-muted fst-italic">No description provided.</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="spacer" />
            <div className="float-right">
              <Button onClick={() => setDetailIssue(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ModalApproval show={confirmStatusId !== null}>
        <div>
          <h1>Are you sure?</h1>
          <div>
            Change status to <strong>{statusLabel(pendingStatus)}</strong>?
          </div>
          <div className="spacer" />
          <div>
            <div className="float-left">
              <Button onClick={confirmStatusChange}>Yes</Button>
            </div>
            <div className="float-right">
              <Button onClick={() => { setConfirmStatusId(null); setPendingStatus(null); }}>No</Button>
            </div>
          </div>
        </div>
      </ModalApproval>

      <Modal show={assignModalIssue !== null}>
        {assignModalIssue && (
          <div>
            <h1>Reassign Issue</h1>
            <p className="text-muted mb-3">{assignModalIssue.issue_name}</p>
            <Formik
              initialValues={{ assigned_to: assignModalIssue.assigned_to ?? "" }}
              onSubmit={handleReassign}
            >
              {({ setFieldValue }) => (
                <Form className="row py-2">
                  <div className="col-12">
                    <label className="form-label">Assign To</label>
                    <select
                      name="assigned_to"
                      className="select-role"
                      defaultValue={assignModalIssue.assigned_to ?? ""}
                      onChange={(e) => setFieldValue("assigned_to", e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="spacer" />
                  <div>
                    <div className="float-left">
                      <Button type="submit">Save</Button>
                    </div>
                    <div className="float-right">
                      <Button type="button" onClick={() => setAssignModalIssue(null)}>Cancel</Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </Modal>

      <div className="button-bar">
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          Add Issue
        </Button>
      </div>

      <div className="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "260px" }}
          placeholder="Search by issue name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          aria-label="Search by issue name"
        />
        {hasActiveSearch && (
          <Button variant="outline-secondary" size="sm" onClick={() => setSearchName("")}>
            Clear
          </Button>
        )}
      </div>

      <div className="mt-2" >
        <div className="table-header">
          <div className="column justify-content-center">#</div>
          <div className="column justify-content-center">ID</div>
          <div className="column justify-content-center">Issue Name</div>
          <div className="column justify-content-center">Status</div>
          <div className="column justify-content-center">Assigned To</div>
          <div className="column justify-content-center">Created By</div>
          <div className="column justify-content-center">Created At</div>
          <div className="column justify-content-center">Actions</div>
        </div>

        <div className="table-body">
          {isLoading ? (
            <div className="loading-screen">
              <img src={LOADING} alt="Loading..." />
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-4 text-muted">No issues found.</div>
          ) : (
            issues.map((item, index) => {
              const rowNumber = (page - 1) * ISSUES_PER_PAGE + index + 1;
              return (
                <div key={item.id} className="mobile-table-body">
                  <div className="mobile-table-header">
                    <div className="column">#</div>
                    <div className="column">ID</div>
                    <div className="column">Issue Name</div>
                    <div className="column">Status</div>
                    <div className="column">Assigned To</div>
                    <div className="column">Created By</div>
                    <div className="column">Created At</div>
                    <div className="column">Actions</div>
                  </div>

                  <div
                    className="table-row"
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailIssue(item)}
                    title="Click to view details"
                  >
                    <div className="column">{rowNumber}</div>
                    <div className="column">{item.id}</div>
                    <div className="column">{item.issue_name}</div>
                    <div className="column">
                      <span className={STATUS_BADGE_CLASS[item.status] || "badge bg-secondary"}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <div className="column">
                      {item.assignee?.name || <span className="text-muted">Unassigned</span>}
                    </div>
                    <div className="column">{item.creator?.name || "—"}</div>
                    <div className="column">{fmtDate(item.created_at)}</div>

                    <div className="column" onClick={(e) => e.stopPropagation()}>
                      <Dropdown show={menuOpen[index]} onToggle={() => handleToggle(index)}>
                        <Dropdown.Toggle variant="success" id={`issue-dd-${item.id}`}>
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu className={`mobile-dropdown ${menuOpen[index] ? "visible" : ""}`}>

                          <Dropdown.Item onClick={() => setDetailIssue(item)}>
                            View Details
                          </Dropdown.Item>

                          <>
                            {STATUS_OPTIONS.filter((s) => s.value !== item.status).map((s) => (
                              <Dropdown.Item
                                key={s.value}
                                onClick={() => openStatusConfirm(item, s.value)}
                              >
                                Mark as {s.label}
                              </Dropdown.Item>
                            ))}
                          </>

                          <Dropdown.Item onClick={() => setAssignModalIssue(item)}>
                            Reassign
                          </Dropdown.Item>

                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!isLoading && (
          <div className="d-flex justify-content-left align-items-center gap-3 mt-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>Page {page} / {totalPages}</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <div className="spacer" />
      </div>
    </>
  );
}

export default IssueTracker;