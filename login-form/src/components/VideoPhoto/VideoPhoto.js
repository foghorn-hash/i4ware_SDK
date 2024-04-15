import React, { useState, useContext, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import request from "../../utils/Request";
import { Button } from "react-bootstrap";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from 'react-infinite-scroller';
import Axios from 'axios';
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

    const fileInputRef = useRef(null);
      const videoFileInputRef = useRef(null); 

    const [showCapturePhoto, setShowCapturePhoto] = useState(false);

    const [showCaptureVideo, setShowCaptureVideo] = useState(false);
    //   const handleCapturePhoto = () => {
    //     setShowCapturePhoto(!showCapturePhoto);
    //   };
    const handleCapturePhoto = () => {
        setSelectedFile(null); // Reset selected file
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
    useEffect(() => {
        // Function to handle scrolling event
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
                // If user scrolled to the bottom of the page, call loadMore function
                loadMore();
            }
        };

        // Add scroll event listener when component mounts
        window.addEventListener('scroll', handleScroll);

        // Remove scroll event listener when component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [assets, isLoading, hasMore, page]);
 
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

  
    const handleFileChange = async (event) => {
        // debugger
        const file = event.target.files[0];
        console.log(file)
    
        // Check if a file is selected
        if (!file) {
            console.error("No file selected");
            return;
        }
    
        // Check if the selected file type is not jpg or png
        if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
            console.error("Image type is not supported");
            alert("Image type is not supported. Please upload a JPEG (jpg) or PNG (png) image.");
            return;
        }
    
        setSelectedFile(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await request().post('/api/gallery/upload-media', formData);
            console.log("Image uploaded successfully");
            alert("Image uploaded successfully");
             window.location.reload(); 
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };


    const handleVideoChange = async (event) => {
        // debugger
        const file = event.target.files[0]; // Define 'file' variable here
    
        if (!file) {
            console.error("No file selected");
            return;
        }
        // Check if the file size exceeds 15 MB
        if (file.size > 100 * 1024 * 1024) {
            console.error("Video size is too large");
            alert("Video size is too large. Please upload a video file less than 15 MB.");
            return;
        }
    
        setSelectedFile(file); // Set selected file in the state
    
        const formData = new FormData();
        formData.append('file', file); // Append 'file' to formData
    
        try {
            await request().post('/api/gallery/upload-media', formData);
            console.log("Video uploaded successfully");
            alert("Video uploaded successfully");
            window.location.reload(); 
        } catch (error) {
            console.error("Error uploading video:", error);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleButtonClickvideo = () => {
        videoFileInputRef.current.click();
    };
    
    const handleUpload = async () => {
          const formData = new FormData();  
          formData.append('file', selectedFile);

          await request().post('/api/gallery/upload-media', formData)
              .then(response => {

                  console.log("Photo uploaded successfully");

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
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png" 
                />
                <Button
                    className="VideoPhoto-button"
                    variant="primary"
                    size="sm"
                    onClick={handleButtonClick}
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


                <input
                    type="file"
                    ref={videoFileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleVideoChange}
                    accept="video/*" // Only accept video files
                />
                <Button
                    className="VideoPhoto-button"
                    variant="primary"
                    size="sm"
                    onClick={handleButtonClickvideo}
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
            {showCapturePhoto && <CaptureVideoPhoto model={true} captureType="photo" onUpload={loadMore} />}
            {showCaptureVideo && <CaptureVideoPhoto model={true} captureType="video" onUpload={loadMore} />}
        </div>
    );
}


export default withRouter(VideoPhoto);