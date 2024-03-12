import React, {useState, useContext,useEffect} from "react";
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import request from "../../utils/Request";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import LOADING from "../../1487-loading.gif";
import InfiniteScroll from 'react-infinite-scroller';
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
        videoPhoto: "Video/Photo",
    },
    fi: {
        videoPhoto: "Video/Kuva",
    }
});

function VideoPhoto(props) {
    const [page, setPage] = useState(1);
    const [assets, setAssets] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { authState, authActions } = useContext(AuthContext);

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
        request().get(`/api/gallery/assets?page=${page}`)
          .then(res => {
            const newAssets = res.data;
            if (newAssets && newAssets.length > 0) {
              setAssets(prevAssets => [...new Set([...prevAssets, ...newAssets])]);
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

    if (assets.length === 0 && !isLoading) {
        return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
    }
    
    return (
        <div>
            <h3>{strings.videoPhoto}</h3>
        </div>
    );
}

export default withRouter(VideoPhoto);