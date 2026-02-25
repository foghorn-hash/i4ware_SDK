import React, { useState, useEffect, useRef } from "react";
import "./ManageDomain.css";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Button, Pagination } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from "react-infinite-scroller";
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
  },
});

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
      show={isOpen}
      onToggle={(nextShow) => setIsOpen(nextShow)}
    >
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {t('actions')}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className={`mobile-dropdown ${menuOpen[index] ? "visible" : ""}`}
      >
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "extend-trial");
          }}
        >
          {strings.extendTrial30Days}{" "}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "make-paid");
          }}
        >
          {strings.makePaidSubscription}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "down-to-trial");
          }}
        >
          {strings.downgradeToTrial}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "extend-one-year");
          }}
        >
          {strings.extendTrialOneYear}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "make-admin-domain")}>
          {strings.upgradeToAdmin}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => domainActionApi(id, "terminate")}
          style={{ background: "#ffbfbf" }}
        >
          {t('terminateDomain')}
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

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const { authState, authActions } = React.useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedCompany, debouncedVatId]);

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
        const newDomains = res.data;
        if (newDomains && newDomains.length > 0) {
          setDomains((prevDomains) => [
            ...new Set([...prevDomains, ...newDomains]),
          ]);
          setPage((prevPage) => prevPage + 1);
        } else {
          setHasMore(false);
        }
      })
      .catch((error) => {
        console.error("Error loading more domains:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const refreshDomains = () => fetchDomains(page, debouncedCompany, debouncedVatId);

  const domainUpdateApi = (data) => {
    request()
      .post("/api/manage/updateDomainRecord", data)
      .then((res) => {
        request()
          .get("/api/manage/domains")
          .then((res) => {
            setDomains(res.data);
          });
      });
  };

  if (domains.length === 0 && !isLoading) {
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
          <div className="column_domains">{t('domain')}</div>
          <div className="column_domains">{t('validBeforeAt')}</div>
          <div className="column_domains">{t('type')}</div>
          <div className="column_domains">{t('company')}</div>
          <div className="column_domains">{t('vatId')}</div>
          <div className="column_domains"></div>
          <div className="column_domains"></div>
        </div>

        <div className="table-body-domains">
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={!isLoading && hasMore}
            loader={<div className="loader">Loading...</div>}
          >
            {domains.map((item, index) => (
              <div className="mobile-table-body-domains">
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
                <div key={item.id || index} className="table-row-domains">
                  <div className="column_domains">{index + 1}</div>
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
                            state: {
                              item: item,
                              from: "edit",
                            },
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
                        domainActionApi={(id, action) => {
                          domainUpdateApi({
                            id: id,
                            action: action,
                          });
                        }}
                      />
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
          <div className="spacer"></div>
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

export default withRouter(ManageDomain);