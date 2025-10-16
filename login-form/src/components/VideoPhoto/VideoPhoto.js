import React, { useState, useContext, useEffect, useRef } from "react";
import { useInsertionEffect } from 'react';
import Swal from 'sweetalert2';
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import request from "../../utils/Request";
import { Button } from "react-bootstrap";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";

// const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
// const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
// const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
// const trackUploadProgress = (progressEvent) => {
//   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//   console.log(`Upload progress: ${percentCompleted}%`);
// };
import { AuthContext } from "../../contexts/auth.contexts";
import LOADING from "../../tube-spinner.svg";
import ImageVideoGallary from "../imageVideoGallary/imageVideoGallary";
import CaptureVideoPhoto from '../CaptureVideoPhoto/CaptureVideoPhoto';
// ES6 module syntax
import LocalizedStrings from 'react-localization';

// import { AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
// import InfiniteScroll from 'react-infinite-scroller';
// import Axios from 'axios';
// import ModalPhotoVideoDelete from "./ModalPhotoVideoDelete";

let strings = new LocalizedStrings({
    en: {
        videoPhoto: "Video/Photo",
        uploadPhoto: "Upload Photo",
        capturePhoto: "Capture Photo",
        uploadVideo: "Upload Video",
        captureVideo: "Capture Video",
        uploadSuccess: "Upload Successful",
        imageUploadSuccess: "Image uploaded successfully!",
        videoUploadSuccess: "Video uploaded successfully!",
        uploadError: "Upload Error",
        imageTypeNotSupported: "Image type is not supported. Please upload a JPEG (jpg) or PNG (png) image.",
        videoSizeTooLarge: "Video size is too large. Please upload a video file less than 100 MB."
    },
    fi: {
        videoPhoto: "Video/Kuva",
        uploadPhoto: "Lataa kuva",
        capturePhoto: "Ota kuva",
        uploadVideo: "Lataa video",
        captureVideo: "Ota video",
        uploadSuccess: "Lataus onnistui",
        imageUploadSuccess: "Kuva ladattu onnistuneesti!",
        videoUploadSuccess: "Video ladattu onnistuneesti!",
        uploadError: "Latausvirhe",
        imageTypeNotSupported: "Kuvatyyppiä ei tueta. Lataa JPEG (jpg) tai PNG (png) kuva.",
        videoSizeTooLarge: "Videotiedosto on liian suuri. Lataa videotiedosto, joka on alle 100 Mt."
    },
    sv: {
        videoPhoto: "Video/Foto",
        uploadPhoto: "Ladda upp foto",
        capturePhoto: "Ta foto",
        uploadVideo: "Ladda upp video",
        captureVideo: "Spela in video",
        uploadSuccess: "Uppladdning lyckades",
        imageUploadSuccess: "Bild uppladdad framgångsrikt!",
        videoUploadSuccess: "Video uppladdad framgångsrikt!",
        uploadError: "Uppladdningsfel",
        imageTypeNotSupported: "Bildtyp stöds inte. Ladda upp en JPEG (jpg) eller PNG (png) bild.",
        videoSizeTooLarge: "Videostorleken är för stor. Ladda upp en videofil mindre än 100 MB."
    }
});

function VideoPhoto(props) {
    const [page, setPage] = useState(1);
    const [assets, setAssets] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    // const { authState, authActions } = useContext(AuthContext);
    // const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);
      const videoFileInputRef = useRef(null); 

    const [showCapturePhoto, setShowCapturePhoto] = useState(false);

    const [showCaptureVideo, setShowCaptureVideo] = useState(false);
    //   const handleCapturePhoto = () => {
    //     setShowCapturePhoto(!showCapturePhoto);
    //   };
    const handleCapturePhoto = () => {
        // setSelectedFile(null);
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

    const refreshGallery = () => {
        setIsLoading(true);
        setPage(1);
        setHasMore(true);
        request().get(`/api/gallery/assets?page=1`)
            .then(res => {
                const newAssets = res.data;
                if (newAssets && newAssets.length > 0) {
                    setAssets(newAssets); // Replace entire assets array
                    setPage(2); // Next page will be 2
                } else {
                    setAssets([]);
                    setHasMore(false);
                }
            })
            .catch(error => {
                console.error("Error refreshing gallery:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

  
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        }
        if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
            console.error("Image type is not supported");
            Swal.fire({
                title: strings.uploadError,
                text: strings.imageTypeNotSupported,
                icon: 'error'
            });
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            await request().post('/api/gallery/upload-media', formData);
            console.log("Image uploaded successfully");

            // Show success message
            Swal.fire({
                title: strings.uploadSuccess,
                text: strings.imageUploadSuccess,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

            // Refresh the assets list
            refreshGallery();
        } catch (error) {
            console.error("Error uploading image:", error);
            Swal.fire({
                title: strings.uploadError,
                text: error.response?.data?.message || 'Failed to upload image',
                icon: 'error'
            });
        }
    };
    

    const handleVideoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            console.error("Video size is too large");
            Swal.fire({
                title: strings.uploadError,
                text: strings.videoSizeTooLarge,
                icon: 'error'
            });
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            await request().post('/api/gallery/upload-media', formData);
            console.log("Video uploaded successfully");

            // Show success message
            Swal.fire({
                title: strings.uploadSuccess,
                text: strings.videoUploadSuccess,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });

            // Refresh the assets list
            refreshGallery();
        } catch (error) {
            console.error("Error uploading video:", error);
            Swal.fire({
                title: strings.uploadError,
                text: error.response?.data?.message || 'Failed to upload video',
                icon: 'error'
            });
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleButtonClickvideo = () => {
        videoFileInputRef.current.click();
    };

    // const handleBatchUpload = async (files) => {
    //   const formData = new FormData();
    //   Array.from(files).forEach((file, index) => {
    //     formData.append(`files[${index}]`, file);
    //   });
    //   try {
    //     const response = await request().post('/api/gallery/batch-upload', formData);
    //     refreshGallery();
    //     return response.data;
    //   } catch (error) {
    //     console.error('Batch upload failed:', error);
    //     throw error;
    //   }
    // };

    // const optimizeImage = (file, maxWidth = 1920, quality = 0.8) => {
    //   return new Promise((resolve) => {
    //     const canvas = document.createElement('canvas');
    //     const ctx = canvas.getContext('2d');
    //     const img = new Image();
    //
    //     img.onload = () => {
    //       const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
    //       canvas.width = img.width * ratio;
    //       canvas.height = img.height * ratio;
    //
    //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    //       canvas.toBlob(resolve, 'image/jpeg', quality);
    //     };
    //
    //     img.src = URL.createObjectURL(file);
    //   });
    // };

    // const handleDragOver = (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    // };
    //
    // const handleDrop = async (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   const files = Array.from(e.dataTransfer.files);
    // };

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
            {showCapturePhoto && <CaptureVideoPhoto model={true} captureType="photo" onUpload={refreshGallery} />}
            {showCaptureVideo && <CaptureVideoPhoto model={true} captureType="video" onUpload={refreshGallery} />}
        </div>
    );
}


export default withRouter(VideoPhoto);