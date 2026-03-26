import React, { useState, useEffect, useCallback } from 'react';
import './IssueTracker.css';

const formatStatus = (status) => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Done';
    default:
      return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'todo':
      return 'status-todo';
    case 'in_progress':
      return 'status-in_progress';
    case 'done':
      return 'status-done';
    default:
      return '';
  }
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const API_BASE_URL = '/api/issue-tracker';

const IssueTrackerApp = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newIssue, setNewIssue] = useState({
    issue_name: '',
    description: '',
    assigned_to: '',
  });
  const [assignData, setAssignData] = useState({
    assigned_to: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch issues');
      const data = await response.json();
      setIssues(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!newIssue.issue_name.trim()) {
      setFormErrors({ issue_name: 'Issue name is required' });
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue_name: newIssue.issue_name,
          description: newIssue.description,
          assigned_to: newIssue.assigned_to || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create issue');
      }

      const createdIssue = await response.json();
      setIssues([createdIssue, ...issues]);
      setShowCreateModal(false);
      setNewIssue({ issue_name: '', description: '', assigned_to: '' });
    } catch (err) {
      setFormErrors({ submit: err.message });
    }
  };

  const handleUpdateStatus = async (issueId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedIssue = await response.json();
      setIssues(issues.map(issue =>
        issue.id === issueId ? { ...issue, ...updatedIssue } : issue
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const openAssignModal = (issue) => {
    setSelectedIssue(issue);
    setAssignData({ assigned_to: issue.assigned_to?.id?.toString() || '' });
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedIssue.id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigned_to: assignData.assigned_to || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to assign user');

      const updatedIssue = await response.json();
      setIssues(issues.map(issue =>
        issue.id === selectedIssue.id ? { ...issue, assigned_to: updatedIssue.assigned_to } : issue
      ));
      setShowAssignModal(false);
      setSelectedIssue(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredIssues = filterStatus === 'all'
    ? issues
    : issues.filter(issue => issue.status === filterStatus);

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  const getUserInitials = (user) => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container-fluid px-4 py-3">

      <nav className="navbar navbar-custom rounded-3 mb-4 p-3">
        <div className="container-fluid">
          <span className="navbar-brand text-white fw-bold fs-4">
            Issue Tracker
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-light btn-outline-custom"
              onClick={() => setShowCreateModal(true)}
            >
              + New Issue
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'todo', 'in_progress', 'done'].map(status => (
          <button
            key={status}
            className={`btn btn-outline-secondary ${filterStatus === status ? 'filter-btn-active text-white' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'all' ? 'All Issues' : formatStatus(status)}
            {status !== 'all' && (
              <span className="ms-2 badge bg-secondary bg-opacity-25 rounded-pill">
                {issues.filter(i => i.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3">
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <p className="mt-3 text-muted">No issues found. Create your first issue!</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="col-12">
              <div className="card issue-card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                    <div className="d-flex gap-3 align-items-start flex-grow-1">
                      <div className="issue-avatar flex-shrink-0" title={`Created by ${issue.creator?.name || 'Unknown'}`}>
                        {getUserInitials(issue.creator)}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1 fw-semibold">{issue.issue_name}</h5>
                        {issue.description && (
                          <p className="description-text mb-2">{issue.description}</p>
                        )}
                        <div className="d-flex flex-wrap gap-3 align-items-center mt-2">
                          <div className="dropdown">
                            <button
                              className={`status-badge ${getStatusClass(issue.status)} dropdown-toggle`}
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {formatStatus(issue.status)}
                            </button>
                            <ul className="dropdown-menu">
                              {STATUS_OPTIONS.map(opt => (
                                <li key={opt.value}>
                                  <button
                                    className={`dropdown-item ${issue.status === opt.value ? 'active' : ''}`}
                                    onClick={() => handleUpdateStatus(issue.id, opt.value)}
                                  >
                                    {opt.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-person-badge text-secondary"></i>
                            <span className="text-secondary small">
                              {issue.assigned_to ? (
                                <span className="fw-medium">{issue.assigned_to.name}</span>
                              ) : (
                                <span className="fst-italic">Unassigned</span>
                              )}
                            </span>
                            <button
                              className="btn btn-sm btn-link text-decoration-none p-0"
                              onClick={() => openAssignModal(issue)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-clock-history text-secondary"></i>
                            <span className="text-secondary small">
                              {new Date(issue.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openAssignModal(issue)}
                        title="Assign user"
                      >
                        <i className="bi bi-person-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Create New Issue</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateIssue}>
                <div className="modal-body">
                  {formErrors.submit && (
                    <div className="alert alert-danger py-2">{formErrors.submit}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Issue Name *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.issue_name ? 'is-invalid' : ''}`}
                      value={newIssue.issue_name}
                      onChange={(e) => setNewIssue({ ...newIssue, issue_name: e.target.value })}
                      placeholder="Enter issue title"
                    />
                    {formErrors.issue_name && <div className="invalid-feedback">{formErrors.issue_name}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      placeholder="Describe the issue (optional)"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      value={newIssue.assigned_to}
                      onChange={(e) => setNewIssue({ ...newIssue, assigned_to: e.target.value })}
                    >
                      <option value="">-- Unassigned --</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Issue</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showAssignModal && selectedIssue && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-secondary text-white">
                <h5 className="modal-title">Assign User: {selectedIssue.issue_name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssign}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select User</label>
                    <select
                      className="form-select"
                      value={assignData.assigned_to}
                      onChange={(e) => setAssignData({ assigned_to: e.target.value })}
                    >
                      <option value="">-- Unassigned --</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Assign</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTrackerApp;