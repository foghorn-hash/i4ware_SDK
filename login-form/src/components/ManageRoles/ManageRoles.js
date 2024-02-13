import React, {useState} from "react";
import {useEffect} from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import LOADING from "../../1487-loading.gif";
import InfiniteScroll from 'react-infinite-scroller';
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
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const response = await request().get(`/api/manage/roles?page=${page}`);
        setData(prevData => prevData ? [...prevData, ...response.data.data] : response.data.data);
        setHasMore(response.data.next_page_url != null);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };
  
    fetchRoles();
  }, [page]);
  
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };  

  const nextPage = url => {
    request()
      .get(url)
      .then(res => {
        setData(res.data.data);
      })
  };

  const editRole = (item) => {
    props.history.push({
      pathname: "/manage-roles/edit",
      state: {
        item: item,
        from: "edit",
      },
    });
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
  
      <table className="table mt-3">
        <thead>
          <tr>
            <th scope="col" style={{ width: "15px" }}>#</th>
            <th scope="col">{strings.name}</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={<div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>}
          element="tbody"
        >
          {data && data.data.length === 0 && <tr><td colSpan="3">{strings.noData}</td></tr>}
          {data && data.data.map((item, index) => (
            <tr key={item.id || index}>
              <td className="w-5">{index + 1}</td>
              <td>{item.name}</td>
              <td>
                <Button className="btn-info" size="sm" onClick={() => editRole(item)}>
                  {strings.edit}
                </Button>
                <Button className="mx-2 btn-danger" size="sm" onClick={() => removeItem(item)}>
                  {strings.remove}
                </Button>
              </td>
            </tr>
          ))}
        </InfiniteScroll>
      </table>
    </>
  );
}

export default withRouter(ManageRoles);