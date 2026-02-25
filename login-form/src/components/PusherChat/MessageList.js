import React, { useEffect, useState, useRef } from "react";
import {
  API_BASE_URL,
  ACCESS_TOKEN_NAME,
} from "../../constants/apiConstants";
import Axios from "axios";
import HighlightedResponse from "./HighlightedResponse";
import { PlayFill, StopFill, Download } from "react-bootstrap-icons";
import CustomModal from "./CustomModal"; // Import the custom modal component
import { Virtuoso } from "react-virtuoso";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

let currentDate;
let prevDate;

const MessageList = ({
  messages,
  DefaultMaleImage,
  DefaultFemaleImage,
  // loadMore,
  hasMore,
  loadingOlder,
  // isLoading,
  virtuosoRef,
  firstItemIndex, // for two-way loading
  loadOlderMessages,
  //loadNewerMessages,
}) => {
  const messagesEndRef = useRef(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(<></>); // Initialize to an empty React fragment
  const [isVideo, setIsVideo] = useState(false); // Track if the modal content is a video


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  const processedMessages = Array.isArray(messages)
    ? [...messages].map((msg) => {
      const profilePicUrl = msg.profile_picture_path
        ? `${API_BASE_URL}${msg.profile_picture_path.replace(
          "public/uploads",
          "/storage/uploads"
        )}`
        : null;
      const defaultImg =
        msg.gender === "male" ? DefaultMaleImage : DefaultFemaleImage;

      return {
        ...msg,
        profilePicUrl,
        defaultImg,
      };
    })
    : [];

  const handleImageClick = (content, isVideoContent) => {
    setModalContent(content);
    setIsVideo(isVideoContent);
    setIsModalOpen(true);
  };

  const renderMessageImageOrVideo = (msg) => {
    if (msg.image_path) {
      const imageUrl = API_BASE_URL + "/" + msg.image_path;
      if (msg.type === "image") {
        return (
          <>
            <br />
            <br />
            <img
              src={imageUrl}
              className="message-image"
              alt="Uploaded"
              onClick={() =>
                handleImageClick(
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />,
                  false
                )
              }
            />
          </>
        );
      } else {
        return (
          <>
            <br />
            <br />
            <video
              className="Webcam-video"
              style={{ cursor: "pointer" }}
              onClick={() =>
                handleImageClick(
                  <video
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    controls={false}
                  >
                    <source src={imageUrl} type="video/mp4" />
                    {t('your_browser_not_support_video_tag')}
                  </video>,
                  true
                )
              }
            >
              <source src={imageUrl} type="video/mp4" />
              {t('your_browser_not_support_video_tag')}
            </video>
          </>
        );
      }
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [currentAudioUrl]);

  const handleToggleSpeech = async (text, gender, messageId) => {
    if (currentMessageId === messageId) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentMessageId(null);
        setCurrentAudio(null);
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      setCurrentMessageId(null);
      setCurrentAudio(null);
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        setCurrentAudioUrl(null);
      }
    }

    let voice;
    switch (gender) {
      case "male":
        voice = "onyx";
        break;
      case "female":
        voice = "shimmer";
        break;
      default:
        voice = "nova";
    }

    try {
      // Always set loading state to ensure animation shows
      setLoadingMessageId(messageId);

      // Ensure minimum loading duration for consistent UX
      const minLoadingTime = 800; // milliseconds
      const startTime = Date.now();

      const response = await Axios.post(
        API_BASE_URL + "/api/chat/tts",
        { text, voice, message_id: messageId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch audio data");
      }

      // Remove leading slash if present to avoid double slashes
      const urlPath = response.data.url.startsWith('/') ? response.data.url.substring(1) : response.data.url;
      const audioUrl = API_BASE_URL + "/" + urlPath;
      const audio = new Audio(audioUrl);

      // Add error handling for audio loading
      audio.onerror = (e) => {
        console.error("Audio failed to load:", audioUrl, e);
      };

      audio.play().catch(error => {
        console.error("Audio play failed:", error);
      });
      setCurrentAudio(audio);
      setCurrentMessageId(messageId);
      setCurrentAudioUrl(audioUrl);

      // Calculate remaining time to reach minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Wait for minimum loading time before clearing loading state
      setTimeout(() => {
        setLoadingMessageId(null);

        audio.play();
        setCurrentAudio(audio);
        setCurrentMessageId(messageId);
        setCurrentAudioUrl(audioUrl);

        audio.onended = () => {
          setCurrentMessageId(null);
          setCurrentAudio(null);
          setCurrentAudioUrl(null);
        };
      }, remainingTime);

    } catch (error) {
      console.error("Error generating speech:", error);
      // Clear loading state on error after minimum time
      setTimeout(() => {
        setLoadingMessageId(null);
      }, 500);
    }
  };

  const checkDate = (currentDate) => {
    if (currentDate !== prevDate) {
      prevDate = currentDate;
      return currentDate;
    } else {
      return null;
    }
  };
  return (
    //console.log("Processed Message: ", processedMessages),
    <div className="messages-list">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: "500px" }}
        data={processedMessages} // Already sorted ASC from backend or .reverse() once
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={messages.length - 1}
        //startReached={loadOlderMessages} // Scroll up to load older
        followOutput="auto"
        components={{
          Header: () => {
            if (!hasMore) return null;
            return (
              <div
                style={{
                  textAlign: "center",
                  padding: "5px",
                }}
              >
                <Button
                  variant="outline-secondary"
                  onClick={loadOlderMessages}
                  disabled={loadingOlder || !hasMore}
                >
                  {loadingOlder
                    ? "Loading..."
                    : hasMore
                      ? "Load older messages"
                      : "No More Messages"}
                </Button>
              </div>
            );
          },
        }}
        itemContent={(index, msg) => {
          return (
            // Render each message
            // Check if the date has changed to display the date line
            <div key={index} className="message">
              <div className="date-line">
                {checkDate(
                  new Date(msg.formatted_created_at).toLocaleDateString()
                )}
              </div>

              <div className="message-date">
                <strong>{msg.username}: </strong>
                <i>{new Date(msg.formatted_created_at).toLocaleTimeString()}</i>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className={`message-TTS ${loadingMessageId === msg.id ? 'tts-loading' : ''} ${currentMessageId === msg.id ? 'tts-playing' : ''}`}
                    onClick={() =>
                      handleToggleSpeech(msg.message, msg.gender, msg.id)
                    }
                    disabled={loadingMessageId === msg.id}
                  >
                    {currentMessageId === msg.id ? (
                      <StopFill />
                    ) : (
                      <PlayFill />
                    )}
                  </button>
                  {currentMessageId === msg.id && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="classic-spinner"
                    >
                      <line x1="12" y1="2" x2="12" y2="6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-1" />
                      <line x1="18.36" y1="5.64" x2="15.54" y2="8.46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-2" />
                      <line x1="22" y1="12" x2="18" y2="12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-3" />
                      <line x1="18.36" y1="18.36" x2="15.54" y2="15.54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-4" />
                      <line x1="12" y1="22" x2="12" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-5" />
                      <line x1="5.64" y1="18.36" x2="8.46" y2="15.54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-6" />
                      <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-7" />
                      <line x1="5.64" y1="5.64" x2="8.46" y2="8.46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" className="spinner-line-8" />
                    </svg>
                  )}
                </div>
                {msg.download_link && (
                  <a
                    href={msg.download_link}
                    className="message-download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: "10px" }}
                  >
                    <Download />
                  </a>
                )}
              </div>
              <div className="massage-container">
                <img
                  src={msg.profilePicUrl || msg.defaultImg}
                  className="message-avatar"
                  alt={`Profile of ${msg.username}`}
                />
                <span>
                  <HighlightedResponse markdown={msg.message} />
                </span>
                {/* Render image if image_path is not null */}
                {renderMessageImageOrVideo(msg)}
                <div className="message-clear" />
              </div>
            </div>
          );
        }}
      />
      {/* Scroll to this ref to show the latest message */}
      <div ref={messagesEndRef} />

      <CustomModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        content={modalContent}
        isVideo={isVideo}
      />
    </div>
  );
};

export default MessageList;
