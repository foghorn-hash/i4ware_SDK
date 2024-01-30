import React, {useState} from "react";
import {useEffect} from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import LOADING from "../../1487-loading.gif";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    add: "Add",
    numberSign: "#",
    name: "Name",
    noData: "No data",
    edit: "Edit",
    remove: "Remove",
    previous: "Previous",
    next: "Next"
  },
  fi: {
    add: "Lisää",
    numberSign: "#",
    name: "Nimi",
    noData: "Ei tietoja",
    edit: "Muokkaa",
    remove: "Poista",
    previous: "Edellinen",
    next: "Seuraava"
  }
});

function ManageRoles(props) {
  const [data, setData] = useState(null);
  const {authState, authActions} = React.useContext(AuthContext);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(() => {
    request()
      .get("/api/manage/roles")
      .then(res => {
        setData(res.data.data);
      })
  }, []);


  const nextPage = url => {
    request()
      .get(url)
      .then(res => {
        setData(res.data.data);
      })
  };

  const removeItem = item => {
    request()
      .get("/api/manage/role/"+item.id)
      .then(res => {
        setData(res.data.data);
      })
  }

  if (!data) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
     <div className="my-5">
        <Button
          onClick={() => {
            props.history.push("/manage-roles/add", {
              state: {
                from: "add",
              },
            });
          }}
        >
          {strings.add}
        </Button>
      </div>

      
      <table class="table mt-3">
        <thead>
          <tr>
            <th scope="col" style={{width: "15px"}}>
              #
            </th>
            <th scope="col">{strings.name}</th>
            {/* <th scope="col">isActive</th> */}
			<th scope="col"></th>
          </tr>
        </thead>
        <tbody>
        {data &&
            data.data.length == 0 && <tr><td>1</td><td>{strings.noData}</td><td></td></tr>}
          {data &&
            data.data.map((item, index) => {
              return (
                <tr>
                  <td className="w-5">{index + 1}</td>
                  <td>{item.name}</td>
                  {/* <td>{item.isActive === 1?<span className="btn btn-primary" >AA</span>:''}</td> */}
                    <td>
                      <Button
                        className="btn-info" size="sm"
                        onClick={() => {
                          props.history.push({
                            pathname: "/manage-roles/edit",
                            state: {
                              item: item,
                              from: "edit",
                            },
                          });
                        }}
                      >
                        {strings.edit}
                      </Button>
                      <Button
                        className="mx-2 btn-danger"
                        onClick={() => {
                          removeItem(item);
                        }}
                        size="sm"
                      >
                        {strings.remove}
                      </Button>
                    </td>
                </tr>
              );
            })}
        </tbody>
      </table>
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
    </>
  );
}

export default withRouter(ManageRoles);
