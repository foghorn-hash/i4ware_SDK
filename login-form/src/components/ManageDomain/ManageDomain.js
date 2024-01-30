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
    request()
      .get("/api/manage/domains")
      .then(res => {
        setData(res.data.data);
      })

   
  }, []);

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

  if (!data) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
     <div className="my-5">
		{ /*authState.user.role == "admin" && (
          <Button
            onClick={() => {
              props.history.push("/manage-domains/add", {
                state: {
                  from: "add",
                },
              });
            }}
          >
            Add
          </Button>
        )*/	}	
      </div>
      <table class="table mt-3">
        <thead>
          <tr>
            <th scope="col" style={{width: "15px"}}>
              #
            </th>
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
          {data &&
            data.data.map((item, index) => {
              return (
                <tr>
                  <td className="w-5">{index + 1}</td>
                  <td>{item.domain}</td>
                  <td>{item.valid_before_at}</td>
                  <td>{item.type == "paid" && <li className="badge bg-success" >{strings.paid}</li>}
                  {item.type == "trial" && <li className="badge bg-primary" >{strings.trial}</li>}
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
                      {/* <Button
                        className="mx-2 btn-danger"
                        onClick={() => {
                          removeItem(item);
                        }}
                      >
                        Remove
                      </Button> */}
                    </td>
                  {(
                    <td>
                      <PermissionGate permission={"domain.actions"}>
                        <Menu id={item.id} domainActionApi={(id,action)=>{
                          domainUpdateApi({
                            id:id,
                            action:action
                          })
                        }} />
                      </PermissionGate>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
	  {authState.user.role === "admin" &&
      <nav>
        <ul class="pagination">
          {data &&
            data.links.map((link, index) => {
              return (
                <li
                  class={link.active ? "page-item active" : "page-item"}
                  onClick={() => {
                    nextPage(link.url);
                  }}
                >
                  <button class="page-link" href="#">
                    {link.label.includes("Previous")
                      ? "Previous"
                      : link.label.includes("Next")
                      ? "Next"
                      : link.label}
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>
	  }
    </>
  );
}

export default withRouter(ManageDomain);
