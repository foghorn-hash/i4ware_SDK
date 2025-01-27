import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import Axios from 'axios';
import './Chat.css';
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import MessageList from './MessageList';
import AudioRecorder from '../AudioRecorder/AudioRecorder';
import { Mic, Camera, CameraVideo, Upload } from 'react-bootstrap-icons';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_DEFAULT_LANGUAGE, API_PUSHER_KEY, API_PUSHER_CLUSTER } from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';
import { CloseButton } from 'react-bootstrap';

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
    speech_to_text: "Speech to Text",
    ask_from_ai: "Ask from AI",
    close: "Close",
    enter_your_message: "Enter your message here...",
    start_video: "Start Video",
    stop_video: "Stop Video",
    upload: "Upload and send",
    duration: "Duration",
    upload_successful: "Upload Successful",
    image_upload_successful: "Image upload success",
    capture_successful: "Image capture success",
    video_capture_successful: "Video capture success",
    please_select_file: "Please select a file to upload",
    failed_to_upload_file: "Failed to upload file. Please try again.",
    your_browser_not_support_video_tag: "Your browser does not support the video tag.",
    aiTypingIndicator: "AI is thinking...",
    record_audio: "Record Audio",
    speech: "is recoding speech...",
    please_capture_image: "Please capture an image to upload",
    please_capture_video: "Please capture a video to upload",
    please_write_message: "Please write a message to send",
    generate_image: "Generate Image",
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
    speech_to_text: "Puhe tekstiksi",
    ask_from_ai: "Kysy tekoälyltä",
    close: "Sulje",
    enter_your_message: "Kirjoita viestisi tähän...",
    start_video: "Aloita Video",
    stop_video: "Lopeta Video",
    upload: "Lataa ja lähetä",
    duration: "Kesto",
    upload_successful: "Lataus onnistui",
    image_upload_successful: "Kuvan lataus onnistui",
    capture_successful: "Kuvan kaappaus onnistui",
    video_capture_successful: "Videon kaappaus onnistui",
    please_select_file: "Olehyvä ja valitse tiedosto minkä haluat ladata",
    failed_to_upload_file: "Tiedoston lataus epäonnistui. Olehyvä ja yritä uudestaan.",
    your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
    aiTypingIndicator: "Tekoäly miettii ...",
    record_audio: "Näuhoita ääni",
    speech: "nauhoittaa puhetta...",
    please_capture_image: "Olehyvä ja kaappaa kuva ladataksesi",
    please_capture_video: "Olehyvä ja kaappaa video ladataksesi",
    please_write_message: "Olehyvä ja kirjoita viesti lähettääksesi",
    generate_image: "Luo kuva",
  },
  sv: {
    send: "Skicka",
    typing: "skriver...",
    box: "Skriv meddelande...",
    browse: "Bläddra",
    capturePhoto: "Ta en bild",
    upload_image_with_message: "Ladda upp bild med meddelande",
    capture_image_with_message: "Fånga bild med meddelande",
    capture_video_with_message: "Fånga video med meddelande",
    speech_to_text: "Tal till text",
    ask_from_ai: "Fråga en AI",
    close: "Stäng",
    enter_your_message: "Skriv ditt meddelande här...",
    start_video: "Starta video",
    stop_video: "Stoppa video",
    upload: "Ladda upp och skicka",
    duration: "Varaktighet",
    upload_successful: "Uppladdning lyckades",
    image_upload_successful: "Bilduppladdning lyckades",
    capture_successful: "Bildupptagning lyckades",
    video_capture_successful: "Videoupptagning lyckades",
    please_select_file: "Vänligen välj en fil att ladda upp",
    failed_to_upload_file: "Misslyckades med att ladda upp filen. Försök igen.",
    your_browser_not_support_video_tag: "Din webbläsare stöder inte videomarkeringen.",
    aiTypingIndicator: "AI tänker ...",
    record_audio: "Spela in ljud",
    speech: "spela in tal...",
    please_capture_image: "Vänligen ta en bild för att ladda upp",
    please_capture_video: "Vänligen ta en video för att ladda upp",
    please_write_message: "Vänligen skriv ett meddelande att skicka",
    generate_image: "Generera bild",
  }
});

const PusherChat = () => {
  const authData = localStorage.getItem(ACCESS_USER_DATA);
  const authArray = JSON.parse(authData);
  const [username, setUsername] = useState(authArray.name || 'Guest');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typingIndicator, setTypingIndicator] = useState('');
  const [speechIndicator, setSpeechIndicator] = useState('');
  const [aiTypingIndicator, setAiTypingIndicator] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState(false); // State to track AI checkbox
  const [isGenerateEnabled, setIsGenerateEnabled] = useState(false); // State to track AI checkbox
  const typingTimeoutRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showCaptureModal, setCaptureShowModal] = useState(false);
  const [showCaptureVideoShowModal, setCaptureVideoShowModal] = useState(false);
  const [showRecordAudioShowModal, setRecordAudioShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageVideoSrc, setImageVideoSrc] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [videoUploading, setvideoUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [highlight, setHighlight] = useState({ button: false, textarea: false });

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setImageUploading(false);
    setError('');
    setHighlight({ button: false, textarea: false }); 
  }
  
  const handleCaptureShowModal = () => setCaptureShowModal(true);
  const handleCaptureCloseModal = () => {
    setCaptureShowModal(false);
    setImageSrc(null);
    setError('');
    setHighlight({ button: false, textarea: false });
  }

  const handleCaptureVideoShowModal = () => setCaptureVideoShowModal(true);
  
  const handleCaptureVideoCloseModal = () => {
    setCaptureVideoShowModal(false);
    setVideoDuration(0); // Reset video duration to 0
    setImageVideoSrc(null);
    setError('');
    setHighlight({ button: false, textarea: false });
  };

  const handleRecordAudioShowModal = () => setRecordAudioShowModal(true);
  const handleRecordAudioCloseModal = () => setRecordAudioShowModal(false);

  const startVideoCapture = () => {
    setIsCapturingVideo(true);
    setRecordedChunks([]);
    startRecording();
  };

  const stopVideoCapture = () => {
    const imageVideoSrc = webcamRef.current.getScreenshot();
    setImageVideoSrc(imageVideoSrc);
    setIsCapturingVideo(false);
    stopRecording();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const startRecording = async () => {
    // Request access to the webcam and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });


    mediaRecorderRef.current = new MediaRecorder(stream);
    
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

  const anyModalOpen = showModal || showCaptureModal || showCaptureVideoShowModal;

  useEffect(() => {
    if (!anyModalOpen) {
      setMessage('');
    }
  }, [anyModalOpen]);

  const clearMessage = () => {
    setMessage('');
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
    const channel = pusher.subscribe(authArray.domain + '_chat');

    channel.bind('message', (newMessage) => {
        //setMessages((prevMessages) => [newMessage, ...prevMessages]);
        fetchMessages();
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

    channel.bind('user-speech', ({ username: speechUsername, isSpeech }) => {
      if (isSpeech) {
        setSpeechIndicator(`${speechUsername} ${strings.speech}`);
      } else {
        setSpeechIndicator('');
      }
    });

    channel.bind('ai-thinking', function (data) {
      setIsThinking(data.isThinking);
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUploading(e.target.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      setError('');
      setHighlight({ button: false, textarea: false }); 
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 500);
    sendTypingStatus(true);
    setError('');
    setHighlight({ button: false, textarea: false }); 
  };

  const sendTypingStatus = async (isTyping) => {
    await Axios.post(`${API_BASE_URL}/api/chat/typing`, { username, isTyping }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).catch((error) => console.error('Error sending typing status', error));
  };

  const sendSpeechStatus = async (isSpeech) => {
    await Axios.post(`${API_BASE_URL}/api/chat/speech`, { username, isSpeech }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).catch((error) => console.error('Error sending speech status', error));
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    try {
      const optionSelected = isAiEnabled ? 'ask_from_ai' : isGenerateEnabled ? 'generate_image' : null;
      await Axios.post(`${API_BASE_URL}/api/chat/messages`, { username, message }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
      });
      setMessage('');
      sendTypingStatus(false);
      if (isAiEnabled) {
        setIsThinking(true);
        await Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: true }, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
        });
        await generateResponse();
      } else if (isGenerateEnabled) {
        setIsThinking(true);
        await Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: true }, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
        });
        await generateImage();
      } else {
        fetchMessages(); // Fetch messages after sending user message
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleAiCheckboxChange = (e) => {
    setIsAiEnabled(e.target.checked);
    if (e.target.checked) setIsGenerateEnabled(false); // Uncheck the other option
  };
  
  const handleGenerateCheckboxChange = (e) => {
    setIsGenerateEnabled(e.target.checked);
    if (e.target.checked) setIsAiEnabled(false); // Uncheck the other option
  };

  const validateUpload = (image, message) => {
    let errorMsg = '';
    let highlightButton = false;
    let highlightTextarea = false;
  
    if (!image && !message) {
      errorMsg = `${strings.please_select_file}<br />${strings.please_write_message}`;
      highlightButton = true;
      highlightTextarea = true;
    } else if (!image) {
      errorMsg = strings.please_select_file;
      highlightButton = true;
    } else if (!message) {
      errorMsg = strings.please_write_message;
      highlightTextarea = true;
    }
  
    return { errorMsg, highlightButton, highlightTextarea };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(imageUploading, message);

    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }

    setError(''); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting

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
      setError(strings.failed_to_upload_file);
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Update the state with the captured image source
    setImageSrc(imageSrc);
    setError(''); 
    setHighlight({ button: false, textarea: false }); 
  };

  const uploadCapture = async (e) => {
    e.preventDefault();
    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(imageSrc, message);

    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }

    setError(''); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting

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
      setError(strings.failed_to_upload_file);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();

    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(imageVideoSrc, message);
  
    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }
  
    setError(''); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting
  
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
    const response = await Axios.post(`${API_BASE_URL}/api/chat/generate-response`, { prompt: message }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    const highlightedHTML = response.data.response;
    const aiResponseMessage = {
      username: 'AI',
      message: highlightedHTML,
      generate: false,
      created_at: new Date().toISOString(),
    };
    await saveMessageToDatabase(aiResponseMessage);
    setIsThinking(false);
    await Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: false }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    fetchMessages(); // Fetch messages after generating AI response
  } catch (error) {
    console.error('Error:', error);
    setIsThinking(false);
  }
};

const generateImage = async () => {
  try {
    const response = await Axios.post(`${API_BASE_URL}/api/chat/generate-image`, { prompt: message, generate: true }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    const highlightedHTML = response.data.response;
    const aiResponseMessage = {
      username: 'AI',
      generate: true,
      message: highlightedHTML,
      created_at: new Date().toISOString(),
    };
    await saveMessageToDatabase(aiResponseMessage);
    setIsThinking(false);
    await Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: false }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    fetchMessages(); // Fetch messages after generating AI response
  } catch (error) {
    console.error('Error:', error);
    setIsThinking(false);
  }
};

const saveMessageToDatabase = async (message) => {
  try {
    await Axios.post(`${API_BASE_URL}/api/chat/save-message`, message, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
  } catch (error) {
    console.error('Error saving message to database:', error);
  }
};

  return (
    <>
    <div className="chat-container">
      <Button variant="primary" className='message-upload-button' onClick={handleShowModal}>
         <Upload /> {strings.upload_image_with_message}
      </Button>
      <Button variant="primary" className='message-capture-button' onClick={handleCaptureShowModal}>
         <Camera /> {strings.capture_image_with_message}
      </Button>
      <Button variant="primary" className='message-capture-video-button' onClick={handleCaptureVideoShowModal}>
         <CameraVideo /> {strings.capture_video_with_message}
      </Button>
      <Button variant="primary" className='message-record-audio-button' onClick={handleRecordAudioShowModal}>
        <Mic /> {strings.speech_to_text}
      </Button>
      <div className='message-area'>
        <MessageList messages={messages} DefaultMaleImage={DefaultMaleImage} DefaultFemaleImage={DefaultFemaleImage} />
        <div className='active-list'>
          {typingIndicator && <div className="typing-indicator">{typingIndicator}</div>}
          {speechIndicator && <div className="typing-indicator">{speechIndicator}</div>}
          {isThinking && <div className="typing-indicator">{strings.aiTypingIndicator}</div>}
        </div>
      </div>


      <Form className="message-form">
      <Form.Group>
          <Form.Check // prettier-ignore
            type="radio"
            className="message-ai"
            name="ai-options"
            label={strings.ask_from_ai}
            checked={isAiEnabled}
            onChange={handleAiCheckboxChange}
            value="ai"
          />
          <Form.Check // prettier-ignore
            type="radio"
            className="generate-image-ai"
            name="ai-options"
            label={strings.generate_image}
            checked={isGenerateEnabled}
            onChange={handleGenerateCheckboxChange}
            value="generate-image"
          />
      </Form.Group>
      <Form.Group style={{ position: 'relative' }}>
        <Form.Control
          as="textarea"
          className="message-input"
          placeholder={strings.box}
          value={showModal || showCaptureModal || showCaptureVideoShowModal ? '' : message}
          // value={message}
          onChange={handleTyping}
          style={{ height: 'auto', minHeight: '50px' }}
        />
        <CloseButton onClick={clearMessage} style={{ position: 'absolute', top: '10px', right: '20px', color: 'white'
       }} />
      </Form.Group>
        <Button variant='primary' onClick={submitMessage}>{strings.send}</Button>
      </Form>
    </div>
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-upload-title'>{strings.upload_image_with_message}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        {/* Add your content for image upload and message input here */}
        {/* For simplicity, I'll provide a basic form */}
        
        <form className='upload-form'>
          <input 
            type="file" 
            id="upload-input" className='message-file-selector' 
            // onChange={(e) => setSelectedFile(e.target.files[0])} 
            onChange={handleFileChange} 
            /> {/* Input for image upload */}
          <label 
            htmlFor="upload-input" 
            className={`message-file-button ${highlight.button ? 'highlight' : ''}`}>
              {strings.browse}
          </label>
          {imageUploading &&  <img className='imageUpload' src={imageUploading} />}
          <textarea 
            name="message" 
            value={message} 
            placeholder={strings.enter_your_message} className={`message-textarea ${highlight.textarea ? 'highlight' : ''}`} 
            onChange={handleTyping} />
          <br />
          {error && <div className='error-message' dangerouslySetInnerHTML={{ __html: error }} />}
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
        <Modal.Title className='massage-upload-title'>{strings.capture_image_with_message}</Modal.Title>
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
        <button className={`message-file-button ${highlight.button ? 'highlight' : ''}`} onClick={capture}>
          {strings.capturePhoto}
        </button>
        {imageSrc && <img className='Webcam-message' src={imageSrc} />}
        <form className='upload-form'>
          <textarea name="message" 
            value={message} 
            placeholder={strings.enter_your_message}  className={`message-textarea ${highlight.textarea ? 'highlight' : ''}`} 
            onChange={handleTyping} />
          <br />
          {error && <div className='error-message' dangerouslySetInnerHTML={{ __html: error }} />}
          <button 
            className='message-upload-button'
            onClick={uploadCapture}>{strings.upload}</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureCloseModal}>
        {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showCaptureVideoShowModal} onHide={handleCaptureVideoCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-upload-title'>{strings.capture_video_with_message}</Modal.Title>
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
          <button 
            className={`Webcam-button startVideo ${highlight.button ? 'highlight' : ''}`}
            onClick={startVideoCapture}>
              {strings.start_video}
          </button>
        ) : (
          <button className="Webcam-button stopVideo" onClick={stopVideoCapture}>{strings.stop_video}</button>
        )}
        <div>{strings.duration}: {formatDuration(videoDuration)}</div>
        {imageVideoSrc && <img className='Webcam-message' src={imageVideoSrc} />}
        <form className='upload-form'>
          <textarea 
            name="message" 
            value={message} 
            placeholder={strings.enter_your_message} className={`message-textarea ${highlight.textarea ? 'highlight' : ''}`} 
            onChange={handleTyping} />
          <br />
          {error && <div className='error-message' dangerouslySetInnerHTML={{ __html: error }} />}
          <button className='message-upload-button' onClick={uploadVideo}>{strings.upload}</button>
        </form>
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleCaptureVideoCloseModal}>
          {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal show={showRecordAudioShowModal} onHide={handleRecordAudioCloseModal}>
      <Modal.Header className='message-upload-modal' closeButton>
        <Modal.Title className='massage-upload-title'>{strings.speech_to_text}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='message-upload-modal'>
        <AudioRecorder fetchMessages={fetchMessages} isThinking={isThinking} setIsThinking={setIsThinking} setSpeechIndicator={setSpeechIndicator} sendSpeechStatus={sendSpeechStatus} />
      </Modal.Body>
      <Modal.Footer className='message-upload-modal'>
        <Button variant="secondary" onClick={handleRecordAudioCloseModal}>
          {strings.close}
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );
};

export default PusherChat;