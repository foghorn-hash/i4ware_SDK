import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import Axios from 'axios';
import './Chat.css';
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_DEFAULT_LANGUAGE, API_PUSHER_KEY, API_PUSHER_CLUSTER } from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    send: "Send",
    typing: "is typing...",
    box: "Write a message...",
    browse: "Browse",
    capturePhoto: "Take a Photo"
  },
  fi: {
    send: "Lähetä",
    typing: "kirjoittaa...",
    box: "Kirjoita viesti...",
    browse: "Selaa",
    capturePhoto: "Ota Kuva"
  },
  se: {
    send: "Skicka",
    typing: "skriver...",
    box: "Skriv meddelande...",
    browse: "Bläddra",
    capturePhoto: "Ta en bild"
  }
});

const App = () => {
  const [username, setUsername] = useState(localStorage.getItem(ACCESS_USER_DATA) || 'Guest');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typingIndicator, setTypingIndicator] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState(false); // State to track AI checkbox
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showCaptureModal, setCaptureShowModal] = useState(false);
  const [showCaptureVideoModal, setCaptureVideoShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [videoUploading, setvideoUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCaptureShowModal = () => setCaptureShowModal(true);
  const handleCaptureCloseModal = () => setCaptureShowModal(false);

  const handleCaptureVideoShowModal = () => setCaptureVideoShowModal(true);
  const handleCaptureVideoCloseModal = () => setCaptureVideoShowModal(false);

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
    setVideoDuration(0); // Reset video duration
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    let timer;
    if (isCapturingVideo) {
      timer = setInterval(() => {
        setVideoDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isCapturingVideo]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize Pusher and fetch initial messages
  useEffect(() => {
    fetchUsername();
    const cleanup = initializePusher();
    fetchMessages(); // Fetch messages on component mount
    return cleanup;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializePusher = () => {
    const pusher = new Pusher(API_PUSHER_KEY, { cluster: API_PUSHER_CLUSTER });
    const channel = pusher.subscribe('chat');

    channel.bind('message', (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    channel.bind('user-typing', ({ username: typingUsername, isTyping }) => {
      if (isTyping) {
        setTypingIndicator(`${typingUsername} ${strings.typing}`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingIndicator('');
        }, 1000);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      clearTimeout(typingTimeoutRef.current);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsername = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (!token) return;
    try {
      const { data } = await Axios.get(`${API_BASE_URL}/api/users/userdata`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUsername(data.name);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const fetchMessages = () => {
    Axios.get(`${API_BASE_URL}/api/chat/messages`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch messages', error);
      });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 500);
    sendTypingStatus(true);
  };

  const sendTypingStatus = async (isTyping) => {
    await Axios.post(`${API_BASE_URL}/api/chat/typing`, { username, isTyping }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).catch((error) => console.error('Error sending typing status', error));
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    await Axios.post(`${API_BASE_URL}/api/chat/messages`, { username, message }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    setMessage('');
    sendTypingStatus(false);
    if (isAiEnabled) {
      generateResponse(); // Call generateResponse if isAiEnabled is true
    }
    fetchMessages(); // Fetch messages after sending a new message
  };

  const handleAiCheckboxChange = (e) => {
    setIsAiEnabled(e.target.checked);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('message', message);
    formData.append('image', selectedFile);

    try {
      const response = await Axios.post(`${API_BASE_URL}/api/chat/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`
        }
      });
      // Clear message and selected file after successful upload
      setMessage('');
      setSelectedFile(null);
      handleCloseModal();
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful', 
        text: response.data.message,  
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const renderMessageImageOrVideo = (msg) => {
    if (msg.image_path) {
      const imageUrl = API_BASE_URL + '/' + msg.image_path;
      if (msg.type === 'image') {
        return (<><br /><br /><img src={imageUrl} className="message-image" alt="Uploaded" /></>);
      } else {
        return  (<><br /><br /><video
                  controls
                  className='Webcam-video'
                >
                  <source
                    src={imageUrl}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video></>);
      }
    }
    return null;
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Update the state with the captured image source
    setImageSrc(imageSrc);;
  };

  const uploadCapture = async (e) => {
    e.preventDefault();
    try {
      // Send the captured image to the server
      const formData = new FormData();
      formData.append('message', message);
      formData.append('file', imageSrc);

      const response = await Axios.post(API_BASE_URL + '/api/chat/capture-upload', formData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('');
      handleCaptureCloseModal();
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful', 
        text: response.data.message,  
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    handleCaptureVideoCloseModal();  
    if (recordedChunks.length) {
    //  setvideoUploading(true);
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const formData = new FormData();
      formData.append('message', message);
      formData.append('file', blob, 'captured-video.webm');

      await Axios.post(API_BASE_URL + '/api/chat/upload-video', formData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
          'Content-Type': 'multipart/form-data',
        }
      })
        .then(response => {
          console.log(response)
          setvideoUploading(false);
          handleCaptureVideoCloseModal(); 
          console.log("Video uploaded successfully");
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful', 
            text: response.data.message,  
          }).then((result) => {
            if (result.isConfirmed) {
              fetchMessages();
            }
          });
        })
        .catch(error => {
          console.error("Error uploading photo:", error);
          setvideoUploading(false);
        });
    }
};

  const generateResponse = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      const response = await Axios.post(API_BASE_URL + '/api/chat/generate-response', { prompt: message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log(response.data.response);
      // Handle the response from OpenAI
      const aiResponseMessage = {
        username: 'AI',
        message: response.data.response,
        created_at: new Date().toISOString()
      };
      setMessages((prevMessages) => [aiResponseMessage, ...prevMessages]);
      fetchMessages();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
    <div className="chat-container">
      <Button variant="primary" className='message-upload-button' onClick={handleShowModal}>
        Upload Image with Message
      </Button>
      <Button variant="primary" className='message-capture-button' onClick={handleCaptureShowModal}>
        Capture Image with Message
      </Button>
      <Button variant="primary" className='message-capture-video-button' onClick={handleCaptureVideoShowModal}>
        Capture Video with Message
      </Button>
      <div className="messages-list">
        {[...messages].reverse().map((msg, index) => {
          const profilePicUrl = msg.profile_picture_path
            ? `${API_BASE_URL}${msg.profile_picture_path.replace('public/uploads', '/storage/uploads')}`
            : null;
          const defaultImg = msg.gender === 'male' ? DefaultMaleImage : DefaultFemaleImage;

          return (
            <div key={index} className="message">
              <div className='message-date'>
                <strong>{msg.username}: </strong>
                <i>{msg.formatted_created_at}</i>
              </div>
              <div className='massage-container'>
                <img src={profilePicUrl || defaultImg} className='message-avatar' alt={`Profile of ${msg.username}`} />
                <span>{msg.message}</span>
                {renderMessageImageOrVideo(msg)} {/* Render image if image_path is not null */}
                <div className='message-clear' />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {typingIndicator && <div className="typing-indicator">{typingIndicator}</div>}
      <form className="message-form">
        <div>
          Ask from AI
          <input
            type="checkbox"
            className="message-ai"
            name="ai"
            checked={isAiEnabled}
            onChange={handleAiCheckboxChange}
          />
        </div>
        <input
          className="message-input"
          placeholder={strings.box}
          value={message}
          onChange={handleTyping}
        />
        <button className="send-button" onClick={submitMessage}>{strings.send}</button>
      </form>
    </div>
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-opload-title'>Upload Images with Message</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        {/* Add your content for image upload and message input here */}
        {/* For simplicity, I'll provide a basic form */}
        <form className='upload-form'>
          <input type="file" id="upload-input" className='message-file-selector' onChange={(e) => setSelectedFile(e.target.files[0])} /> {/* Input for image upload */}
          <label htmlFor="upload-input" className='message-file-button'>{strings.browse}</label>
          <input name="message" value={message} placeholder="Enter your message here..." className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={handleUpload}>Upload</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showCaptureModal} onHide={handleCaptureCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-opload-title'>Captrue Image with Message</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        {/* Add your content for image upload and message input here */}
        {/* For simplicity, I'll provide a basic form */}
        <Webcam
          className="Webcam-message"
          forceScreenshotSourceSize
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1920, height:1080 }}
        />
        <button className="Webcam-capture-button" onClick={capture}>
          {strings.capturePhoto}
        </button>
        <form className='upload-form'>
          <input name="message" value={message} placeholder="Enter your message here..." className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={uploadCapture}>Upload</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showCaptureVideoModal} onHide={handleCaptureVideoCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-opload-title'>Captrue Video with Message</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        {/* Add your content for image upload and message input here */}
        {/* For simplicity, I'll provide a basic form */}
        <Webcam
          className="Webcam-message"
          forceScreenshotSourceSize
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1920, height:1080 }}
        />
        {!isCapturingVideo ? (
          <button className="Webcam-button startVideo" onClick={startVideoCapture}>Start Video</button>
        ) : (
          <button className="Webcam-button stopVideo" onClick={stopVideoCapture}>Stop Video</button>
        )}
        <div>Duration: {formatDuration(videoDuration)}</div>
        <form className='upload-form'>
          <input name="message" value={message} placeholder="Enter your message here..." className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={uploadVideo}>Upload</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureVideoCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );
};

export default App;