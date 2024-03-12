import React, { useState, useContext, useEffect } from 'react';
import "./ManageRoles.css";
import { withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from 'react-bootstrap';
import request from '../../utils/Request';
import { AuthContext } from '../../contexts/auth.contexts';
import LOADING from '../../tube-spinner.svg';
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

  const removeItem = item => {
    request()
      .get("/api/manage/role/"+item.id)
      .then(res => {
        setRoles(res.data);
      })
  }

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
      <div className="mt-3">
          <div className="table-header-roles">
            <div className="column-number-roles">#</div>
            <div>{strings.name}</div>
            <div></div>
          </div>
          <div className='table-body-roles'>
          <InfiniteScroll
          pageStart={0}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={<div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>}
        >
          {roles.map((role, index) => (
            <div key={role.id} className="table-row-roles">
              <div className="column-number-roles">{index + 1}</div>
              <div>{role.name}</div>
              <div className='column-actions-roles'>
                <Button 
                  className="btn-info" 
                  size="sm" 
                  onClick={() => {
                    props.history.push({
                      pathname: "/manage-roles/edit",
                      state: {
                        item: role,
                        from: "edit",
                      },
                    });
                  }}>
                  {strings.edit}
                </Button>
                <Button 
                  className="mx-2 btn-danger" 
                  size="sm" 
                  onClick={() => {
                    removeItem(role);
                }}>
                  {strings.remove}
                </Button>
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

export default withRouter(ManageRoles);