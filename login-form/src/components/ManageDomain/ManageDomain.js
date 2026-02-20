import React, { useState, useEffect } from "react";
import "./ManageDomain.css";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from "react-infinite-scroller";
import { useTranslation } from "react-i18next";

// Row Action Menu Component
function Menu({ id, domainActionApi }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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

      <Dropdown.Menu className={`mobile-dropdown ${isOpen ? "visible" : ""}`}>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-trial")}>
          {t('extendTrial30Days')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "make-paid")}>
          {t('makePaidSubscription')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "down-to-trial")}>
          {t('downgradeToTrial')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => domainActionApi(id, "extend-one-year")}>
          {t('extendTrialOneYear')}
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
  const [page, setPage] = useState(1);
  const [domains, setDomains] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sync language from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    request()
      .get(`/api/manage/domains?page=${page}`)
      .then((res) => {
        // DEBUG: console.log("Domain API Data:", res.data);
        
        if (res && res.data) {
          // Handle Laravel Pagination: res.data.data OR standard Array: res.data
          const incomingData = res.data.data ? res.data.data : res.data;
          
          if (Array.isArray(incomingData) && incomingData.length > 0) {
            setDomains((prevDomains) => {
              const combined = [...prevDomains, ...incomingData];
              // Filter duplicates by ID
              return Array.from(new Map(combined.map(item => [item.id, item])).values());
            });
            setPage((prevPage) => prevPage + 1);
          } else {
            setHasMore(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading more domains:", error);
        setHasMore(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const domainUpdateApi = (data) => {
    request()
      .post("/api/manage/updateDomainRecord", data)
      .then(() => {
        // Reset and refetch first page after an update
        setPage(1);
        setDomains([]);
        setHasMore(true);
        // loadMore will trigger automatically due to InfiniteScroll initialLoad
      });
  };

  // Show spinner only on very first load
  if (domains.length === 0 && isLoading && page === 1) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  return (
    <>
      <div className="mt-3">
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
            hasMore={hasMore}
            initialLoad={true}
            loader={<div className="loader" key={0}>Loading...</div>}
          >
            {domains.map((item, index) => (
              <div key={item.id || index} className="mobile-table-body-domains">
                {/* Mobile Header (Hidden on Desktop via CSS) */}
                <div className="mobile-table-header-domains">
                  <div className="column_domains">#</div>
                  <div className="column_domains">{t('domain')}</div>
                  <div className="column_domains">{t('validBeforeAt')}</div>
                  <div className="column_domains">{t('type')}</div>
                  <div className="column_domains">{t('company')}</div>
                  <div className="column_domains">{t('vatId')}</div>
                  <div className="column_domains"></div>
                  <div className="column_domains"></div>
                </div>

                <div className="table-row-domains">
                  <div className="column_domains">{index + 1}</div>
                  <div className="column_domains">{item.domain}</div>
                  <div className="column_domains">{item.valid_before_at}</div>
                  <div className="column_domains">
                    <li className={`badge ${item.type === "paid" ? "bg-success" : "bg-primary"}`}>
                      {item.type === "paid" ? t('paid') : t('trial')}
                    </li>
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
                            state: { item, from: "edit" },
                          });
                        }}
                      >
                        {t('edit')}
                      </Button>
                    </PermissionGate>
                  </div>
                  <div className="column_domains">
                    <PermissionGate permission={"domain.actions"}>
                      <Menu
                        id={item.id}
                        domainActionApi={(id, action) => {
                          domainUpdateApi({ id, action });
                        }}
                      />
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
          {domains.length === 0 && !isLoading && (
            <div className="text-center p-5">{t('noDataFound')}</div>
          )}
          <div className="spacer"></div>
        </div>
      </div>
    </>
  );
}

export default withRouter(ManageDomain);