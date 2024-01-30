import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from '../../constants/apiConstants';
import './WebcamCapture.css';
import ImageCropper from "./../ImageCropper/ImageCropper";
import request from "../../utils/Request";
import Axios from 'axios';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    capturePhoto: "Capture Photo",
    upload: "Upload",
    removeImage: "Remove Image",
    closeOverlay: "Close",
  },
  fi: {
    capturePhoto: "Ota valokuva",
    upload: "Lataa",
    removeImage: "Poista kuva",
    closeOverlay: "Sulje",
  }
});

const WebcamCapture = ({ onClose, loadUserData}) => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState(null);
    const [croppedImageFile, setCroppedImageFile] = useState('a');
    const profileRef = useRef();
    const [showCropper, setShowCropper] = useState(false);
    const [showMessage, setShowMessage] = useState(null);

    var query = window.location.search.substring(1);
    var urlParams = new URLSearchParams(query);
    var localization = urlParams.get('lang');

    if (localization == null) {
      strings.setLanguage(API_DEFAULT_LANGUAGE);
    } else {
      strings.setLanguage(localization);
    }

    const upload = async () => {
        if (!croppedImageFile) return;
    
        try {
          // Send the captured image to the server
          const formData = new FormData();
          formData.append('file', croppedImageFile);

          const response = await Axios.post(API_BASE_URL + '/api/manage/capture-upload', formData, {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
              'Content-Type': 'multipart/form-data',
            },
          });
          loadUserData();
          onClose();
        } catch (error) {
          console.error('Error uploading image', error);
        }
      };

    const onCropChange = useCallback((cropTemp) => {
        setCrop(cropTemp);
      }, []);
    
      const onFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(event.target.files[0]);
          fileReader.onload = () => {
            setImageSrc(fileReader.result);
            setShowCropper(true);
          };
        }
      };
    
      const onCropComplete = useCallback((croppedArea) => {
        if(croppedArea){
          console.log(croppedArea);
          setCroppedArea(croppedArea);
        }
      }, []);
    
      const onZoomChange = useCallback((zoom) => {
        setZoom(zoom);
      }, []);

    const capture = () => {
      const imageSrc = webcamRef.current.getScreenshot();
      // Update the state with the captured image source
      setImageSrc(imageSrc);
      setShowCropper(true);
    };

  return (
    <div className="webcam-overlay">
      <div className="Webcam-container">
        <div className='Webcam-close-container'>
          <button className="close-overlay-button" onClick={onClose}>
              X
          </button>
        </div>
        <Webcam
          className="Webcam"
          forceScreenshotSourceSize
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1920, height:1080 }}
        />
        <br />
        <button className="Webcam-capture-button" onClick={capture}>
          {strings.capturePhoto}
        </button>
        {imageSrc && (
            <ImageCropper
              imageSrc={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              showCropper={showCropper}
              setShowCropper={setShowCropper}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              setCroppedImageFile={setCroppedImageFile}
              cropShape="round"
            />
        )}
        {imageSrc && <button className="Webcam-upload-button" onClick={upload}>
            {strings.upload}
        </button>}
        {imageSrc && <button className="Webcam-remove-button " onClick={()=>{
          setImageSrc(null)
        }}> {strings.removeImage} </button>}
      </div>
    </div>
  );
};

export default WebcamCapture;
