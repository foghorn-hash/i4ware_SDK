import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import { Modal, Card, Button, Container, Row, Col } from 'react-bootstrap';
import { ModalWindow3DViewer } from './ModalWindow3DViewer.js'
import './STLViewerComponent.css';
import FileUploadForm from '../../components/FileUploadForm/FileUploadForm';
import {API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME, ACCESS_USER_DATA} from "../../constants/apiConstants";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from 'react-infinite-scroller';
import LocalizedStrings from 'react-localization';
import ModalDelete from './ModalDelete';

let strings = new LocalizedStrings({
  en: {
    viewSTL: "View STL",
    modelViewerTitle: "3D Model Viewer",
    close: "Close",
    loading: "Loading...",
    delete: "Delete",
  },
  fi: {
    viewSTL: "Näytä STL",
    modelViewerTitle: "3D-mallin katseluohjelma",
    close: "Sulje",
    loading: "Ladataan...",
    delete: "Poista",
  },
  se: {
    viewSTL: "Visa STL",
    modelViewerTitle: "3D-modellvisare",
    close: "Stäng",
    loading: "Laddar...",
    delete: "Radera",
  }
});

function STLViewerComponent() {

  const [selectedModel, setSelectedModel] = useState(null); // Initialize with null
  const [showModal, setShowModal] = useState(false);
  const [stlItems, setStlItems] = useState([]); // State to hold fetched STL files
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  //This is fired when the user uploads a new item (.stl file)
  const newItemIsUploaded = async (fileName) => {
    //only if we have reached the end of the page (hasMore is set to false) we proceed 
    if (!hasMore) {
      try {
        setIsLoading(true); // Set isLoading to true when starting the request
        const response = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        });
       // Check if the response contains an item
       if (response.data) {
        const newItem = response.data;
        
        // Use the spread operator to add the new item to the stlFiles state
        setStlItems((prevStlFiles) => [...prevStlFiles, newItem]);
        }
      }//try
      catch (error) {
        console.error('Error fetching STL files:', error);
        } 
      finally {
        setIsLoading(false); // Set isLoading to false when the request is complete
        }
      }
    };

  const fetchStlFiles = async () => {
    //console.log("fetchFiles % page: " + page)
    try {
      setIsLoading(true); // Set isLoading to true when starting the request
      const response = await axios.get(`${API_BASE_URL}/api/stl/stl-items?page=${page}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      });
      const newStlFiles = response.data;

      // Append the new STL files to the existing list
      setStlItems((prevStlFiles) => [...prevStlFiles, ...newStlFiles]);

      // Check if there are more pages to load
      if (newStlFiles.length < 9) {
        setHasMore(false);
        }
      else {
        // Increment the page number
        setPage(prevPage => prevPage + 1);
        }

    } catch (error) {
      console.error('Error fetching STL files:', error);
    } finally {
      setIsLoading(false); // Set isLoading to false when the request is complete
    }
  };

  const loadMore = () => {
    //console.log("loadMore, page before update: " + page)
    // Check if there are more items to load and no ongoing request
    if (hasMore && !isLoading) {
      fetchStlFiles()
      }
  };

  const openModal = (modelUrl) => {
    setSelectedModel(modelUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedModel(null);
    setShowModal(false);
  };

  const openDeleteModal = (fileName) => {
    setFileToDelete(fileName);
    setShowDeleteModal(true);
  };

  const closeModalDelete = () => {
    setFileToDelete(null);
    setShowDeleteModal(false);
  };

const removeItem = async (fileName) => {
  try {
    setIsLoading(true);
    const deleteUrl = `${API_BASE_URL}/api/stl/delete-stl?fileName=${fileName}`;
    console.log(`Attempting to delete item: ${fileName} at URL: ${deleteUrl}`);

    const response = await axios.delete(deleteUrl, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME), 
      },
    });

    console.log('Response from delete request:', response);

    if (response.status === 200) {
      setStlItems((prevStlFiles) => prevStlFiles.filter((file) => file.stl_filename !== fileName));
      console.log(`Item ${fileName} deleted successfully`);
    } else {
      console.error('Failed to delete the item. Status:', response.status);
    }
  } catch (error) {
    console.error('Error deleting STL file:', error);
  } finally {
    setIsLoading(false);
    closeModalDelete();
  }
};
  
  stlItems.forEach((file, index) => {
    //console.log(file.stl_filename);
  });

  return (
    <>
      <div className="STL-controls">
        <FileUploadForm newItemIsUploaded={newItemIsUploaded} />
        <div className='STLViewerComponent-clear'></div>
      </div>
      <Container>
        <InfiniteScroll
          pageStart={1}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={<div className="loading">{strings.isLoading}</div>}
        >
          <Row className='STLViewerComponent-row'>
            {stlItems.map((file, index) => (
              <Col key={index} md={4} className='STLViewerComponent-col'>
                <Card>
                  <Card.Body>
                    <Card.Title className='STLViewerComponent-card-title'>{file.stl_filename}</Card.Title>
                    <div className='screenshot-container'>
                      {file.screenshot_file && (
                        <img
                          id='screenshot-image'
                          src={`data:image/png;base64,${file.screenshot_file}`}
                          alt={`Screenshot for ${file.stl_filename}`}
                        />
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <Button variant="primary" onClick={() => openModal(file.stl_filename)}>{strings.viewSTL}</Button>
                      <Button variant="danger" onClick={() => openDeleteModal(file.stl_filename)}>{strings.delete}</Button></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      </Container>
      {isLoading && <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>}
      <Modal show={showModal}
      onHide={closeModal} dialogClassName="STLViewerComponent-large-modal">
        <Modal.Header closeButton>
          <Modal.Title>{strings.modelViewerTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='STLViewerComponent-modal-body'>
          {/* Render the viewer within the Modal */}
          <div className='STlViewerComponent-modal-window'><ModalWindow3DViewer stlFilename={selectedModel}/></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {strings.close}
          </Button>
        </Modal.Footer>
      </Modal>
      <ModalDelete 
        show={showDeleteModal} 
        handleClose={closeModalDelete} 
        handleDelete={removeItem} 
        fileName={fileToDelete} />
    </>
  );
}

export default withRouter(STLViewerComponent);