import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import TextInput from "./../common/TextInput";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LOADING from "../../tube-spinner.svg";
import Modal from "./../Modal/Modal.js";
import ModalApproval from "./../ModalApproval/ModalApproval.js";
import "./IssueTracker.css";

const ISSUES_PER_PAGE = 5;
const SEARCH_DEBOUNCE_MS = 350;

const STATUS_BADGE_CLASS = {
  todo: "badge bg-primary",
  in_progress: "badge bg-warning text-dark",
  done: "badge bg-success",
};

const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
});

function IssueTracker() {
  const { t, i18n } = useTranslation();
  React.useContext(AuthContext);

  const STATUS_OPTIONS = [
    { value: "todo", label: t("statusTodo") },
    { value: "in_progress", label: t("statusInProgress") },
    { value: "done", label: t("statusDone") },
  ];

  const NewIssueSchema = Yup.object().shape({
    issue_name: Yup.string().required(t("nameRequired")),
    description: Yup.string().nullable(),
    assigned_to: Yup.string().nullable(),
  });

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState("");
  const [detailIssue, setDetailIssue] = useState(null);
  const [confirmStatusId, setConfirmStatusId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  const [editAssignee, setEditAssignee] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [detailSaveError, setDetailSaveError] = useState("");
  const [detailSaveSuccess, setDetailSaveSuccess] = useState(false);

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
  }, [page, debouncedName]);

  const fetchIssues = async (pageNumber, name) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: pageNumber, per_page: ISSUES_PER_PAGE });
      if (name) params.append("name", name);
      const res = await axios.get(
        `${API_BASE_URL}/api/issue-tracker?${params.toString()}`,
        { headers: authHeaders() }
      );
      const data = res.data;
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
    } catch (err) {
      console.error("fetchIssues:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIssues = () => fetchIssues(page, debouncedName);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/issue-tracker/users`, { headers: authHeaders() })
      .then((res) => { if (res?.data) setUsers(res.data); })
      .catch((err) => console.error("fetchUsers:", err));
  }, []);

  const openDetail = (issue) => {
    setDetailIssue(issue);
    setEditAssignee(issue.assigned_to ?? "");
    setEditDescription(issue.description ?? "");
    setDetailSaveError("");
    setDetailSaveSuccess(false);
  };

  const closeDetail = () => {
    setDetailIssue(null);
    setDetailSaveError("");
    setDetailSaveSuccess(false);
  };

  const handleSaveDetail = async () => {
    setIsSavingDetail(true);
    setDetailSaveError("");
    setDetailSaveSuccess(false);
    try {
      await axios.put(
        `${API_BASE_URL}/api/issue-tracker/${detailIssue.id}/assign`,
        { assigned_to: editAssignee || null },
        { headers: authHeaders() }
      );

      await axios.patch(
        `${API_BASE_URL}/api/issue-tracker/${detailIssue.id}`,
        { description: editDescription || null },
        { headers: authHeaders() }
      );
      setDetailSaveSuccess(true);
      await refreshIssues();
      const updatedAssignee = users.find((u) => String(u.id) === String(editAssignee)) || null;
      setDetailIssue((prev) => ({
        ...prev,
        description: editDescription || null,
        assigned_to: editAssignee || null,
        assignee: updatedAssignee,
      }));
      setTimeout(() => setDetailSaveSuccess(false), 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save changes.";
      setDetailSaveError(msg);
      console.error("handleSaveDetail:", err);
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleAddIssue = async (values, { resetForm }) => {
    setAddError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/issue-tracker`,
        {
          issue_name: values.issue_name,
          description: values.description || null,
          assigned_to: values.assigned_to || null,
        },
        { headers: authHeaders() }
      );
      if (res.status === 201 || res.status === 200) {
        resetForm();
        setShowAddModal(false);
        refreshIssues();
      }
    } catch (err) {
      setAddError(err?.response?.data?.message || err?.response?.data?.error || "Failed to create issue.");
      console.error("handleAddIssue:", err);
    }
  };

  const openStatusConfirm = (issue, newStatus) => {
    setConfirmStatusId(issue.id);
    setPendingStatus(newStatus);
  };

  const confirmStatusChange = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/issue-tracker/${confirmStatusId}/status`,
        { status: pendingStatus },
        { headers: authHeaders() }
      );
      setConfirmStatusId(null);
      setPendingStatus(null);
      refreshIssues();
    } catch (err) {
      console.error("confirmStatusChange:", err);
    }
  };

  const handleToggle = (index) => {
    setMenuOpen((prev) => { const n = [...prev]; n[index] = !n[index]; return n; });
  };

  const handlePageChange = (n) => {
    if (n >= 1 && n <= totalPages) setPage(n);
  };

  const fmtDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const statusLabel = (v) => STATUS_OPTIONS.find((s) => s.value === v)?.label || v;

  const initials = (name) =>
    name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <>
      <Modal show={showAddModal}>
        <div>
          <h1>{t("addIssue")}</h1>
          <Formik
            initialValues={{ issue_name: "", description: "", assigned_to: "" }}
            validationSchema={NewIssueSchema}
            onSubmit={handleAddIssue}
          >
            {({ submitForm, isSubmitting }) => (
              <form className="row" onSubmit={(e) => e.preventDefault()}>
                <div className="col-12 mt-2">
                  <TextInput label={t("issueName")} placeholder={t("issueNamePlaceholder")} name="issue_name" />
                </div>
                <div className="col-12 mt-2">
                  <label className="form-label">{t("description")}</label>
                  <Field as="textarea" name="description" className="form-control" rows={4} placeholder={t("descriptionPlaceholder")} />
                </div>
                <div className="col-12 mt-2">
                  <label className="form-label">{t("assignTo")}</label><br />
                  <Field className="select-role" as="select" name="assigned_to">
                    <option value="">{t("unassigned")}</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Field>
                </div>
                {addError && <div className="col-12 mt-2"><div className="alert alert-danger py-2">{addError}</div></div>}
                <div className="spacer" />
                <div>
                  <div className="float-left">
                    <Button onClick={submitForm} disabled={isSubmitting}>
                      {isSubmitting ? t("adding") : t("addIssue")}
                    </Button>
                  </div>
                  <div className="float-right">
                    <Button onClick={() => { setShowAddModal(false); setAddError(""); }}>{t("close")}</Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </Modal>

      <Modal show={detailIssue !== null}>
        {detailIssue && (
          <div className="issue-detail-modal">

            <div className="idm-header">
              <div className="idm-header-left">
                <span className="idm-issue-id">#{String(detailIssue.id).padStart(4, "0")}</span>
                <h2 className="idm-title">{detailIssue.issue_name}</h2>
              </div>
              <span className={`${STATUS_BADGE_CLASS[detailIssue.status] || "badge bg-secondary"} idm-status-badge`}>
                {statusLabel(detailIssue.status)}
              </span>
            </div>

            <div className="idm-meta-row">
              <div className="idm-meta-item">
                <span className="idm-meta-label">{t("columnCreatedBy")}</span>
                {detailIssue.creator?.name ? (
                  <div className="idm-user-chip">
                    <div className="idm-avatar">{initials(detailIssue.creator.name)}</div>
                    <span>{detailIssue.creator.name}</span>
                  </div>
                ) : <span className="idm-muted">—</span>}
              </div>
              <div className="idm-meta-item">
                <span className="idm-meta-label">{t("columnCreatedAt")}</span>
                <span className="idm-meta-value">{fmtDate(detailIssue.created_at)}</span>
              </div>
            </div>

            <div className="idm-divider" />

            <div className="idm-field">
              <label className="idm-field-label">{t("columnAssignedTo")}</label>
              <select
                className="form-select form-select-sm idm-select"
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
              >
                <option value="">{t("unassigned")}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="idm-field">
              <label className="idm-field-label">{t("description")}</label>
              <textarea
                className="form-control form-control-sm idm-textarea"
                rows={5}
                placeholder={t("descriptionPlaceholder")}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            {detailSaveError && (
              <div className="alert alert-danger py-2 mt-2">{detailSaveError}</div>
            )}
            {detailSaveSuccess && (
              <div className="alert alert-success py-2 mt-2">{t("save")} ✓</div>
            )}

            <div className="idm-footer">
              <div className="idm-footer-left">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    {t("columnStatus")}: {statusLabel(detailIssue.status)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {STATUS_OPTIONS.filter((s) => s.value !== detailIssue.status).map((s) => (
                      <Dropdown.Item
                        key={s.value}
                        onClick={() => openStatusConfirm(detailIssue, s.value)}
                      >
                        {t("markAs")} {s.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="idm-footer-right">
                <Button variant="secondary" size="sm" onClick={closeDetail}>{t("close")}</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDetail}
                  disabled={isSavingDetail}
                >
                  {isSavingDetail ? "…" : t("save")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ModalApproval show={confirmStatusId !== null}>
        <div>
          <h1>{t("areYouSure")}</h1>
          <div>{t("changeStatusTo")} <strong>{statusLabel(pendingStatus)}</strong>?</div>
          <div className="spacer" />
          <div>
            <div className="float-left">
              <Button onClick={confirmStatusChange}>{t("yes")}</Button>
            </div>
            <div className="float-right">
              <Button onClick={() => { setConfirmStatusId(null); setPendingStatus(null); }}>{t("no")}</Button>
            </div>
          </div>
        </div>
      </ModalApproval>

      <div className="button-bar">
        <Button variant="primary" size="sm" onClick={() => { setAddError(""); setShowAddModal(true); }}>
          {t("addIssue")}
        </Button>
      </div>

      <div className="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "260px" }}
          placeholder={t("searchByIssueName")}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          aria-label={t("searchByIssueName")}
        />
        {hasActiveSearch && (
          <Button variant="outline-secondary" size="sm" onClick={() => setSearchName("")}>
            {t("clearSearch")}
          </Button>
        )}
      </div>

      <div className="mt-2">
        <div className="table-header-issues">
          <div className="column-issues">#</div>
          <div className="column-issues">{t("columnId")}</div>
          <div className="column-issues">{t("columnIssueName")}</div>
          <div className="column-issues">{t("columnStatus")}</div>
          <div className="column-issues">{t("columnAssignedTo")}</div>
          <div className="column-issues">{t("columnCreatedBy")}</div>
          <div className="column-issues">{t("columnCreatedAt")}</div>
          <div className="column-issues">{t("columnActions")}</div>
        </div>

        <div className="table-body-issues">
          {isLoading ? (
            <div className="loading-screen-issues">
              <img src={LOADING} alt={t("loading")} />
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-4 text-muted">{t("noIssuesFound")}</div>
          ) : (
            issues.map((item, index) => {
              const rowNumber = (page - 1) * ISSUES_PER_PAGE + index + 1;
              return (
                <div key={item.id} className="mobile-table-body-issues">
                  <div className="mobile-table-header-issues">
                    <div>#</div>
                    <div>{t("columnId")}</div>
                    <div>{t("columnIssueName")}</div>
                    <div>{t("columnStatus")}</div>
                    <div>{t("columnAssignedTo")}</div>
                    <div>{t("columnCreatedBy")}</div>
                    <div>{t("columnCreatedAt")}</div>
                    <div>{t("columnActions")}</div>
                  </div>

                  <div
                    className="table-row-issues"
                    onClick={() => openDetail(item)}
                    title={t("viewDetails")}
                  >
                    <div className="column-issues">
                      <span className="text-muted" style={{ fontSize: "0.8rem" }}>{rowNumber}</span>
                    </div>
                    <div className="column-issues">
                      <span className="issue-id-cell">#{item.id}</span>
                    </div>
                    <div className="column-issues">
                      <span className="issue-name-cell">{item.issue_name}</span>
                    </div>
                    <div className="column-issues">
                      <span className={STATUS_BADGE_CLASS[item.status] || "badge bg-secondary"}>
                        {statusLabel(item.status)}
                      </span>
                    </div>
                    <div className="column-issues">
                      {item.assignee?.name ? (
                        <div className="user-cell">
                          <div className="user-avatar">{initials(item.assignee.name)}</div>
                          <span>{item.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted fst-italic" style={{ fontSize: "0.82rem" }}>{t("unassigned")}</span>
                      )}
                    </div>
                    <div className="column-issues">
                      {item.creator?.name ? (
                        <div className="user-cell">
                          <div className="user-avatar">{initials(item.creator.name)}</div>
                          <span>{item.creator.name}</span>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </div>
                    <div className="column-issues">
                      <span style={{ fontSize: "0.82rem", color: "#dadddf" }}>{fmtDate(item.created_at)}</span>
                    </div>
                    <div className="column-issues" onClick={(e) => e.stopPropagation()}>
                      <Dropdown show={menuOpen[index]} onToggle={() => handleToggle(index)}>
                        <Dropdown.Toggle variant="success" size="sm" id={`issue-dd-${item.id}`}>
                          {t("actions")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className={`mobile-dropdown ${menuOpen[index] ? "visible" : ""}`}>
                          <Dropdown.Item onClick={() => openDetail(item)}>{t("viewDetails")}</Dropdown.Item>
                          {STATUS_OPTIONS.filter((s) => s.value !== item.status).map((s) => (
                            <Dropdown.Item key={s.value} onClick={() => openStatusConfirm(item, s.value)}>
                              {t("markAs")} {s.label}
                            </Dropdown.Item>
                          ))}
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
          <div className="d-flex justify-content-start align-items-center gap-3 mt-3">
            <Button variant="outline-primary" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              {t("previous")}
            </Button>
            <span className="text-muted" style={{ fontSize: "0.88rem" }}>{t("page")} {page} / {totalPages}</span>
            <Button variant="outline-primary" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              {t("next")}
            </Button>
          </div>
        )}
        <div className="spacer" />
      </div>
    </>
  );
}

export default IssueTracker;