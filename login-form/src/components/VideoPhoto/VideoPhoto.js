import React, {useState, useContext,useEffect} from "react";
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import request from "../../utils/Request";
import {Button} from "react-bootstrap";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from 'react-infinite-scroller';

import ImageVideoGallary from "../imageVideoGallary/imageVideoGallary";
import CaptureVideoPhoto from '../CaptureVideoPhoto/CaptureVideoPhoto';
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
  const [selectedFile, setSelectedFile] = useState(null);

  const [showCapturePhoto, setShowCapturePhoto] = useState(false);

  const [showCaptureVideo, setShowCaptureVideo] = useState(false);
  const handleCapturePhoto = () => {
    setShowCapturePhoto(!showCapturePhoto);
  };

  const handleCaptureVideo = () => {
    setShowCaptureVideo(!showCaptureVideo);
  };
  
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

  const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
      const formData = new FormData();
      formData.append('file', selectedFile);

      request().post('/api/gallery/upload-media', formData)
          .then(response => {
              // Handle success response
              console.log("Photo uploaded successfully");
              // You might want to update the assets state to reflect the newly uploaded photo
          })
          .catch(error => {
              // Handle error
              console.error("Error uploading photo:", error);
          });
  };

  if (isLoading) {
      return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }
  
  return (
      <div className="VideoPhoto-main">
          <h3>{strings.videoPhoto}</h3>
          <div className="VideoPhoto-button-bar">
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
              <Button
                  className="VideoPhoto-button"
                  variant="primary"
                  size="sm"
                  onClick={handleUpload}
                  disabled={!selectedFile}
              >
                  {strings.uploadPhoto}
              </Button>
              <Button
                  className="VideoPhoto-button"
                  variant="primary"
                  size="sm"
                  onClick={handleCapturePhoto}
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
                  onClick={handleCaptureVideo}
              >
                  {strings.captureVideo}
              </Button>
          </div>
          {/* show Gallary */}
          <ImageVideoGallary data={assets} />
          {/* show capture VideoPhoto model */}
          {showCapturePhoto &&  <CaptureVideoPhoto model= {true}  captureType="photo" />}
          {showCaptureVideo &&  <CaptureVideoPhoto model= {true}  captureType="video" />}
      </div>
  );
}


export default withRouter(VideoPhoto);