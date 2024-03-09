import React, {useState} from "react";
import {useEffect} from "react";
import "./ManageDomain.css";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../1487-loading.gif";
import InfiniteScroll from 'react-infinite-scroller';
import LocalizedStrings from 'react-localization';

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
    next: "Next"
  },
  fi: {
    actions: "Toiminnot",
    extendTrial30Days: "Jatka kokeilua 30 päivällä",
    makePaidSubscription: "Tee maksullinen tilaus",
    downgradeToTrial: "Alenna kokeiluversioksi",
    extendTrialOneYear: "Jatka kokeilua yhdellä vuodella",
    terminateDomain: "Lopeta domain",
    domain: "Domain",
    validBeforeAt: "Voimassa Ennen",
    type: "Tyyppi",
    company: "Yritys",
    vatId: "ALV-tunnus",
    phone: "Puhelin",
    email: "Sähköposti",
    country: "Maa",
    edit: "Muokkaa",
    paid: "Maksettu",
    trial: "Kokeilu",
    previous: "Edellinen",
    next: "Seuraava"
  }
});

function Menu({id, domainActionApi}) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {strings.actions}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "extend-trial");
          }}
        >
          {strings.extendTrial30Days}{" "}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "make-paid");
        }}>
          {strings.makePaidSubscription}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "down-to-trial");
        }}>{strings.downgradeToTrial}</Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "extend-one-year");
        }} >
          {strings.extendTrialOneYear}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "terminate");
        }} style={{background: "#ffbfbf"}} >
          {strings.terminateDomain}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function ManageDomain(props) {
  const [page, setPage] = useState(1);
  const [domains, setDomains] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const {authState, authActions} = React.useContext(AuthContext);

  useEffect(() => {
    loadMore();
  }, []);

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    request().get(`/api/manage/domains?page=${page}`)
      .then(res => {
        const newDomains = res.data;
        if (newDomains && newDomains.length > 0) {
          setDomains(prevDomains => [...new Set([...prevDomains, ...newDomains])]);
          setPage(prevPage => prevPage + 1);
        } else {
          setHasMore(false);
        }
      })
      .catch(error => {
        console.error("Error loading more domains:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
};

  const domainUpdateApi = data => {
    request()
      .post("/api/manage/updateDomainRecord", data)
      .then(res => {
        request()
          .get("/api/manage/domains")
          .then(res => {
            setDomains(res.data);
          })
      })
  };

  if (domains.length === 0 && !isLoading) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
      <div className="mt-3">
          <div className="table-header-domains">
            <div className="column-number-domains">#</div>
            <div>{strings.domain}</div>
            <div>{strings.validBeforeAt}</div>
            <div>{strings.type}</div>
            <div>{strings.company}</div>
            <div>{strings.vatId}</div>
            <div></div>
            <div></div>
          </div>
          <div className="table-body-domains">
            <InfiniteScroll
              pageStart={0}
              loadMore={loadMore}
              hasMore={!isLoading && hasMore}
              loader={<div className="loader">Loading...</div>}
            >
              {domains.map((item, index) => (
                <div key={item.id || index} className="table-row-domains">
                  <div className="column-number-domains">{index + 1}</div>
                  <div>{item.domain}</div>
                  <div>{item.valid_before_at}</div>
                  <div>
                    {item.type === "paid" && <li className="badge bg-success">{strings.paid}</li>}
                    {item.type === "trial" && <li className="badge bg-primary">{strings.trial}</li>}
                  </div>
                  <div>{item.company_name}</div>
                  <div>{item.vat_id}</div>
                  <div className="column-edit-domains">
                    <PermissionGate permission={"domain.edit"}>
                      <Button
                        className="btn-info" size="sm"
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
                  <div className="column-actions-domains">
                    <PermissionGate permission={"domain.actions"}>
                      <Menu
                        id={item.id}
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
              ))}
            </InfiniteScroll>
            <div className="spacer"></div>
        </div>
      </div>
    </>
  );
}

export default withRouter(ManageDomain);
