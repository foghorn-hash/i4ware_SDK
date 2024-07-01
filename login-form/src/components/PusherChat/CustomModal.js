import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { PlayFill, StopFill } from 'react-bootstrap-icons';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    height: '80vh',
    maxWidth: '800px',
    maxHeight: '450px',
    overflow: 'hidden',
    padding: '0',
    backgroundColor: '#000',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  }
};

Modal.setAppElement('#root');

const CustomModal = ({ isOpen, onRequestClose, content, isVideo }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Media Modal"
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <button
          onClick={onRequestClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          &times;
        </button>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {content && React.isValidElement(content) && React.cloneElement(content, {
            ref: videoRef,
            onTimeUpdate: isVideo ? handleTimeUpdate : null,
            onLoadedMetadata: isVideo ? handleLoadedMetadata : null,
            controls: false,
            style: { width: '100%', height: '100%', objectFit: 'contain' }
          })}
          {isVideo && (
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 2
              }}
              onClick={handlePlayPause}
            >
              {isPlaying ? <StopFill size={48} /> : <PlayFill size={48} />}
            </div>
          )}
        </div>
        {isVideo && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              height: '10px',
              backgroundColor: '#333',
              cursor: 'default' // Make the progress bar non-clickable
            }}
          >
            <div
              style={{
                width: `${(currentTime / duration) * 100}%`,
                height: '100%',
                backgroundColor: '#f00'
              }}
            ></div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomModal;
