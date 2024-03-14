import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import request from "../../utils/Request";
import './CaptureVideoPhoto.css';

const CaptureVideoPhoto = ({ model, captureType, onUpload }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(model);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const capturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setCapturedPhoto(photo);
  };

  const startVideoCapture = () => {
    setIsCapturingVideo(true);
    setRecordedChunks([]);
    startRecording();
  };

  const stopVideoCapture = () => {
    setIsCapturingVideo(false);
    stopRecording();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const startRecording = () => {
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownload = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'captured-video.webm';
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);

      // Upload the video after downloading
      uploadVideo();
    }
  };

  const uploadPhoto = () => {
    if (capturedPhoto) {
      // Append the file extension to the filename
      const filename = `captured-photo.${getPhotoExtension()}`;

      const formData = new FormData();
      formData.append('file', dataURItoBlob(capturedPhoto), filename);

      request().post('/api/gallery/upload-media', formData)
        .then(response => {
          console.log("Photo uploaded successfully");
          onUpload();
        })
        .catch(error => {
          console.error("Error uploading photo:", error);
        });
    }
  };

  const uploadVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const formData = new FormData();
      formData.append('file', blob, 'captured-video.webm');

      request().post('/api/gallery/upload-media', formData)
        .then(response => {
          console.log("Video uploaded successfully");
        })
        .catch(error => {
          console.error("Error uploading video:", error);
        });
    }
  };

  const getPhotoExtension = () => {
    // Get the image format from the data URI
    const format = capturedPhoto.split(';')[0].split('/')[1];
    return format === 'jpeg' ? 'jpg' : format;
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  return (
    <div>
      {isModalOpen && (
        <div className="webcam-overlay">
          <div className="Webcam-container">
            <div className='Webcam-close-container'>
              <button className="close-overlay-button" onClick={closeModal}>
                X
              </button>
            </div>
            {!capturedPhoto && 
              <Webcam
                ref={webcamRef}
                videoConstraints={{
                  facingMode: 'user',
                }}
                screenshotFormat="image/jpeg"
              />
            }
            
            {capturedPhoto && 
              <>
                <img src={capturedPhoto} alt="Captured Photo" />
                <button className="Webcam-button upload" onClick={uploadPhoto}>Upload Photo</button>
              </>
            }

            {captureType === 'photo' && !capturedPhoto && (
              <button className="Webcam-button capture" onClick={capturePhoto}>Capture Photo</button>
            )}

            {captureType === 'video' && (
              <>
                {!isCapturingVideo ? (
                  <button className="Webcam-button startVideo" onClick={startVideoCapture}>Start Video</button>
                ) : (
                  <button className="Webcam-button stopVideo" onClick={stopVideoCapture}>Stop Video</button>
                )}
                {recordedChunks.length > 0 && (
                  <button className="Webcam-button upload download" onClick={uploadVideo}>Upload Video</button>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureVideoPhoto;