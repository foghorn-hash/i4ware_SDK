import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import Axios from "axios";
import "./Chat.css";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import MessageList from "./MessageList";
import AudioRecorder from "../AudioRecorder/AudioRecorder";
import { Mic, Camera, CameraVideo, Upload } from "react-bootstrap-icons";
import {
  API_BASE_URL,
  ACCESS_TOKEN_NAME,
  ACCESS_USER_DATA,
  API_PUSHER_KEY,
  API_PUSHER_CLUSTER,
} from "../../constants/apiConstants";
import { CloseButton } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useTranslation } from "react-i18next";

const PusherChat = () => {
  const authData = localStorage.getItem(ACCESS_USER_DATA);
  const authArray = JSON.parse(authData);
  const [username, setUsername] = useState(authArray.name || "Guest");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingIndicator, setTypingIndicator] = useState("");
  const [speechIndicator, setSpeechIndicator] = useState("");
  const [aiTypingIndicator, setAiTypingIndicator] = useState("");
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageVideoSrc, setImageVideoSrc] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [videoUploading, setvideoUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [highlight, setHighlight] = useState({
    button: false,
    textarea: false,
  });
  const [role, setRole] = useState("");
  const [problem, setProblem] = useState("");
  const [history, setHistory] = useState("");
  const [goal, setGoal] = useState("");
  const [expectation, setExpectation] = useState("");
  const [showPromptOverlay, setShowPromptOverlay] = useState(false);
  const [isRohtoEnabled, setIsRohtoEnabled] = useState(false); // Add this state

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [firstItemIndex, setFirstItemIndex] = useState();
  const virtuosoRef = useRef(null);

  const enableRohto = () => setIsRohtoEnabled(true);
  const disableRohto = () => setIsRohtoEnabled(false);
  const toggleRohto = () => setIsRohtoEnabled((prev) => !prev);

  const [loadingOlder, setLoadingOlder] = useState(false);

  const fileInputRef = useRef(null);


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  // Handle PDF selection
  const handlePdfChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    // Show "AI is thinking" indicator via Pusher
    setIsThinking(true);
    await Axios.post(
      `${API_BASE_URL}/api/chat/thinking`,
      { username: "AI", isThinking: true },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      }
    );

    // send to backend
    const formData = new FormData();
    formData.append("pdf", file);
    // Ensure message is not empty for PDF uploads
    const messageForPdf = message.trim() || 'Please analyze this PDF document';
    formData.append("message", messageForPdf);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN_NAME);
      console.log('PDF Upload - Token from localStorage:', token);
      console.log('PDF Upload - Token first 20 chars:', token ? token.substring(0, 20) : 'null');

      // Validate token before proceeding
      if (!validateToken()) {
        return; // Stop execution if token is invalid
      }

      console.log('About to send request with token:', token.substring(0, 50) + '...');
      console.log('Full Authorization header:', `Bearer ${token}`);

      // Ensure message is not empty for PDF uploads
      const messageText = message.trim() || 'PDF document uploaded for analysis';

      const responseSubmit = await Axios.post(
        `${API_BASE_URL}/api/chat/messages`,
        { username, message: messageText, type: null },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("");

      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/analyze-pdf`,
        formData, // <-- body goes here directly
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
            "Content-Type": "multipart/form-data", // important for file upload
          },
        }
      );

      if (response.data.success === false) {
        throw new Error("Failed to upload PDF");
      } else {
        // Show success message
        Swal.fire({
          icon: "success",
          title: t('upload_successful'),
          text: t('pdf_upload_successful'),
        }).then((result) => {
          if (result.isConfirmed) {
            setIsThinking(false);
            Axios.post(
              `${API_BASE_URL}/api/chat/thinking`,
              { username: "AI", isThinking: false },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
                },
              }
            );
            fetchMessages(); // Refresh messages after successful upload     
            setMessage("");
          }
        });
      }


    } catch (err) {
      console.error(err);
      alert("Error analyzing PDF");
      Swal.fire({
        icon: "error",
        title: t('upload_failure'),
        text: t('pdf_upload_failure'),
      });
      setIsThinking(false);
      Axios.post(
        `${API_BASE_URL}/api/chat/thinking`,
        { username: "AI", isThinking: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setImageUploading(false);
    setError("");
    setHighlight({ button: false, textarea: false });
  };

  const handleCaptureShowModal = () => setCaptureShowModal(true);
  const handleCaptureCloseModal = () => {
    setCaptureShowModal(false);
    setImageSrc(null);
    setError("");
    setHighlight({ button: false, textarea: false });
  };

  const handleCaptureVideoShowModal = () => setCaptureVideoShowModal(true);

  const handleCaptureVideoCloseModal = () => {
    setCaptureVideoShowModal(false);
    setVideoDuration(0); // Reset video duration to 0
    setImageVideoSrc(null);
    setError("");
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
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
    setVideoDuration(0); // Reset video duration
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const anyModalOpen =
    showModal || showCaptureModal || showCaptureVideoShowModal;

  useEffect(() => {
    if (!anyModalOpen) {
      setMessage("");
    }
  }, [anyModalOpen]);

  const clearMessage = () => {
    setMessage("");
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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Utility function to validate JWT token
  const validateToken = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);

    // Check if token is valid JWT format (should have exactly 3 parts separated by dots)
    if (!token || typeof token !== 'string' || token.trim() === '' || token.split('.').length !== 3) {
      console.error('Invalid JWT token format detected on component mount, clearing localStorage and redirecting to login');
      console.error('Current token:', token);
      console.error('Token type:', typeof token);
      console.error('Token length:', token ? token.length : 'null');
      localStorage.clear();
      alert('Token on vanhentunut tai viallinen. Sinut ohjataan kirjautumissivulle.');
      window.location.href = '/';
      return false;
    }

    // Additional validation: Check if token parts are not empty
    const tokenParts = token.split('.');
    if (tokenParts.some(part => !part || part.trim() === '')) {
      console.error('JWT token has empty parts detected on component mount, clearing localStorage and redirecting to login');
      console.error('Token parts:', tokenParts);
      localStorage.clear();
      alert('Token on vanhentunut tai viallinen. Sinut ohjataan kirjautumissivulle.');
      window.location.href = '/';
      return false;
    }

    return true;
  };

  // Initialize Pusher and fetch initial messages
  useEffect(() => {
    // Validate token first before doing anything
    if (!validateToken()) {
      return; // Stop execution if token is invalid
    }

    fetchUsername();
    const cleanup = initializePusher();
    fetchMessages(); // Fetch messages on component mount
    return cleanup;
  }, []);

  const initializePusher = () => {
    const pusher = new Pusher(API_PUSHER_KEY, { cluster: API_PUSHER_CLUSTER });
    const channel = pusher.subscribe(authArray.domain + "_chat");

    channel.bind("message", (newMessage) => {
      //setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      //fetchMessages();
    });

    channel.bind("user-typing", ({ username: typingUsername, isTyping }) => {
      if (isTyping) {
        setTypingIndicator(`${typingUsername} ${t('typing')}`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingIndicator("");
        }, 1000);
      }
    });

    channel.bind("user-speech", ({ username: speechUsername, isSpeech }) => {
      if (isSpeech) {
        setSpeechIndicator(`${speechUsername} ${t('speech')}`);
      } else {
        setSpeechIndicator("");
      }
    });

    channel.bind("ai-thinking", function (data) {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(data.name);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetchMessages(1); // newest page (backend should paginate DESC)
      const initialMessages = res.messages.reverse(); // reverse to ASC order
      setMessages(initialMessages);
      setFirstItemIndex(100000); // Set to 10000 to make sure firstItemIndex MUST BE LESS than 0
      setPage(1);
      setHasMore(res.current_page < res.last_page);
    })();
  }, []);

  const loadOlderMessages = async () => {
    if (!hasMore) return;

    setLoadingOlder(true);

    const nextPage = page + 1;
    const res = await fetchMessages(nextPage);
    const newMessages = res.messages.reverse();

    if (newMessages.length === 0) {
      setHasMore(false);
      return;
    }
    setMessages((prevMessages) => {
      const existingIds = new Set(prevMessages.map((msg) => msg.id));
      const uniqueMessages = newMessages.filter(
        (msg) => !existingIds.has(msg.id)
      );
      return [...uniqueMessages, ...prevMessages];
    });
    setPage(nextPage);
    setFirstItemIndex((prev) => prev - newMessages.length);

    setLoadingOlder(false);
  };

  // const loadNewerMessages = async () => {
  //   if (!hasNewer) return;
  //   const pageToFetch = newestPage + 1;
  //   const res = await fetchMessages(pageToFetch);
  //   const newMessages = res.messages;

  //   if (newMessages.length === 0) {
  //     setHasNewer(false);
  //     return;
  //   }

  //   setMessages((prev) => [...prev, ...newMessages]);
  //   setNewestPage(pageToFetch);
  // };

  const fetchMessages = async (pageNumber = 1) => {
    try {
      const response = await Axios.get(
        `${API_BASE_URL}/api/chat/messages?page=${pageNumber}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch messages", error);
      throw error;
    }
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
      setError("");
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
    setError("");
    setHighlight({ button: false, textarea: false });
  };

  const sendTypingStatus = async (isTyping) => {
    await Axios.post(
      `${API_BASE_URL}/api/chat/typing`,
      { username, isTyping },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      }
    ).catch((error) => console.error("Error sending typing status", error));
  };

  const sendSpeechStatus = async (isSpeech) => {
    await Axios.post(
      `${API_BASE_URL}/api/chat/speech`,
      { username, isSpeech },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      }
    ).catch((error) => console.error("Error sending speech status", error));
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    try {
      const optionSelected = isAiEnabled
        ? "ask_from_ai"
        : isGenerateEnabled
          ? "generate_image"
          : null;
      // Send the actual message to the backend
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/messages`,
        { username, message, type: optionSelected },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      //const savedMessage = response.data.message;
      //console.log("Backend message:", savedMessage);
      // Use the backend-confirmed message (with id, gender, etc.)
      //setMessages((prevMessages) => [...prevMessages, savedMessage]);
      // Clear the message box
      setMessage("");
      sendTypingStatus(false);
      if (isAiEnabled) {
        setIsThinking(true);
        await Axios.post(
          `${API_BASE_URL}/api/chat/thinking`,
          { username: "AI", isThinking: true },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                ACCESS_TOKEN_NAME
              )}`,
            },
          }
        );
        await generateResponse();
      } else if (isGenerateEnabled) {
        setIsThinking(true);
        await Axios.post(
          `${API_BASE_URL}/api/chat/thinking`,
          { username: "AI", isThinking: true },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                ACCESS_TOKEN_NAME
              )}`,
            },
          }
        );
        await generateImage();
      }
    } catch (error) {
      console.error("Failed to send message", error);
      if (error.response) {
        console.log("Server responded with:", error.response.data);
      } else {
        console.log("No response from server at all");
      }
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
    let errorMsg = "";
    let highlightButton = false;
    let highlightTextarea = false;

    if (!image && !message) {
      errorMsg = `${t('please_select_file')}<br />${t('please_write_message')}`;
      highlightButton = true;
      highlightTextarea = true;
    } else if (!image) {
      errorMsg = t('please_select_file');
      highlightButton = true;
    } else if (!message) {
      errorMsg = t('please_write_message');
      highlightTextarea = true;
    }

    return { errorMsg, highlightButton, highlightTextarea };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(
      imageUploading,
      message
    );
    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }
    setError(""); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting

    const formData = new FormData();
    formData.append("message", message);
    formData.append("image", selectedFile);

    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      // Clear message and selected file after successful upload
      setMessage("");
      setSelectedFile(null);
      handleCloseModal();
      Swal.fire({
        icon: "success",
        title: t('upload_successful'),
        text: t('image_upload_successful'),
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(t('failed_to_upload_file'));
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Update the state with the captured image source
    setImageSrc(imageSrc);
    setError("");
    setHighlight({ button: false, textarea: false });
  };

  const uploadCapture = async (e) => {
    e.preventDefault();
    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(
      imageSrc,
      message
    );

    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }

    setError(""); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting

    try {
      // Send the captured image to the server
      const formData = new FormData();
      formData.append("message", message);
      formData.append("file", imageSrc);

      const response = await Axios.post(
        API_BASE_URL + "/api/chat/capture-upload",
        formData,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("");
      handleCaptureCloseModal();
      Swal.fire({
        icon: "success",
        title: t('upload_successful'),
        text: t('capture_successful'),
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error("Error uploading image", error);
      setError(t('failed_to_upload_file'));
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();

    const { errorMsg, highlightButton, highlightTextarea } = validateUpload(
      imageVideoSrc,
      message
    );

    if (errorMsg) {
      setError(errorMsg);
      setHighlight({ button: highlightButton, textarea: highlightTextarea });
      setTimeout(() => {
        setHighlight({ button: false, textarea: false });
      }, 3000); // Clear highlighting after 3 seconds
      return;
    }

    setError(""); // Clear any existing error
    setHighlight({ button: false, textarea: false }); // Remove highlighting

    handleCaptureVideoCloseModal();

    if (recordedChunks.length) {
      //  setvideoUploading(true);
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      const formData = new FormData();
      formData.append("message", message);
      formData.append("file", blob, "captured-video.webm");

      setUploadProgress(0);

      await Axios.post(API_BASE_URL + "/api/chat/upload-video", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      })
        .then((response) => {
          //console.log(response);
          setvideoUploading(false);
          //console.log("Video uploaded successfully");
          Swal.fire({
            icon: "success",
            title: t('upload_successful'),
            text: t('video_capture_successful'),
          }).then((result) => {
            if (result.isConfirmed) {
              setUploadProgress(0);
              //handleCaptureVideoCloseModal();
              fetchMessages();
            }
          });
        })
        .catch((error) => {
          console.error("Error uploading photo:", error);
          setvideoUploading(false);
        });
    }
  };

  const generateResponse = async () => {
    let fullPrompt;
    if (isRohtoEnabled) {
      fullPrompt = `
      ${t('rohto_role_label')}: ${role}
      ${t('rohto_problem_label')}: ${problem}
      ${t('rohto_history_label')}: ${history}
      ${t('rohto_goal_label')}: ${goal}
      ${t('rohto_expectation_label')}: ${expectation}
      ${t('rohto_for_prompt')}: ${message}
    `.trim();
    } else {
      // If ROHTO is disabled, just send the message as the prompt
      fullPrompt = message;
    }
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/generate-response`,
        { prompt: fullPrompt, language: i18n.language },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
          timeout: 120000, // 120 seconds (2 minutes)
        }
      );
      // 1. Generate the Word file in backend (if no code detected)
      const resp = await Axios.post(
        `${API_BASE_URL}/api/chat/word/send`,
        { prompt: fullPrompt, generate: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
          timeout: 120000, // 120 seconds (2 minutes)
        }
      );

      // Check if backend detected code and skipped Word generation
      const highHTML = resp.data.message;
      const codeDetected = resp.data.code_detected || false;
      const filename = codeDetected ? null : (resp.data.filename || "generated.docx");

      const aiResponseMessage = {
        username: "AI",
        generate: false,
        message: highHTML,
        created_at: new Date().toISOString(),
        filename: filename,
        type: codeDetected ? "text" : "docx", // Save as text if code detected
        download_link: filename ? `${API_BASE_URL}/storage/${filename}` : null,
      };

      await saveMessageToDatabase(aiResponseMessage, codeDetected ? "text" : "docx");
      // Pusher will automatically add the message with all backend fields (formatted_created_at, etc.)

      setIsThinking(false);
      await Axios.post(
        `${API_BASE_URL}/api/chat/thinking`,
        { username: "AI", isThinking: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      // fetchMessages(); // No longer needed - message already added to state
    } catch (error) {
      console.error("Error generating AI response:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setIsThinking(false);

      // Show user-friendly error message
      alert(t('error_generating_response') || "Failed to generate AI response. Please try again.");
    }
  };

  const generateImage = async () => {
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/generate-image`,
        { prompt: message, generate: true, language: i18n.language },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      const highlightedHTML = response.data.response;
      const aiResponseMessage = {
        username: "AI",
        generate: true,
        message: highlightedHTML,
        created_at: new Date().toISOString(),
        original_prompt: message, // Include original prompt for translation
        language: i18n.language, // Include language
      };
      await saveMessageToDatabase(aiResponseMessage);
      setIsThinking(false);
      await Axios.post(
        `${API_BASE_URL}/api/chat/thinking`,
        { username: "AI", isThinking: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      fetchMessages(); // Fetch messages after generating AI response
    } catch (error) {
      console.error("Error:", error);
      setIsThinking(false);
    }
  };

  const saveMessageToDatabase = async (message) => {
    try {
      await Axios.post(`${API_BASE_URL}/api/chat/save-message`, message, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      });
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

  return (
    <>
      <div className="chat-container">
        <Button
          className="rohto-button"
          variant="outline-secondary"
          style={{ float: "right", marginBottom: 10 }}
          onClick={() => setShowPromptOverlay(true)}
          disabled={!isRohtoEnabled}
        >
          ROHTO
        </Button>
        <Form.Check
          className="rohto-checkbox"
          type="checkbox"
          label={isRohtoEnabled ? t('rohto_disable') : t('rohto_enable')}
          checked={isRohtoEnabled}
          onChange={toggleRohto}
          style={{ float: "right", marginRight: 10, marginBottom: 10 }}
        />
        <Button
          variant="primary"
          className="message-upload-button"
          onClick={handleShowModal}
        >
          <Upload /> {t('upload_image_with_message')}
        </Button>
        <Button
          variant="primary"
          className="message-capture-button"
          onClick={handleCaptureShowModal}
        >
          <Camera /> {t('capture_image_with_message')}
        </Button>
        <Button
          variant="primary"
          className="message-capture-video-button"
          onClick={handleCaptureVideoShowModal}
        >
          <CameraVideo /> {t('capture_video_with_message')}
        </Button>
        <Button
          variant="primary"
          className="message-record-audio-button"
          onClick={handleRecordAudioShowModal}
        >
          <Mic /> {t('speech_to_text')}
        </Button>
        <div className="message-area">
          <MessageList
            messages={messages}
            virtuosoRef={virtuosoRef}
            firstItemIndex={firstItemIndex}
            hasMore={hasMore}
            loadingOlder={loadingOlder}
            loadOlderMessages={loadOlderMessages}
            //loadNewerMessages={loadNewerMessages}
            DefaultMaleImage={DefaultMaleImage}
            DefaultFemaleImage={DefaultFemaleImage}
          />
          <div className="active-list">
            {typingIndicator && (
              <div className="typing-indicator">{typingIndicator}</div>
            )}
            {speechIndicator && (
              <div className="typing-indicator">{speechIndicator}</div>
            )}
            {isThinking && (
              <div className="typing-indicator">
                {t('aiTypingIndicator')}
              </div>
            )}
          </div>
        </div>
        <Form className="message-form">
          <Form.Group>
            <Form.Check // prettier-ignore
              type="radio"
              className="message-ai"
              name="ai-options"
              label={t('ask_from_ai')}
              checked={isAiEnabled}
              onChange={handleAiCheckboxChange}
              value="ai"
            />
            <Form.Check // prettier-ignore
              type="radio"
              className="generate-image-ai"
              name="ai-options"
              label={t('generate_image')}
              checked={isGenerateEnabled}
              onChange={handleGenerateCheckboxChange}
              value="generate-image"
            />
          </Form.Group>
          <Form.Group style={{ position: "relative" }}>
            <Form.Control
              as="textarea"
              className="message-input"
              placeholder={t('box')}
              value={
                showModal || showCaptureModal || showCaptureVideoShowModal
                  ? ""
                  : message
              }
              // value={message}
              onChange={handleTyping}
              style={{ height: "auto", minHeight: "50px" }}
            />
            <CloseButton
              onClick={clearMessage}
              style={{
                position: "absolute",
                top: "10px",
                right: "20px",
                color: "white",
              }}
            />
          </Form.Group>
          <Button variant="primary" onClick={submitMessage}>
            {t('send')}
          </Button>
          {/* Upload PDF Button */}
          <Button
            className="upload-pdf-button"
            variant="primary"
            onClick={() => fileInputRef.current.click()}
          >
            {t('upload_pdf')}
          </Button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handlePdfChange}
            style={{ display: "none" }}
          />
        </Form>
      </div>
      {/* ROHTO Prompt Overlay */}
      <Offcanvas
        show={showPromptOverlay}
        onHide={() => setShowPromptOverlay(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>ROHTO AI Prompt</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('rohto_role_label')}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t('rohto_role_placeholder')}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('rohto_problem_label')}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder={t('rohto_problem_placeholder')}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('rohto_history_label')}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder={t('rohto_history_placeholder')}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('rohto_goal_label')}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t('rohto_goal_placeholder')}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('rohto_expectation_label')}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={expectation}
                onChange={(e) => setExpectation(e.target.value)}
                placeholder={t('rohto_expectation_placeholder')}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {t('upload_image_with_message')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="message-upload-modal">
          {/* Add your content for image upload and message input here */}
          {/* For simplicity, I'll provide a basic form */}

          <form className="upload-form">
            <input
              type="file"
              id="upload-input"
              className="message-file-selector"
              // onChange={(e) => setSelectedFile(e.target.files[0])}
              onChange={handleFileChange}
            />{" "}
            {/* Input for image upload */}
            <label
              htmlFor="upload-input"
              className={`message-file-button ${highlight.button ? "highlight" : ""
                }`}
            >
              {t('browse')}
            </label>
            {imageUploading && (
              <img className="imageUpload" alt="" src={imageUploading} />
            )}
            <textarea
              name="message"
              value={message}
              placeholder={t('enter_your_message')}
              className={`message-textarea ${highlight.textarea ? "highlight" : ""
                }`}
              onChange={handleTyping}
            />
            <br />
            {error && (
              <div
                className="error-message"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}
            <button className="message-upload-button" onClick={handleUpload}>
              {t('upload')}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCaptureModal} onHide={handleCaptureCloseModal}>
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {t('capture_image_with_message')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="message-upload-modal">
          {/* Add your content for image upload and message input here */}
          {/* For simplicity, I'll provide a basic form */}
          <Webcam
            className="Webcam-message"
            forceScreenshotSourceSize
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 1920, height: 1080 }}
          />
          <button
            className={`message-file-button ${highlight.button ? "highlight" : ""
              }`}
            onClick={capture}
          >
            {t('capturePhoto')}
          </button>
          {imageSrc && <img className="Webcam-message" alt="" src={imageSrc} />}
          <form className="upload-form">
            <textarea
              name="message"
              value={message}
              placeholder={t('enter_your_message')}
              className={`message-textarea ${highlight.textarea ? "highlight" : ""
                }`}
              onChange={handleTyping}
            />
            <br />
            {error && (
              <div
                className="error-message"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}
            <button className="message-upload-button" onClick={uploadCapture}>
              {t('upload')}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCaptureCloseModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showCaptureVideoShowModal}
        onHide={handleCaptureVideoCloseModal}
      >
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {t('capture_video_with_message')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="message-upload-modal">
          {/* Add your content for image upload and message input here */}
          {/* For simplicity, I'll provide a basic form */}
          <Webcam
            className="Webcam-message"
            forceScreenshotSourceSize
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 1920, height: 1080 }}
          />
          {!isCapturingVideo ? (
            <button
              className={`Webcam-button startVideo ${highlight.button ? "highlight" : ""
                }`}
              onClick={startVideoCapture}
            >
              {t('start_video')}
            </button>
          ) : (
            <button
              className="Webcam-button stopVideo"
              onClick={stopVideoCapture}
            >
              {t('stop_video')}
            </button>
          )}
          <div>
            {t('duration')}: {formatDuration(videoDuration)}
          </div>
          {imageVideoSrc && (
            <img className="Webcam-message" alt="" src={imageVideoSrc} />
          )}
          <form className="upload-form">
            <textarea
              name="message"
              value={message}
              placeholder={t('enter_your_message')}
              className={`message-textarea ${highlight.textarea ? "highlight" : ""
                }`}
              onChange={handleTyping}
            />
            <br />
            {error && (
              <div
                className="error-message"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}
            <button className="message-upload-button" onClick={uploadVideo}>
              {t('upload')}
            </button>
          </form>
          <div style={{ marginTop: "10px" }}>
            <progress value={uploadProgress} max="100"></progress>
            <p>Uploading: {uploadProgress}%</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCaptureVideoCloseModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showRecordAudioShowModal}
        onHide={handleRecordAudioCloseModal}
      >
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {t('speech_to_text')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="message-upload-modal">
          <AudioRecorder
            fetchMessages={fetchMessages}
            isThinking={isThinking}
            setIsThinking={setIsThinking}
            setSpeechIndicator={setSpeechIndicator}
            sendSpeechStatus={sendSpeechStatus}
          />
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleRecordAudioCloseModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PusherChat;
