import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import { Modal, Card, Button, Container, Row, Col } from 'react-bootstrap';
import { ModalWindow3DViewer } from './ModalWindow3DViewer.js'
import './STLViewerComponent.css';
import FileUploadForm from '../../components/FileUploadForm/FileUploadForm';
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME, ACCESS_USER_DATA } from "../../constants/apiConstants";
import LOADING from "../../tube-spinner.svg";
import InfiniteScroll from 'react-infinite-scroller';
import ModalDelete from './ModalDelete';
import { useTranslation } from 'react-i18next';


function STLViewerComponent() {

  const [selectedModel, setSelectedModel] = useState(null); // Initialize with null
  const [showModal, setShowModal] = useState(false);
  const [stlItems, setStlItems] = useState([]); // State to hold fetched STL files
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

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

  const handleGenerateSpaceship = async () => {
    try {
      setIsGenerating(true);

      const response = await axios.post(
        API_BASE_URL + '/api/stl/generate-spaceship',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
            'Content-Type': 'application/json',
          },
        }
      );

      // Adjust depending on array or object
      const newItem = Array.isArray(response.data) ? response.data[0] : response.data;
      const fileName = newItem?.stl_filename;

      if (!fileName) {
        throw new Error("Invalid filename in response.");
      }

      if (!hasMore) {
        try {
          setIsLoading(true);
          const fetchResponse = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
            },
          });

          if (fetchResponse.data) {
            setStlItems((prev) => [...prev, fetchResponse.data]);
          }
        } catch (error) {
          console.error('Error fetching STL file:', error);
        } finally {
          setIsLoading(false);
        }
      }

    } catch (error) {
      console.error("AI STL generation failed:", error.response?.data || error.message);
      alert(error.response?.data?.details || "Failed to generate AI model.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCyborg = async () => {
    try {
      setIsGenerating(true);

      const response = await axios.post(
        API_BASE_URL + '/api/stl/generate-cyborg',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
            'Content-Type': 'application/json',
          },
        }
      );

      // Adjust depending on array or object
      const newItem = Array.isArray(response.data) ? response.data[0] : response.data;
      const fileName = newItem?.stl_filename;

      if (!fileName) {
        throw new Error("Invalid filename in response.");
      }

      if (!hasMore) {
        try {
          setIsLoading(true);
          const fetchResponse = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
            },
          });

          if (fetchResponse.data) {
            setStlItems((prev) => [...prev, fetchResponse.data]);
          }
        } catch (error) {
          console.error('Error fetching STL file:', error);
        } finally {
          setIsLoading(false);
        }
      }

    } catch (error) {
      console.error("AI STL generation failed:", error.response?.data || error.message);
      alert(error.response?.data?.details || "Failed to generate AI model.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCar = async () => {
    try {
      setIsGenerating(true);

      const response = await axios.post(
        API_BASE_URL + '/api/stl/generate-car',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
            'Content-Type': 'application/json',
          },
        }
      );

      // Adjust depending on array or object
      const newItem = Array.isArray(response.data) ? response.data[0] : response.data;
      const fileName = newItem?.stl_filename;

      if (!fileName) {
        throw new Error("Invalid filename in response.");
      }

      if (!hasMore) {
        try {
          setIsLoading(true);
          const fetchResponse = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
            },
          });

          if (fetchResponse.data) {
            setStlItems((prev) => [...prev, fetchResponse.data]);
          }
        } catch (error) {
          console.error('Error fetching STL file:', error);
        } finally {
          setIsLoading(false);
        }
      }

    } catch (error) {
      console.error("AI STL generation failed:", error.response?.data || error.message);
      alert(error.response?.data?.details || "Failed to generate AI model.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="STL-controls">
        <FileUploadForm newItemIsUploaded={newItemIsUploaded} />
        <Button
          className='STL-generate-button'
          variant="success"
          onClick={handleGenerateSpaceship}
          disabled={isGenerating}
          style={{ marginLeft: '10px' }}
        >
          {isGenerating ? t('generating') : t('generateSpaceship')}
        </Button>
        <Button
          className='STL-generate-button'
          variant="success"
          onClick={handleGenerateCar}
          disabled={isGenerating}
          style={{ marginLeft: '10px' }}
        >
          {isGenerating ? t('generating') : t('generateCar')}
        </Button>
        <Button
          className='STL-generate-button'
          variant="success"
          onClick={handleGenerateCyborg}
          disabled={isGenerating}
          style={{ marginLeft: '10px' }}
        >
          {isGenerating ? t('generating') : t('generateCyborg')}
        </Button>
        <div className='STLViewerComponent-clear'></div>
      </div>
      <Container>
        <InfiniteScroll
          pageStart={1}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={<div className="loading">{t('isLoading')}</div>}
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
                          width={444}
                          height={121}
                        />
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                        <Button variant="primary" onClick={() => openModal(file.stl_filename)}>{t('viewSTL')}</Button>
                        <Button variant="danger" onClick={() => openDeleteModal(file.stl_filename)}>{t('delete')}</Button></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      </Container>
      {isLoading && <div className="loading-screen"><img src={LOADING} alt={t('isLoading')} /></div>}
      <Modal show={showModal}
        onHide={closeModal} dialogClassName="STLViewerComponent-large-modal">
        <Modal.Header closeButton>
          <Modal.Title>{t('modelViewerTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='STLViewerComponent-modal-body'>
          {/* Render the viewer within the Modal */}
          <div className='STlViewerComponent-modal-window'><ModalWindow3DViewer stlFilename={selectedModel} /></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
      <ModalDelete
        show={showDeleteModal}
        handleClose={closeModalDelete}
        handleDelete={removeItem}
        fileName={fileToDelete} />
      {isGenerating && (
        <div className="loading-screen">
          <img src={LOADING} alt={t('isLoading')} />
          <p>{t('isGenerating')}</p>
        </div>
      )}
    </>
  );
}

export default withRouter(STLViewerComponent);