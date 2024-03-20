import React, { useState } from 'react';
import './imageVideoGallary.css';

const ImageVideoGallary = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleVideoError = (e) => {
    if (e.target && e.target.error) {
      console.error('Video loading error:', e.target.error.message);
      // Additional error handling logic can be added here
    } else {
      console.error('Video loading error:', e);
    }
  };

  return (
    <div className="image-video-gallary">
      {data.map((item) => (
        <div key={item.id} className="image-video-item" onClick={() => openModal(item)}>
          { /\.(mp4|webm|ogg)$/i.test(item.asset_path) ? (
            <video
              controls
              onError={handleVideoError}
            >
              <source
                src={`${process.env.REACT_APP_SERVER_STORAGE_URL}/${item.asset_path}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : /\.(jpg|jpeg|png|gif)$/i.test(item.asset_path) ? (
            <img
              src={`${process.env.REACT_APP_SERVER_STORAGE_URL}/${item.asset_path}`}
              alt={item.filename}
              onError={(e) => console.error('Image loading error:', e)}
            />
          ) : (
            <div className="unsupported-file">Unsupported file type</div>
          )}
        </div>
      ))}
      {selectedItem && (
        <div className="modal">
          <div className="modal-container">
            <div className="modal-content">
              <div className='close-button-container'>
                <button className="close-button" onClick={closeModal}>
                  X
                </button>
              </div>
              { /\.(mp4|webm|ogg)$/i.test(selectedItem.asset_path) ? (
                <video
                  controls
                  onError={handleVideoError}
                >
                  <source
                    src={`${process.env.REACT_APP_SERVER_STORAGE_URL}/${selectedItem.asset_path}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              ) : /\.(jpg|jpeg|png|gif)$/i.test(selectedItem.asset_path) ? (
                <img
                  src={`${process.env.REACT_APP_SERVER_STORAGE_URL}/${selectedItem.asset_path}`}
                  alt={selectedItem.filename}
                  onError={(e) => console.error('Image loading error:', e)}
                />
              ) : (
                <div className="unsupported-file">Unsupported file type</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVideoGallary;
