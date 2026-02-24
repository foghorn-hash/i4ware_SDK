import React, { useState, useEffect, useRef } from "react";
import "./ManageDomain.css";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Button, Pagination } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    actions: "Actions",
    extendTrial30Days: "Extend Trial 30 days",
    makePaidSubscription: "Make a Paid Subscription",
    downgradeToTrial: "Downgrade to Trial",
    extendTrialOneYear: "Extend Trial by One year",
    terminateDomain: "Terminate domain",
    domain: "Domain",
    validBeforeAt: "Valid Before At",
    type: "Type",
    company: "Company",
    vatId: "VAT-ID",
    phone: "Phone",
    email: "Email",
    country: "Country",
    edit: "Edit",
    paid: "Paid",
    trial: "Trial",
    previous: "Previous",
    next: "Next",
    searchByCompany: "Search by company...",
    searchByVatId: "Search by VAT-ID...",
    clearSearch: "Clear",
    noDomainsFound: "No domains found matching your search.",
  },
  fi: {
    actions: "Toiminnot",
    extendTrial30Days: "Jatka kokeilua 30 päivällä",
    makePaidSubscription: "Tee tilaus maksulliseksi",
    downgradeToTrial: "Alenna kokeiluversioksi",
    extendTrialOneYear: "Jatka kokeilua yhdellä vuodella",
    terminateDomain: "Mitätöi domain",
    domain: "Domain",
    validBeforeAt: "Voimassa Ennen",
    type: "Tyyppi",
    company: "Yritys",
    vatId: "ALV-tunnus",
    phone: "Puhelin",
    email: "Sähköposti",
    country: "Maa",
    edit: "Muokkaa",
    paid: "Makssullinen",
    trial: "Kokeilu",
    previous: "Edellinen",
    next: "Seuraava",
    searchByCompany: "Hae yrityksellä...",
    searchByVatId: "Hae ALV-tunnuksella...",
    clearSearch: "Tyhjennä",
    noDomainsFound: "Hakuasi vastaavia domaineja ei löydy.",
  },
  sv: {
    actions: "Åtgärder",
    extendTrial30Days: "Förläng provperioden med 30 dagar",
    makePaidSubscription: "Gör prenumeration betald",
    downgradeToTrial: "Nedgradera till provperiod",
    extendTrialOneYear: "Förläng provperioden med ett år",
    terminateDomain: "Avsluta domän",
    domain: "Domän",
    validBeforeAt: "Giltig till",
    type: "Typ",
    company: "Företag",
    vatId: "Momsnummer",
    phone: "Telefon",
    email: "E-post",
    country: "Land",
    edit: "Redigera",
    paid: "Betald",
    trial: "Prov",
    previous: "Föregående",
    next: "Nästa",
    searchByCompany: "Sök efter företag...",
    searchByVatId: "Sök efter momsnummer...",
    clearSearch: "Rensa",
    noDomainsFound: "Inga domäner hittades som matchar din sökning.",
  },
});

const DOMAINS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

function Menu({ id, domainActionApi, index }) {
  const [menuOpen, setMenuOpen] = useState([]);

  const handleToggle = (index) => {
    setMenuOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <Dropdown
      drop="up"
      align={window.innerWidth > 900 ? "end" : "start"}
      show={menuOpen[index]}
      onToggle={() => handleToggle(index)}
    >
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {strings.actions}
      </Dropdown.Toggle>
      <Dropdown.Menu className={`mobile-dropdown ${menuOpen[index] ? "visible" : ""}`}>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-trial")}>
          {strings.extendTrial30Days}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "make-paid")}>
          {strings.makePaidSubscription}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "down-to-trial")}>
          {strings.downgradeToTrial}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-one-year")}>
          {strings.extendTrialOneYear}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => domainActionApi(id, "terminate")}
          style={{ background: "#ffbfbf" }}
        >
          {strings.terminateDomain}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function ManageDomain(props) {
  const [domains, setDomains] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Raw input values — update instantly so inputs feel responsive
  const [searchCompany, setSearchCompany] = useState("");
  const [searchVatId, setSearchVatId] = useState("");

  // Debounced values sent to the API
  const [debouncedCompany, setDebouncedCompany] = useState("");
  const [debouncedVatId, setDebouncedVatId] = useState("");

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization === null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const { authState, authActions } = React.useContext(AuthContext);

  const totalPages = Math.max(1, Math.ceil(total / DOMAINS_PER_PAGE));
  const hasActiveSearch = debouncedCompany !== "" || debouncedVatId !== "";

  // Debounce company
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCompany(searchCompany.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchCompany]);

  // Debounce VAT-ID
  useEffect(() => {
    const t = setTimeout(() => setDebouncedVatId(searchVatId.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchVatId]);

  // Reset to page 1 when search terms change (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedCompany, debouncedVatId]);

  // Fetch whenever page or debounced search terms change
  useEffect(() => {
    fetchDomains(page, debouncedCompany, debouncedVatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedCompany, debouncedVatId]);

  const fetchDomains = (pageNumber, company, vatId) => {
    setIsLoading(true);

    const params = new URLSearchParams({ page: pageNumber, per_page: DOMAINS_PER_PAGE });
    if (company) params.append("company_name", company);
    if (vatId)   params.append("vat_id", vatId);

    request()
      .get(`/api/manage/domains?${params.toString()}`)
      .then((res) => {
        const responseData = res.data;
        if (Array.isArray(responseData)) {
          // Old plain-array response (fallback)
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
      .then(() => refreshDomains());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const renderPaginationItems = () => {
    const items = [];
    const delta = 2;
    const left  = Math.max(1, page - delta);
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

  if (isLoading && domains.length === 0) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  return (
    <>
      {/* ── Search bar ───────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "240px" }}
          placeholder={strings.searchByCompany}
          value={searchCompany}
          onChange={(e) => setSearchCompany(e.target.value)}
          aria-label="Search by company"
        />
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "200px" }}
          placeholder={strings.searchByVatId}
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
            {strings.clearSearch}
          </Button>
        )}
      </div>

      <div className="mt-2">
        <div className="table-header-domains">
          <div className="column_domains">#</div>
          <div className="column_domains">{strings.domain}</div>
          <div className="column_domains">{strings.validBeforeAt}</div>
          <div className="column_domains">{strings.type}</div>
          <div className="column_domains">{strings.company}</div>
          <div className="column_domains">{strings.vatId}</div>
          <div className="column_domains"></div>
          <div className="column_domains"></div>
        </div>

        <div className="table-body-domains">
          {isLoading ? (
            <div className="loading-screen">
              <img src={LOADING} alt="Loading..." />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-4 text-muted">
              {strings.noDomainsFound}
            </div>
          ) : (
            domains.map((item, index) => {
              const rowNumber = (page - 1) * DOMAINS_PER_PAGE + index + 1;
              return (
                <div className="mobile-table-body-domains" key={item.id || index}>
                  <div className="mobile-table-header-domains">
                    <div className="column_domains">#</div>
                    <div className="column_domains">{strings.domain}</div>
                    <div className="column_domains">{strings.validBeforeAt}</div>
                    <div className="column_domains">{strings.type}</div>
                    <div className="column_domains">{strings.company}</div>
                    <div className="column_domains">{strings.vatId}</div>
                    <div className="column_domains"></div>
                    <div className="column_domains"></div>
                  </div>
                  <div className="table-row-domains">
                    <div className="column_domains">{rowNumber}</div>
                    <div className="column_domains">{item.domain}</div>
                    <div className="column_domains">{item.valid_before_at}</div>
                    <div className="column_domains">
                      {item.type === "paid" && (
                        <li className="badge bg-success">{strings.paid}</li>
                      )}
                      {item.type === "trial" && (
                        <li className="badge bg-primary">{strings.trial}</li>
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
                          {strings.edit}
                        </Button>
                      </PermissionGate>
                    </div>
                    <div className="column_domains">
                      <PermissionGate permission={"domain.actions"}>
                        <Menu
                          id={item.id}
                          index={index}
                          domainActionApi={(id, action) =>
                            domainUpdateApi({ id, action })
                          }
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
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)}          disabled={page === 1} />
              <Pagination.Prev  onClick={() => handlePageChange(page - 1)}   disabled={page === 1} />
              {renderPaginationItems()}
              <Pagination.Next  onClick={() => handlePageChange(page + 1)}   disabled={page === totalPages} />
              <Pagination.Last  onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        )}

        <div className="spacer"></div>
      </div>
    </>
  );
}

export default withRouter(ManageDomain);