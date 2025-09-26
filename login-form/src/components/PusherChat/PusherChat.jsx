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
  API_DEFAULT_LANGUAGE,
  API_PUSHER_KEY,
  API_PUSHER_CLUSTER,
} from "../../constants/apiConstants";
import LocalizedStrings from "react-localization";
import { CloseButton } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";

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
    your_browser_not_support_video_tag:
      "Your browser does not support the video tag.",
    aiTypingIndicator: "AI is thinking...",
    record_audio: "Record Audio",
    speech: "is recoding speech...",
    please_capture_image: "Please capture an image to upload",
    please_capture_video: "Please capture a video to upload",
    please_write_message: "Please write a message to send",
    generate_image: "Generate Image",
    // ROHTO engineering form fields
    rohto_role_label: "Role (who am I / who am I asking you to be?)",
    rohto_role_placeholder:
      "E.g. 'Act as an AI assistant' or 'I am a lawyer...'",
    rohto_problem_label: "Instructions (what are the instructions?)",
    rohto_problem_placeholder: "Describe your instructions or question",
    rohto_history_label: "Notes (what are your observations?)",
    rohto_history_placeholder:
      "Break the task into clear steps to clarify the answer",
    rohto_goal_label: "Goal (what do you want to achieve?)",
    rohto_goal_placeholder: "Describe what you hope as a result",
    rohto_expectation_label: "Relevance (what kind of answer do you expect?)",
    rohto_expectation_placeholder:
      "Specify what you want it to address and what to leave out",
    rohto_for_prompt: "My question is",
    rohto_disable: "Disable ROHTO",
    rohto_enable: "Enable ROHTO",
    upload_pdf: "Upload PDF",
    upload_failure: "Upload Failure",
    pdf_upload_failure: "Failed to upload PDF. Please try again.",
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
    failed_to_upload_file:
      "Tiedoston lataus epäonnistui. Olehyvä ja yritä uudestaan.",
    your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
    aiTypingIndicator: "Tekoäly miettii ...",
    record_audio: "Näuhoita ääni",
    speech: "nauhoittaa puhetta...",
    please_capture_image: "Olehyvä ja kaappaa kuva ladataksesi",
    please_capture_video: "Olehyvä ja kaappaa video ladataksesi",
    please_write_message: "Olehyvä ja kirjoita viesti lähettääksesi",
    generate_image: "Luo kuva",
    // ROHTO engineering form fields
    rohto_role_label: "Rooli (kuka minä olen / ketä pyydän olemaan?)",
    rohto_role_placeholder:
      "Esim. 'Toimi tekoälyavustajana' tai 'Olen lakimies...'",
    rohto_problem_label: "Ohjeet (mitkä ovat ohjeet?)",
    rohto_problem_placeholder: "Kuvaa ohjeesi tai kysymyksesi",
    rohto_history_label: "Huomiot (mitkä ovat huomiosi?)",
    rohto_history_placeholder:
      "Jaa tehtävä selkeisiin vaiheisiin vastauksen selkeyttämiseksi",
    rohto_goal_label: "Tavoite (mitä haluat saavuttaa?)",
    rohto_goal_placeholder: "Kerro mitä toivot tulokseksi",
    rohto_expectation_label: "Osuvuus (millaista vastausta odotat?)",
    rohto_expectation_placeholder:
      "Tarkenna mitä haluat sen käsittelevän ja jättävän pois",
    rohto_for_prompt: "Kysymykseni on",
    rohto_disable: "Poista ROHTO käytöstä",
    rohto_enable: "Ota ROHTO käyttöön",
    upload_pdf: "Lataa PDF",
    upload_failure: "Lataus epäonnistui",
    pdf_upload_failure: "PDF:n lataus epäonnistui. Ole hyvä ja yritä uudestaan.",
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
    your_browser_not_support_video_tag:
      "Din webbläsare stöder inte videomarkeringen.",
    aiTypingIndicator: "AI tänker ...",
    record_audio: "Spela in ljud",
    speech: "spela in tal...",
    please_capture_image: "Vänligen ta en bild för att ladda upp",
    please_capture_video: "Vänligen ta en video för att ladda upp",
    please_write_message: "Vänligen skriv ett meddelande att skicka",
    generate_image: "Generera bild",
    // ROHTO engineering form fields
    rohto_role_label: "Roll (vem är jag / vem ber jag dig vara?)",
    rohto_role_placeholder:
      "T.ex. 'Agera som AI-assistent' eller 'Jag är jurist...'",
    rohto_problem_label: "Instruktioner (vilka är instruktionerna?)",
    rohto_problem_placeholder: "Beskriv dina instruktioner eller din fråga",
    rohto_history_label: "Anteckningar (vilka är dina observationer?)",
    rohto_history_placeholder:
      "Dela upp uppgiften i tydliga steg för att förtydliga svaret",
    rohto_goal_label: "Mål (vad vill du uppnå?)",
    rohto_goal_placeholder: "Beskriv vad du hoppas som resultat",
    rohto_expectation_label: "Relevans (vilket slags svar förväntar du dig?)",
    rohto_expectation_placeholder:
      "Specificera vad du vill att det ska ta upp och vad som ska utelämnas",
    rohto_for_prompt: "Min fråga är",
    rohto_disable: "Inaktivera ROHTO",
    rohto_enable: "Aktivera ROHTO",
    upload_pdf: "Ladda upp PDF",
    upload_failure: "Uppladdning misslyckades",
    pdf_upload_failure: "Misslyckades med att ladda upp PDF. Försök igen.",
  },
});

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

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

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
    formData.append("message", message);

    try {

      const responseSubmit = await Axios.post(
        `${API_BASE_URL}/api/chat/messages`,
        { username, message, type: null },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
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
          title: strings.upload_successful,
          text: strings.image_upload_successful,
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
          title: strings.upload_failure,
          text: strings.pdf_upload_failure,
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

  // Initialize Pusher and fetch initial messages
  useEffect(() => {
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
        setTypingIndicator(`${typingUsername} ${strings.typing}`);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingIndicator("");
        }, 1000);
      }
    });

    channel.bind("user-speech", ({ username: speechUsername, isSpeech }) => {
      if (isSpeech) {
        setSpeechIndicator(`${speechUsername} ${strings.speech}`);
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
    // ✅ Filter out messages already in state by `id`
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
        title: strings.upload_successful,
        text: strings.image_upload_successful,
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(strings.failed_to_upload_file);
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
        title: strings.upload_successful,
        text: strings.capture_successful,
      }).then((result) => {
        if (result.isConfirmed) {
          fetchMessages();
        }
      });
    } catch (error) {
      console.error("Error uploading image", error);
      setError(strings.failed_to_upload_file);
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
            title: strings.upload_successful,
            text: strings.video_capture_successful,
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
      ${strings.rohto_role_label}: ${role}
      ${strings.rohto_problem_label}: ${problem}
      ${strings.rohto_history_label}: ${history}
      ${strings.rohto_goal_label}: ${goal}
      ${strings.rohto_expectation_label}: ${expectation}
      ${strings.rohto_for_prompt}: ${message}
    `.trim();
    } else {
      // If ROHTO is disabled, just send the message as the prompt
      fullPrompt = message;
    }
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/generate-response`,
        { prompt: fullPrompt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      // 1. Generate the Word file in backend
      const resp = await Axios.post(
        `${API_BASE_URL}/api/chat/word/send`,
        { prompt: fullPrompt, generate: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      // Optionally, save the message to DB as before
      const highHTML = resp.data.message;
      const aiResponseMessage = {
        username: "AI",
        generate: false,
        message: highHTML,
        created_at: new Date().toISOString(),
        filename: resp.data.filename || "generated.docx", // Assuming backend returns a filename
        type: "docx",
      };
      await saveMessageToDatabase(aiResponseMessage, "docx");
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

  const generateImage = async () => {
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/generate-image`,
        { prompt: message, generate: true },
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
          label={isRohtoEnabled ? strings.rohto_disable : strings.rohto_enable}
          checked={isRohtoEnabled}
          onChange={toggleRohto}
          style={{ float: "right", marginRight: 10, marginBottom: 10 }}
        />
        <Button
          variant="primary"
          className="message-upload-button"
          onClick={handleShowModal}
        >
          <Upload /> {strings.upload_image_with_message}
        </Button>
        <Button
          variant="primary"
          className="message-capture-button"
          onClick={handleCaptureShowModal}
        >
          <Camera /> {strings.capture_image_with_message}
        </Button>
        <Button
          variant="primary"
          className="message-capture-video-button"
          onClick={handleCaptureVideoShowModal}
        >
          <CameraVideo /> {strings.capture_video_with_message}
        </Button>
        <Button
          variant="primary"
          className="message-record-audio-button"
          onClick={handleRecordAudioShowModal}
        >
          <Mic /> {strings.speech_to_text}
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
                {strings.aiTypingIndicator}
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
          <Form.Group style={{ position: "relative" }}>
            <Form.Control
              as="textarea"
              className="message-input"
              placeholder={strings.box}
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
            {strings.send}
          </Button>
          {/* Upload PDF Button */}
            <Button
              className="upload-pdf-button"
              variant="primary"
              onClick={() => fileInputRef.current.click()}
            >
              {strings.upload_pdf}
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
              <Form.Label>{strings.rohto_role_label}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={strings.rohto_role_placeholder}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{strings.rohto_problem_label}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder={strings.rohto_problem_placeholder}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{strings.rohto_history_label}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder={strings.rohto_history_placeholder}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{strings.rohto_goal_label}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={strings.rohto_goal_placeholder}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{strings.rohto_expectation_label}</Form.Label>
              <Form.Control
                className="prompt-textarea"
                as="textarea"
                value={expectation}
                onChange={(e) => setExpectation(e.target.value)}
                placeholder={strings.rohto_expectation_placeholder}
                disabled={!isRohtoEnabled}
              />
            </Form.Group>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {strings.upload_image_with_message}
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
              className={`message-file-button ${
                highlight.button ? "highlight" : ""
              }`}
            >
              {strings.browse}
            </label>
            {imageUploading && (
              <img className="imageUpload" alt="" src={imageUploading} />
            )}
            <textarea
              name="message"
              value={message}
              placeholder={strings.enter_your_message}
              className={`message-textarea ${
                highlight.textarea ? "highlight" : ""
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
              {strings.upload}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCloseModal}>
            {strings.close}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCaptureModal} onHide={handleCaptureCloseModal}>
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {strings.capture_image_with_message}
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
            className={`message-file-button ${
              highlight.button ? "highlight" : ""
            }`}
            onClick={capture}
          >
            {strings.capturePhoto}
          </button>
          {imageSrc && <img className="Webcam-message" alt="" src={imageSrc} />}
          <form className="upload-form">
            <textarea
              name="message"
              value={message}
              placeholder={strings.enter_your_message}
              className={`message-textarea ${
                highlight.textarea ? "highlight" : ""
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
              {strings.upload}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCaptureCloseModal}>
            {strings.close}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showCaptureVideoShowModal}
        onHide={handleCaptureVideoCloseModal}
      >
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {strings.capture_video_with_message}
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
              className={`Webcam-button startVideo ${
                highlight.button ? "highlight" : ""
              }`}
              onClick={startVideoCapture}
            >
              {strings.start_video}
            </button>
          ) : (
            <button
              className="Webcam-button stopVideo"
              onClick={stopVideoCapture}
            >
              {strings.stop_video}
            </button>
          )}
          <div>
            {strings.duration}: {formatDuration(videoDuration)}
          </div>
          {imageVideoSrc && (
            <img className="Webcam-message" alt="" src={imageVideoSrc} />
          )}
          <form className="upload-form">
            <textarea
              name="message"
              value={message}
              placeholder={strings.enter_your_message}
              className={`message-textarea ${
                highlight.textarea ? "highlight" : ""
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
              {strings.upload}
            </button>
          </form>
          <div style={{ marginTop: "10px" }}>
            <progress value={uploadProgress} max="100"></progress>
            <p>Uploading: {uploadProgress}%</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="message-upload-modal">
          <Button variant="secondary" onClick={handleCaptureVideoCloseModal}>
            {strings.close}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showRecordAudioShowModal}
        onHide={handleRecordAudioCloseModal}
      >
        <Modal.Header className="message-upload-modal" closeButton>
          <Modal.Title className="massage-upload-title">
            {strings.speech_to_text}
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
            {strings.close}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PusherChat;
