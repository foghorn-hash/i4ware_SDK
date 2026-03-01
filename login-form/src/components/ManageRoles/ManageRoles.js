import React, { useState, useEffect } from 'react';
import "./ManageRoles.css";
import { withRouter } from 'react-router-dom';
import { Button, Pagination } from 'react-bootstrap';
import request from '../../utils/Request';
import { AuthContext } from '../../contexts/auth.contexts';
import LOADING from '../../tube-spinner.svg';
import { useTranslation } from 'react-i18next';

const ROLES_PER_PAGE = 50;

function ManageRoles(props) {
  const { t, i18n } = useTranslation();
  const { authState, authActions } = React.useContext(AuthContext);

  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / ROLES_PER_PAGE));

  // Sync language from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  useEffect(() => {
    fetchRoles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchRoles = (pageNumber) => {
    setIsLoading(true);
    request()
      .get(`/api/manage/roles?page=${pageNumber}&per_page=${ROLES_PER_PAGE}`)
      .then((res) => {
        const responseData = res.data;
        if (Array.isArray(responseData)) {
          setRoles(responseData);
          setTotal(
            responseData.length < ROLES_PER_PAGE
              ? (pageNumber - 1) * ROLES_PER_PAGE + responseData.length
              : pageNumber * ROLES_PER_PAGE + 1
          );
        } else {
          setRoles(responseData.data ?? []);
          setTotal(responseData.total ?? 0);
        }
      })
      .catch((error) => {
        console.error("Error loading roles:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const refreshRoles = () => fetchRoles(page);

  const removeItem = (role) => {
    request()
      .get("/api/manage/role/" + role.id)
      .then(() => refreshRoles());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const renderPaginationItems = () => {
    const items = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>
      );
      if (left > 2) items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
    }

    for (let p = left; p <= right; p++) {
      items.push(
        <Pagination.Item key={p} active={p === page} onClick={() => handlePageChange(p)}>
          {p}
        </Pagination.Item>
      );
    }

    if (right < totalPages) {
      if (right < totalPages - 1)
        items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  return (
    <>
      <div className="my-5">
        <Button onClick={() => props.history.push("/manage-roles/add")}>
          {t("add")}
        </Button>
      </div>

      <div className="mt-3">
        <div className="table-header-roles">
          <div className="column-actions-roles">#</div>
          <div className="column-actions-roles">{t("name")}</div>
          <div className="column-actions-roles">{t("domain")}</div>
          <div className="column-actions-roles"></div>
        </div>

        <div className="table-body-roles">
          {isLoading ? (
            <div className="loading-screen">
              <img src={LOADING} alt="Loading..." />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-4 text-muted">{t("noRolesFound")}</div>
          ) : (
            roles.map((role, index) => {
              const rowNumber = (page - 1) * ROLES_PER_PAGE + index + 1;
              return (
                <div className="mobile-table-body-roles" key={role.id}>
                  <div className="mobile-table-header-roles">
                    <div className="column-actions-roles">#</div>
                    <div className="column-actions-roles">{t("name")}</div>
                    <div className="column-actions-roles">{t("domain")}</div>
                    <div className="column-actions-roles"></div>
                  </div>
                  <div className="table-row-roles">
                    <div className="column-actions-roles">{rowNumber}</div>
                    <div className="column-actions-roles">{role.name}</div>
                    <div className="column-actions-roles">{role.domain}</div>
                    <div className="column-actions-roles">
                      <Button
                        className="btn-info"
                        size="sm"
                        onClick={() => {
                          props.history.push({
                            pathname: "/manage-roles/edit",
                            state: { item: role, from: "edit" },
                          });
                        }}
                      >
                        {t("edit")}
                      </Button>
                      <Button
                        className="mx-2 btn-danger"
                        size="sm"
                        onClick={() => removeItem(role)}
                      >
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
              {renderPaginationItems()}
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        )}

        <div className="spacer"></div>
      </div>
    </>
  );
}

export default withRouter(ManageRoles);