import React, { useState, useEffect, useRef } from "react";
import "./ManageDomain.css";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import { useTranslation } from "react-i18next";

const DOMAINS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

function Menu({ id, domainActionApi, index }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      drop="up"
      align={window.innerWidth > 900 ? "end" : "start"}
      show={isOpen}
      onToggle={(nextShow) => setIsOpen(nextShow)}
    >
      <Dropdown.Toggle variant="success" id={`dropdown-domain-${id}`}>
        {t("actions")}
      </Dropdown.Toggle>
      <Dropdown.Menu className={`mobile-dropdown ${isOpen ? "visible" : ""}`}>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-trial")}>
          {t("extendTrial30Days")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "make-paid")}>
          {t("makePaidSubscription")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "down-to-trial")}>
          {t("downgradeToTrial")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-one-year")}>
          {t("extendTrialOneYear")}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "make-admin-domain")}>
          {t("upgradeToAdmin")}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => domainActionApi(id, "terminate")}
          style={{ background: "#ffbfbf" }}
        >
          {t("terminateDomain")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function ManageDomain(props) {
  const { t, i18n } = useTranslation();

  const [domains, setDomains] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [searchCompany, setSearchCompany] = useState("");
  const [searchVatId, setSearchVatId] = useState("");
  const [debouncedCompany, setDebouncedCompany] = useState("");
  const [debouncedVatId, setDebouncedVatId] = useState("");

  const { authState, authActions } = React.useContext(AuthContext);

  const totalPages = Math.max(1, Math.ceil(total / DOMAINS_PER_PAGE));
  const hasActiveSearch = debouncedCompany !== "" || debouncedVatId !== "";

  // Sync language from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  // Debounce company
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCompany(searchCompany.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchCompany]);

  // Debounce VAT-ID
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVatId(searchVatId.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchVatId]);

  // Reset to page 1 on search change (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedCompany, debouncedVatId]);

  // Fetch on page or search change
  useEffect(() => {
    fetchDomains(page, debouncedCompany, debouncedVatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedCompany, debouncedVatId]);

  const fetchDomains = (pageNumber, company, vatId) => {
    setIsLoading(true);

    const params = new URLSearchParams({ page: pageNumber, per_page: DOMAINS_PER_PAGE });
    if (company) params.append("company_name", company);
    if (vatId) params.append("vat_id", vatId);

    request()
      .get(`/api/manage/domains?${params.toString()}`)
      .then((res) => {
        const responseData = res.data;
        if (Array.isArray(responseData)) {
          setDomains(responseData);
          setTotal(
            responseData.length < DOMAINS_PER_PAGE
              ? (pageNumber - 1) * DOMAINS_PER_PAGE + responseData.length
              : pageNumber * DOMAINS_PER_PAGE + 1
          );
        } else {
          setDomains(responseData.data ?? []);
          setTotal(responseData.total ?? 0);
        }
      })
      .catch((error) => {
        console.error("Error loading domains:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const refreshDomains = () => fetchDomains(page, debouncedCompany, debouncedVatId);

  const domainUpdateApi = (data) => {
    request()
      .post("/api/manage/updateDomainRecord", data)
      .then(() => refreshDomains())
      .catch((error) => {
        console.error("Error updating domain:", error);
      });
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  if (isLoading && domains.length === 0) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  return (
    <>
      {/* Search bar */}
      <div className="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "240px" }}
          placeholder={t("searchByCompany")}
          value={searchCompany}
          onChange={(e) => setSearchCompany(e.target.value)}
          aria-label="Search by company"
        />
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "200px" }}
          placeholder={t("searchByVatId")}
          value={searchVatId}
          onChange={(e) => setSearchVatId(e.target.value)}
          aria-label="Search by VAT-ID"
        />
        {hasActiveSearch && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => { setSearchCompany(""); setSearchVatId(""); }}
          >
            {t("clearSearch")}
          </Button>
        )}
      </div>

      <div className="mt-2">
        <div className="table-header-domains">
          <div className="column_domains">#</div>
          <div className="column_domains">{t("domain")}</div>
          <div className="column_domains">{t("validBeforeAt")}</div>
          <div className="column_domains">{t("type")}</div>
          <div className="column_domains">{t("company")}</div>
          <div className="column_domains">{t("vatId")}</div>
          <div className="column_domains"></div>
          <div className="column_domains"></div>
        </div>

        <div className="table-body-domains">
          {isLoading ? (
            <div className="loading-screen">
              <img src={LOADING} alt="Loading..." />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-4 text-muted">{t("noDomainsFound")}</div>
          ) : (
            domains.map((item, index) => {
              const rowNumber = (page - 1) * DOMAINS_PER_PAGE + index + 1;
              return (
                <div className="mobile-table-body-domains" key={item.id || index}>
                  <div className="mobile-table-header-domains">
                    <div className="column_domains">#</div>
                    <div className="column_domains">{t("domain")}</div>
                    <div className="column_domains">{t("validBeforeAt")}</div>
                    <div className="column_domains">{t("type")}</div>
                    <div className="column_domains">{t("company")}</div>
                    <div className="column_domains">{t("vatId")}</div>
                    <div className="column_domains"></div>
                    <div className="column_domains"></div>
                  </div>
                  <div className="table-row-domains">
                    <div className="column_domains">{rowNumber}</div>
                    <div className="column_domains">{item.domain}</div>
                    <div className="column_domains">{item.valid_before_at}</div>
                    <div className="column_domains">
                      {item.type === "paid" && (
                        <li className="badge bg-success">{t("paid")}</li>
                      )}
                      {item.type === "trial" && (
                        <li className="badge bg-primary">{t("trial")}</li>
                      )}
                      {item.type === "admin_domain" && (
                        <li className="badge bg-info">{t("admin")}</li>
                      )}
                    </div>
                    <div className="column_domains">{item.company_name}</div>
                    <div className="column_domains">{item.vat_id}</div>
                    <div className="column_domains">
                      <PermissionGate permission={"domain.edit"}>
                        <Button
                          className="btn-info"
                          size="sm"
                          onClick={() => {
                            props.history.push({
                              pathname: "/manage-domains/edit",
                              state: { item: item, from: "edit" },
                            });
                          }}
                        >
                          {t("edit")}
                        </Button>
                      </PermissionGate>
                    </div>
                    <div className="column_domains">
                      <PermissionGate permission={"domain.actions"}>
                        <Menu
                          id={item.id}
                          index={index}
                          domainActionApi={(id, action) => domainUpdateApi({ id, action })}
                        />
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              {t("previous")}
            </Button>
            <span>{t("page")} {page} / {totalPages}</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              {t("next")}
            </Button>
          </div>
        )}

        <div className="spacer"></div>
      </div>
    </>
  );
}

export default withRouter(ManageDomain);