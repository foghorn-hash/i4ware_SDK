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
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Choose a theme that you like
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/python';
import HighlightedResponse from './HighlightedResponse';
import MessageList from './MessageList';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_DEFAULT_LANGUAGE, API_PUSHER_KEY, API_PUSHER_CLUSTER } from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    send: "Send",
    typing: "is typing...",
    box: "Write a message...",
    browse: "Browse",
    capturePhoto: "Take a Photo",
    upload_image_with_message: "Upload Image with Message",
    capture_image_with_message: "Capture Image with Message",
    capture_video_with_message: "Capture Video with Message",
    ask_from_ai: "Ask from AI",
    close: "Close",
    enter_your_message: "Enter your message here...",
    start_video: "Start Video",
    stop_video: "Stop Video",
    upload: "Upload",
    duration: "Duration",
    upload_successful: "Upload Successful",
    image_upload_successful: "Image upload success",
    capture_successful: "Image capture success",
    video_capture_successful: "Video capture success",
    please_select_file: "Please select a file to upload.",
    failed_to_upload_file: "Failed to upload file. Please try again.",
    your_browser_not_support_video_tag: "Your browser does not support the video tag.",
  },
  fi: {
    send: "Lähetä",
    typing: "kirjoittaa...",
    box: "Kirjoita viesti...",
    browse: "Selaa",
    capturePhoto: "Ota Kuva",
    upload_image_with_message: "Lataa kuva viestin kassa",
    capture_image_with_message: "Kaappaa kuva viestin kanssa",
    capture_video_with_message: "Kaappaa video viestin kanssa",
    ask_from_ai: "Kysy tekoälyltä",
    close: "Sulje",
    enter_your_message: "Kirjoita viestisi tähän...",
    start_video: "Aloita Video",
    stop_video: "Lopeta Video",
    upload: "Lataa",
    duration: "Kesto",
    upload_successful: "Lataus onnistui",
    image_upload_successful: "Kuvan lataus onnistui",
    capture_successful: "Kuvan kaappaus onnistui",
    video_capture_successful: "Videon kaappaus onnistui",
    please_select_file: "Olehyvä ja valitse tiedosto minkä haluat ladata.",
    failed_to_upload_file: "Tiedoston lataus epäonnistui. Olehyvä ja yritä uudestaan.",
    your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
  },
  se: {
    send: "Skicka",
    typing: "skriver...",
    box: "Skriv meddelande...",
    browse: "Bläddra",
    capturePhoto: "Ta en bild",
    upload_image_with_message: "Ladda upp bild med meddelande",
    capture_image_with_message: "Fånga bild med meddelande",
    capture_video_with_message: "Fånga video med meddelande",
    ask_from_ai: "Fråga en AI",
    close: "Stäng",
    enter_your_message: "Skriv ditt meddelande här...",
    start_video: "Starta video",
    stop_video: "Stoppa video",
    upload: "Ladda upp",
    duration: "Varaktighet",
    upload_successful: "Uppladdning lyckades",
    image_upload_successful: "Bilduppladdning lyckades",
    capture_successful: "Bildupptagning lyckades",
    video_capture_successful: "Videoupptagning lyckades",
    please_select_file: "Vänligen välj en fil att ladda upp.",
    failed_to_upload_file: "Misslyckades med att ladda upp filen. Försök igen.",
    your_browser_not_support_video_tag: "Din webbläsare stöder inte videomarkeringen.",
  }
});

const PusherChat = () => {
  const [username, setUsername] = useState(localStorage.getItem(ACCESS_USER_DATA) || 'Guest');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typingIndicator, setTypingIndicator] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState(false); // State to track AI checkbox
  const typingTimeoutRef = useRef(null);
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

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

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
      // Send typing status based on the active modal
      if (showModal) {
        sendTypingStatus(false, 'modal');
      } else if (showCaptureModal) {
        sendTypingStatus(false, 'captureModal');
      }
    }, 500);
    // Send typing status immediately when typing
    if (showModal) {
      sendTypingStatus(true, 'modal');
    } else if (showCaptureModal) {
      sendTypingStatus(true, 'captureModal');
    }
  };

  const sendTypingStatus = async (isTyping, modalType) => {
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
      alert(strings.please_select_file);
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
        title: strings.upload_successful, 
        text: strings.image_upload_successful,  
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(strings.failed_to_upload_file);
    }
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
        title: strings.upload_successful, 
        text: strings.capture_successful,  
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
            title: strings.upload_successful, 
            text: strings.video_capture_successful,  
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
    const response = await Axios.post(
      `${API_BASE_URL}/api/chat/generate-response`,
      { prompt: message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data.response);

    // Apply syntax highlighting to the response message
    const highlightedResponse = hljs.highlightAuto(response.data.response).value;

    // Create the AI response message object with highlighted message
    const aiResponseMessage = {
      username: 'AI',
      message: highlightedResponse, // Use the highlighted response
      created_at: new Date().toISOString(),
    };

    // Save the AI response message to the database
    await saveMessageToDatabase(aiResponseMessage);

    // Update the messages state
    setMessages((prevMessages) => [aiResponseMessage, ...prevMessages]);

    // Fetch updated messages
    fetchMessages();
  } catch (error) {
    console.error('Error:', error);
  }
};

const saveMessageToDatabase = async (message) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    await Axios.post(`${API_BASE_URL}/api/chat/save-message`, message, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Message saved to database successfully:', message);
  } catch (error) {
    console.error('Error saving message to database:', error);
  }
};

  return (
    <>
    <div className="chat-container">
      <Button variant="primary" className='message-upload-button' onClick={handleShowModal}>
        {strings.upload_image_with_message}
      </Button>
      <Button variant="primary" className='message-capture-button' onClick={handleCaptureShowModal}>
        {strings.capture_image_with_message}
      </Button>
      <Button variant="primary" className='message-capture-video-button' onClick={handleCaptureVideoShowModal}>
        {strings.capture_video_with_message}
      </Button>
      <MessageList messages={messages} DefaultMaleImage={DefaultMaleImage} DefaultFemaleImage={DefaultFemaleImage} />
      {typingIndicator && <div className="typing-indicator">{typingIndicator}</div>}
      <form className="message-form">
        <div>
          {strings.ask_from_ai}
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
        <Modal.Title className='massage-opload-title'>{strings.upload_image_with_message}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        {/* Add your content for image upload and message input here */}
        {/* For simplicity, I'll provide a basic form */}
        <form className='upload-form'>
          <input type="file" id="upload-input" className='message-file-selector' onChange={(e) => setSelectedFile(e.target.files[0])} /> {/* Input for image upload */}
          <label htmlFor="upload-input" className='message-file-button'>{strings.browse}</label>
          <input name="message" value={message} placeholder={strings.enter_your_message} className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={handleUpload}>{strings.upload}</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCloseModal}>
        {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showCaptureModal} onHide={handleCaptureCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-opload-title'>{strings.capture_image_with_message}</Modal.Title>
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
          <input name="message" value={message} placeholder={strings.enter_your_message} className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={uploadCapture}>{strings.upload}</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureCloseModal}>
        {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showCaptureVideoModal} onHide={handleCaptureVideoCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-opload-title'>{strings.capture_video_with_message}</Modal.Title>
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
          <button className="Webcam-button startVideo" onClick={startVideoCapture}>{strings.start_video}</button>
        ) : (
          <button className="Webcam-button stopVideo" onClick={stopVideoCapture}>{strings.stop_video}</button>
        )}
        <div>{strings.duration}: {formatDuration(videoDuration)}</div>
        <form className='upload-form'>
          <input name="message" value={message} placeholder={strings.enter_your_message} className='message-textarea' onChange={handleTyping} />
          <br />
          <button className='message-upload-button' onClick={uploadVideo}>{strings.upload}</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureVideoCloseModal}>
          {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );
};

export default PusherChat;