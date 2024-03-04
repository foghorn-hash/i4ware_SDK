import React, {useState} from "react";
import {useEffect} from "react";
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
  const [data, setData] = useState(null);
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
            setData(res.data.data);
          })
      })
  };

  const nextPage = url => {
    request()
      .get(url)
      .then(res => {
        setData(res.data.data);
      })
  };

  const removeItem = item => {
    request()
      .delete("api/manage/domains/" + item.id)
      .then(res => {
        request()
          .get("/api/manage/domains")
          .then(res => {
            setData(res.data.data);
          })
          .catch(() => {
            authActions.authStateChanged({
              user: null,
              token: null,
              isLogged: false,
            });
          });
      })
      .catch(() => {
        // authActions.authStateChanged({
        //   user: null,
        //   token: null,
        //   isLogged: false,
        // });
        alert("You cant remove domain");
      });
  };

  if (domains.length === 0 && !isLoading) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
      <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={!isLoading && hasMore}
      loader={<div className="loader">Loading...</div>}
      >
        <div className="my-5">
        </div>
        <table className="table mt-3">
          <thead>
            <tr>
              <th scope="col" style={{width: "15px"}}>#</th>
              <th scope="col">{strings.domain}</th>
              <th scope="col">{strings.validBeforeAt}</th>
              <th scope="col">{strings.type}</th>
              <th scope="col">{strings.company}</th>
              <th scope="col">{strings.vatId}</th>
              <th scope="col">{strings.phone}</th>
              <th scope="col">{strings.email}</th>
              <th scope="col">{strings.country}</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
          {domains.map((item, index) => (
              <tr key={item.id || index}>
                <td className="w-5">{index + 1}</td>
                <td>{item.domain}</td>
                <td>{item.valid_before_at}</td>
                <td>
                  {item.type === "paid" && <li className="badge bg-success">{strings.paid}</li>}
                  {item.type === "trial" && <li className="badge bg-primary">{strings.trial}</li>}
                </td>
                <td>{item.company_name}</td>
                <td>{item.vat_id}</td>
                <td>{item.mobile_no}</td>
                <td>{item.technical_contact_email}</td>
                <td>{item.country}</td>
                <td>
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
                </td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </>
  );
}

export default withRouter(ManageDomain);
