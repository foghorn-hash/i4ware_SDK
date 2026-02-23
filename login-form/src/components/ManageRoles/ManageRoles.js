import React, { useState, useContext, useEffect } from 'react';
import "./ManageRoles.css";
import { withRouter } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { Button } from 'react-bootstrap';
import request from '../../utils/Request';
import { AuthContext } from '../../contexts/auth.contexts';
import LOADING from '../../tube-spinner.svg';
import { useTranslation } from 'react-i18next';

function ManageRoles(props) {
  const { t, i18n } = useTranslation();
  const { authState, authActions } = React.useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

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
      .get("/api/manage/role/" + item.id)
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
          {t('add')}
        </Button>
      </div>
      <div className="mt-3">
        <div className="table-header-roles">
          <div className="column-actions-roles">#</div>
          <div className="column-actions-roles">{t('name')}</div>
          <div className="column-actions-roles">{t('domain')}</div>
          <div className="column-actions-roles"></div>
        </div>
        <div className='table-body-roles'>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={hasMore}
            loader={<div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>}
          >
            {roles.map((role, index) => (
              <div className="mobile-table-body-roles">
                <div className="mobile-table-header-roles">
                  <div className="column-actions-roles">#</div>
                  <div className="column-actions-roles">{t('name')}</div>
                  <div className='column-actions-roles'>{t('domain')}</div>
                  <div className="column-actions-roles"></div>
                </div>
                <div key={role.id} className="table-row-roles">
                  <div className="column-actions-roles">{index + 1}</div>
                  <div className="column-actions-roles">{role.name}</div>
                  <div className='column-actions-roles'>{role.domain}</div>
                  <div className="column-actions-roles">
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
                      {t('edit')}
                    </Button>
                    <Button
                      className="mx-2 btn-danger"
                      size="sm"
                      onClick={() => {
                        removeItem(role);
                      }}>
                      {t('remove')}
                    </Button>
                  </div>
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