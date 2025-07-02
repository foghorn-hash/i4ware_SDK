import React, { useState, useRef, useEffect } from "react";
import "./AudioRecorder.css";
import RecordRTC from "recordrtc";
import Axios from "axios";
import WaveSurfer from "wavesurfer.js";
import { Circle, Mic } from "react-bootstrap-icons";
import Form from "react-bootstrap/Form";
import {
  API_BASE_URL,
  ACCESS_USER_DATA,
  ACCESS_TOKEN_NAME,
  API_DEFAULT_LANGUAGE,
} from "../../constants/apiConstants"; // Assuming you have ACCESS_TOKEN_NAME defined
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    ask_from_ai: "Ask from AI",
    waveform: "Waveform",
    volume: "Volume Level Meter",
    male: "Male",
    female: "Female",
    generate_image: "Generate Image",
  },
  fi: {
    ask_from_ai: "Kysy tekoälyltä",
    waveform: "Ääniraita",
    volume: "Äänenvoimakkuusmittari",
    male: "Mies",
    female: "Nainen",
    generate_image: "Luo kuva",
  },
  sv: {
    ask_from_ai: "Fråga en AI",
    waveform: "ljudspår",
    volume: "ljudvolym",
    male: "Man",
    female: "Kvinna",
    generate_image: "Generera bild",
  },
});

const AudioRecorder = ({
  fetchMessages,
  setSpeechIndicator,
  sendSpeechStatus,
  setIsThinking,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isGenerateEnabled, setIsGenerateEnabled] = useState(false); // State to track AI checkbox
  const [gender, setGender] = useState("male");
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const meterRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search.substring(1));
  const localization = urlParams.get("lang") || API_DEFAULT_LANGUAGE;
  strings.setLanguage(localization);

  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ddd",
        progressColor: "#ff5500",
        responsive: true,
      });
      wavesurfer.current.load(URL.createObjectURL(audioBlob));
    }
  }, [audioBlob]);

  const handleChatGPTResponse = async (responseText) => {
    //console.log("Received response from ChatGPT:", responseText);
    if (isAiEnabled) {
      sendSpeechStatus(false);
      setSpeechIndicator("");
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
      await generateResponse(responseText);
    } else if (isGenerateEnabled) {
      sendSpeechStatus(false);
      setSpeechIndicator("");
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
      await generateImage(responseText);
    }
    fetchMessages();
  };

  const startRecording = async () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const newRecorder = RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/mp3",
        });
        newRecorder.startRecording();
        setRecorder(newRecorder);
        setIsRecording(true);
        mediaStreamRef.current = stream;
        setupAudioLevelMeter(stream);
        sendSpeechStatus(true);
      })
      .catch((err) => {
        console.error("Error accessing microphone", err);
      });
  };

  const setupAudioLevelMeter = (stream) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const drawMeter = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      if (meterRef.current) {
        meterRef.current.value = average;
      }
      animationFrameIdRef.current = requestAnimationFrame(drawMeter);
    };

    drawMeter();
  };

  const generateResponse = async (message) => {
    try {
      const response = await Axios.post(
        `${API_BASE_URL}/api/chat/generate-response`,
        { prompt: message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
          },
        }
      );
      const aiResponseMessage = {
        username: "AI",
        message: response.data.response,
        generate: false,
        gender,
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
      fetchMessages();
    } catch (error) {
      console.error("Error generating AI response:", error);
    }
  };

  const generateImage = async (message) => {
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
      console.log("Message saved to database successfully:", message);
      fetchMessages();
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

  const stopRecording = () => {
    recorder.stopRecording(async () => {
      const blob = recorder.getBlob();
      const audioUrl = URL.createObjectURL(blob);
      audioRef.current.src = audioUrl;
      setAudioBlob(blob);
      //console.log("Blob type:", blob.type);

      // Send the audio file to the backend
      const formData = new FormData();
      formData.append("audio", blob, "recording.mp3");
      formData.append("gender", gender); // Append gender to the form data

      await Axios.post(`${API_BASE_URL}/api/chat/stt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      })
        .then((response) => {
          //console.log("Transcription result:", response.data.transcription);
          const msg = response.data.message;
          handleChatGPTResponse(msg.message);
          sendSpeechStatus(false);
          setSpeechIndicator("");
        })
        .catch((error) => {
          console.error("Error uploading audio file:", error);
        });

      setIsRecording(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    });
  };

  const handleAiCheckboxChange = (e) => {
    setIsAiEnabled(e.target.checked);
    if (e.target.checked) setIsGenerateEnabled(false); // Uncheck the other option
  };

  const handleGenerateCheckboxChange = (e) => {
    setIsGenerateEnabled(e.target.checked);
    if (e.target.checked) setIsAiEnabled(false); // Uncheck the other option
  };

  return (
    <div>
      <audio className="audio-recorded" ref={audioRef} controls />
      <div className="audio-recorder-clear" />
      <strong>{strings.waveform}</strong>
      <div ref={waveformRef} className="audio-waveform" />
      <div className="audio-recorder-clear" />
      <strong>{strings.volume}</strong>
      <progress ref={meterRef} max="255" value="0" className="audio-meter" />
      <div className="audio-recorder-clear" />
      <button
        className="audio-recorder-button"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? <Circle /> : <Mic />}
      </button>
      <div className="audio-recorder-clear" />
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
      <div className="audio-recorder-clear" />
      <select
        className="select-gender"
        id="gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="male">{strings.male}</option>
        <option value="female">{strings.female}</option>
      </select>
    </div>
  );
};

export default AudioRecorder;
