import React, { useEffect, useState, useRef } from "react";
import {
  API_BASE_URL,
  ACCESS_TOKEN_NAME,
  API_DEFAULT_LANGUAGE,
} from "../../constants/apiConstants";
import Axios from "axios";
import HighlightedResponse from "./HighlightedResponse";
import { PlayFill, StopFill, Download } from "react-bootstrap-icons";
import CustomModal from "./CustomModal"; // Import the custom modal component
import LocalizedStrings from "react-localization";
import { Modal, Button } from "react-bootstrap";
import { Pagination } from "react-bootstrap";

//let currentDate;
let prevDate;

let strings = new LocalizedStrings({
  en: {
    your_browser_not_support_video_tag:
      "Your browser does not support the video tag.",
    generateSpeech: "Generate Speech",
    stopSpeech: "Stop Speech",
  },
  fi: {
    your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
    generateSpeech: "Luo puhe",
    stopSpeech: "Pysäytä puhe",
  },
  sv: {
    your_browser_not_support_video_tag:
      "Din webbläsare stöder inte videomarkeringen.",
    generateSpeech: "Generera tal",
    stopSpeech: "Stoppa tal",
  },
});

const MessageList = ({ messages, DefaultMaleImage, DefaultFemaleImage }) => {
  const messagesEndRef = useRef(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(<></>); // Initialize to an empty React fragment
  const [isVideo, setIsVideo] = useState(false); // Track if the modal content is a video
  const [modalMessage, setModalMessage] = useState("");

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

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

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;
  // Calculate paginated messages
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const paginatedMessages = processedMessages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );
  // Total number of pages
  const totalPages = Math.ceil(processedMessages.length / messagesPerPage);

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
                    {strings.your_browser_does_not_support_video_tag}
                  </video>,
                  true
                )
              }
            >
              <source src={imageUrl} type="video/mp4" />
              {strings.your_browser_does_not_support_video_tag}
            </video>
          </>
        );
      }
    }
    return null;
  };

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  useEffect(() => {
    const container = document.querySelector(".messages-list");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

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

      const audioUrl = API_BASE_URL + "/" + response.data.url;
      const audio = new Audio(audioUrl);
      audio.play();
      setCurrentAudio(audio);
      setCurrentMessageId(messageId);
      setCurrentAudioUrl(audioUrl);

      audio.onended = () => {
        setCurrentMessageId(null);
        setCurrentAudio(null);
        setCurrentAudioUrl(null);
      };
    } catch (error) {
      console.error("Error generating speech:", error);
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
    <div className="messages-list">
      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />

            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {[...paginatedMessages]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .reverse()
        .map((msg, index) => {
          // Word count for message
          const wordCount = msg.message.trim().split(/\s+/).length;

          return (
            <div key={index} className="message">
              <div className="date-line">
                {checkDate(
                  new Date(msg.formatted_created_at).toLocaleDateString()
                )}
              </div>

              <div className="message-date">
                <strong>{msg.username}: </strong>
                <i>{new Date(msg.formatted_created_at).toLocaleTimeString()}</i>
                <button
                  className="message-TTS"
                  onClick={() =>
                    handleToggleSpeech(msg.message, msg.gender, msg.id)
                  }
                >
                  {currentMessageId === msg.id ? <StopFill /> : <PlayFill />}
                </button>
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
                )}{" "}
              </div>
              {/* ... other message content ... */}

              <div
                className="massage-container"
                style={{ position: "relative" }}
              >
                <img
                  src={msg.profilePicUrl || msg.defaultImg}
                  className="message-avatar"
                  alt={`Profile of ${msg.username}`}
                />
                <span>
                  <HighlightedResponse
                    markdown={
                      wordCount > 100
                        ? msg.message.split(/\s+/).slice(0, 100).join(" ") +
                          "..."
                        : msg.message
                    }
                  />
                </span>

                {wordCount > 100 && (
                  <span
                    onClick={() => {
                      setModalMessage(msg.message);
                      setIsModalOpen(true);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "10px",
                      color: "#007bff",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      textDecoration: "underline",
                    }}
                  >
                    See more
                  </span>
                )}

                {/* Render image or video if any */}
                {renderMessageImageOrVideo(msg)}
                <div className="message-clear" />
              </div>
            </div>
          );
        })}
      {/* Scroll to this ref to show the latest message */}
      <div ref={messagesEndRef} />

      <CustomModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        content={modalContent}
        isVideo={isVideo}
      />

      {/* Modal for long text */}
      <Modal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Body
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <HighlightedResponse markdown={modalMessage} />
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: "center" }}>
          <Button
            variant="danger"
            onClick={() => setIsModalOpen(false)}
            style={{ minWidth: "100px" }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessageList;
