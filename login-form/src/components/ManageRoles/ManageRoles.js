import React, { useState, useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from 'react-bootstrap';
import request from '../../utils/Request';
import { AuthContext } from '../../contexts/auth.contexts';
import LOADING from '../../1487-loading.gif';
import LocalizedStrings from 'react-localization';
import { API_DEFAULT_LANGUAGE } from '../../constants/apiConstants';

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
  const [roles, setRoles] = useState([]);
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
    loadMore();
  }, []);

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    request().get(`/api/manage/roles?page=${page}`)
      .then(res => {
        const newRoles = res.data;
        if (newRoles.length > 0) {
          setRoles(prevRoles => [...prevRoles, ...newRoles]);
          setPage(prevPage => prevPage + 1);
        } else {
          setHasMore(false);
        }
      })
      .catch(error => {
        console.error("Error loading more roles:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (roles.length === 0 && !isLoading) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
      <div className="my-5">
        <Button onClick={() => props.history.push("/manage-roles/add")}>
          {strings.add}
        </Button>
      </div>

      <table className="table mt-3">
        <thead>
          <tr>
            <th scope="col">#</th>
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
          {roles.map((role, index) => (
            <tr key={role.id}>
              <td>{index + 1}</td>
              <td>{role.name}</td>
              <td>
                <Button className="btn-info" size="sm" onClick={() => props.history.push("/manage-roles/edit", { state: { role, from: "edit" } })}>
                  {strings.edit}
                </Button>
                <Button className="mx-2 btn-danger" size="sm" onClick={() => console.log('Remove role', role.id)}>
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