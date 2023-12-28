import React, {useState} from "react";
import {useEffect} from "react";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../1487-loading.gif";

function Menu({id, domainActionApi}) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => {
            domainActionApi(id, "extend-trial");
          }}
        >
          Extend Trial 30 days{" "}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "make-paid");
        }}>
          Make a Paid Subscription
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "down-to-trial");
        }}>Downgrade to Trial</Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "extend-one-year");
        }} >
          Extend Trial by One year
        </Dropdown.Item>
        <Dropdown.Item onClick={() => {
          domainActionApi(id, "terminate");
        }} style={{background: "#ffbfbf"}} >
          Terminate domain
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function ManageDomain(props) {
  const [data, setData] = useState(null);
  

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
            <th scope="col">Domain</th>
            <th scope="col">Valid Before At</th>
            <th scope="col">Type</th>
			<th scope="col">Company</th>
			<th scope="col">VAT-ID</th>
            <th scope="col">Phone</th>
            <th scope="col">Email</th>
            <th scope="col">Country</th>
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
                  <td>{item.type == "paid" && <li className="badge bg-success" >Paid</li>}
                  {item.type == "trial" && <li className="badge bg-primary" >Trial</li>}
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
                        Edit
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
