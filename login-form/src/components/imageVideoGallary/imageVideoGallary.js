import React, { useEffect, useState } from 'react';
import { useInsertionEffect } from 'react';
import './imageVideoGallary.css';
import ModalPhotoVideoDelete from '../VideoPhoto/ModalPhotoVideoDelete';
import {API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME, ACCESS_USER_DATA} from "../../constants/apiConstants";
import axios from 'axios';
import { Button } from 'react-bootstrap';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    delete: "Delete",
  },
  fi: {
    delete: "Poista",
  },
  se: {
    delete: "Radera",
  }
});

const ImageVideoGallary = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(data); // Initialize items state with data prop
  }, [data]);

  useEffect(() => {
  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const openDeleteModal = (fileName) => {
    console.log(`Preparing to delete item: ${fileName}`);
    setFileToDelete(fileName);
    setShowDeleteModal(true);
  };

  const closeModalDelete = () => {
    setFileToDelete(null);
    setShowDeleteModal(false);
  };

  const handleVideoError = (e) => {
    if (e.target && e.target.error) {
      console.error('Video loading error:', e.target.error.message);
      // Additional error handling logic can be added here
    } else {
      console.error('Video loading error:', e);
    }
  };

  const removeItem = async (fileName) => {
    try {
      setIsLoading(true);
      const deleteUrl = `${API_BASE_URL}/api/gallery/photos_videos/delete?fileName=${fileName}`;
      console.log(`Attempting to delete item: ${fileName} at URL: ${deleteUrl}`);
  
      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME), 
        },
      });
  
      console.log('Response from delete request:', response);
  
      if (response.status === 200) {
        setItems((prevItems) => prevItems.filter((item) => item.filename !== fileName));
        console.log(`Item ${fileName} deleted successfully`);
      } else {
        console.error('Failed to delete the item. Status:', response.status);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsLoading(false);
      closeModalDelete();
    }
  };

  return (
    <div className="image-video-gallary">
      {items.map((item) => (
        <div className='image-video-item-container'>
        <div key={item.id} className="image-video-item" 
        onClick={() => openModal(item)} >
        { /\.(mp4|webm|ogg)$/i.test(item.asset_path) ? (
            <video
              controls=""
              onError={handleVideoError}
            >
              <source
                src={`${process.env.REACT_APP_SERVER_URL}/storage/${item.asset_path}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : /\.(jpg|jpeg|png|gif)$/i.test(item.asset_path) ? (
            <img
              src={`${process.env.REACT_APP_SERVER_URL}/storage/${item.asset_path}`}
              alt={item.filename}
              onError={(e) => console.error('Image loading error:', e)}
            />
          ) : (
            <div className="unsupported-file">Unsupported file type</div>
          )}
        </div> <Button variant="danger" style={{
          marginBottom: '20px', marginTop: '10px'
        }}
        onClick={() => {
          const fullUrl = `${process.env.REACT_APP_SERVER_URL}/storage/${item.asset_path}`;
          console.log(`Preparing to delete item: ${item.filename} with full URL: ${fullUrl}`);
            openDeleteModal(item.filename)
        }}>
          {strings.delete}
          </Button>
          </div>
      ))}  
      <ModalPhotoVideoDelete 
        show={showDeleteModal} 
        handleClose={closeModalDelete} 
        handleDelete={removeItem} 
        fileName={fileToDelete} />
      {selectedItem && (
        <div className="modal mediapopup">
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
                    src={`${process.env.REACT_APP_SERVER_URL}/storage/${selectedItem.asset_path}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              ) : /\.(jpg|jpeg|png|gif)$/i.test(selectedItem.asset_path) ? (
                <img
                  src={`${process.env.REACT_APP_SERVER_URL}/storage/${selectedItem.asset_path}`}
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
