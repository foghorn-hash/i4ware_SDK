import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const CaptureVideoPhoto = ({ model, captureType }) => {
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
    }
  };

  return (
    <div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            
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
            <><img src={capturedPhoto} alt="Captured Photo" />
            
            <button onClick={capturePhoto}>upload Photo</button>
            </>
            }
            {captureType === 'photo' && (
              <button onClick={capturePhoto}>Capture Photo</button>
            )}
            {captureType === 'video' && (
              <>
                {!isCapturingVideo ? (
                  <button onClick={startVideoCapture}>Start Video</button>
                ) : (
                  <button onClick={stopVideoCapture}>Stop Video</button>
                )}
                {recordedChunks.length > 0 && (
                  <button onClick={handleDownload}>Download Video</button>
                )}
              </>
            )}
            <button className="close-button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureVideoPhoto;
