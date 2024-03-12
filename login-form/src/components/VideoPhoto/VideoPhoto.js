import React, {useState, useContext,useEffect} from "react";
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from 'react-infinite-scroller';
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
        videoPhoto: "Video/Photo",
        uploadPhoto: "Upload Photo",
        capturePhoto: "Capture Photo",
        uploadVideo: "Upload Video",
        captureVideo: "Capture Video",
    },
    fi: {
        videoPhoto: "Video/Kuva",
        uploadPhoto: "Lataa kuva",
        captureVideo: "Ota video",
        uploadVideo: "Lataa video",
        captureVideo: "Ota video",
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

    if (isLoading) {
        return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
    }
    
    return (
        <div className="VideoPhoto-main">
            <h3>{strings.videoPhoto}</h3>
            <div className="VideoPhoto-button-bar">
            <Button
              className="VideoPhoto-button"
              variant="primary"
              size="sm"
            >
              {strings.uploadPhoto}
            </Button>
            <Button
              className="VideoPhoto-button"
              variant="primary"
              size="sm"
            >
              {strings.capturePhoto}
            </Button>
            <Button
              className="VideoPhoto-button"
              variant="primary"
              size="sm"
            >
              {strings.uploadVideo}
            </Button>
            <Button
              className="VideoPhoto-button"
              variant="primary"
              size="sm"
            >
              {strings.captureVideo}
            </Button>
          </div>
        </div>
    );
}

export default withRouter(VideoPhoto);