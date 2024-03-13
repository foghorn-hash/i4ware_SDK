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

  return (
    <div className="image-video-gallary">
      {data.map((item) => (
        <div key={item.id} className="image-video-item" onClick={() => openModal(item)}>
          {item.asset_path.endsWith('.jpg') ? (
            <img src={`${process.env.REACT_APP_SERVER_URL}storage/${item.asset_path}`} alt={item.filename} />
          ) : (
            <video >
              <source src={`${process.env.REACT_APP_SERVER_URL}storage/${item.asset_path}`} type="video/mp4" />
            </video>           
          )}
        </div>
      ))}
      {selectedItem && (
        <div className="modal">
          <div className="modal-content">
            {selectedItem.asset_path.endsWith('.jpg') ? (
              <img src={`${process.env.REACT_APP_SERVER_URL}storage/${selectedItem.asset_path}`} alt={selectedItem.filename} />
            ) : (
              <video controls>
                <source src={`${process.env.REACT_APP_SERVER_URL}storage/${selectedItem.asset_path}`} type="video/mp4" />
              </video>
            )}
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVideoGallary;
