import React, { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';
import Axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import { Circle, Mic } from 'react-bootstrap-icons';
import { API_BASE_URL, ACCESS_USER_DATA, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants"; // Assuming you have ACCESS_TOKEN_NAME defined
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: { 
    ask_from_ai: "Ask from AI",
    waveform: "Wavefrom",
    volume: "Volume Level Meter",
    male: "Male",
    female: "Female",
   },
  fi: { 
    ask_from_ai: "Kysy tekoälyltä",
    waveform: "Ääniraita",
    volume: "Äänenvoimakkuusmittari",
    male: "Mies",
    female: "Nainen",
  },
  se: { 
    ask_from_ai: "Fråga en AI",
    waveform: "ljudspår",
    volume: "ljudvolym",
    male: "Man",
    female: "Kvinna",
  }
});

const AudioRecorder = (props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const meterRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const [gender, setGender] = useState('male');

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const handleAiCheckboxChange = (e) => {
    setIsAiEnabled(e.target.checked);
  };

  const handleChatGPTResponse = (responseText) => {
    console.log('Received response from ChatGPT:', responseText);
    if (isAiEnabled) {
        props.sendSpeechStatus(false);
        props.setSpeechIndicator('');
        // Handle AI response (display in chat, etc.)
        props.setIsThinking(true);
        Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: true }, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
        });
        generateResponse(responseText);
    }
    props.fetchMessages();
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const newRecorder = RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/mp3',
      });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);
      mediaStreamRef.current = stream;
      setupAudioLevelMeter(stream);
      props.sendSpeechStatus(true);
    }).catch(err => {
      console.error('Error accessing microphone', err);
    });
  };

  const setupAudioLevelMeter = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
  
      const messgeForHighliht = response.data.response;
  
      const highlightedHTML = messgeForHighliht;
  
      // Create the AI response message object with highlighted message
      const aiResponseMessage = {
        username: 'AI',
        message: highlightedHTML, // Use the highlighted response
        gender: gender,
        created_at: new Date().toISOString(),
      };
  
      // Save the AI response message to the database
      await saveMessageToDatabase(aiResponseMessage);
  
      // Handle AI response (display in chat, etc.)
      props.setIsThinking(false);
      await Axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: "AI", isThinking: false }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
      });

      props.fetchMessages();

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
      props.fetchMessages();
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  const stopRecording = () => {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      const audioUrl = URL.createObjectURL(blob);
      audioRef.current.src = audioUrl;
      setAudioBlob(blob);

      // Send the audio file to the backend
      const formData = new FormData();
      formData.append('audio', blob, 'recording.mp3');
      formData.append('gender', gender); // Append gender to the form data

      Axios.post(`${API_BASE_URL}/api/chat/stt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      }).then(response => {
        console.log('Transcription result:', response.data.transcription);
        handleChatGPTResponse(response.data.transcription);
        props.sendSpeechStatus(false);
        props.setSpeechIndicator('');
      }).catch(error => {
        console.error('Error uploading audio file:', error);
      });

      setIsRecording(false);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    });
  };

  const handleChange = (event) => {
    setGender(event.target.value);
  };

  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ddd',
        progressColor: '#ff5500',
        responsive: true,
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      wavesurfer.current.load(audioUrl);
    }
  }, [audioBlob]);

  return (
    <div>
      <audio className='audio-recorded' ref={audioRef} controls />
      <div className='audio-recorder-clear' />
      <strong>{strings.waveform}</strong>
      <div ref={waveformRef} className='audio-waveform' />
      <div className='audio-recorder-clear' />
      <strong>{strings.volume}</strong>
      <progress ref={meterRef} max="255" value="0" className='audio-meter' />
      <div className='audio-recorder-clear' />
      <button className='audio-recorder-button' onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <Circle /> : <Mic />}
      </button>
      <div className='audio-recorder-clear' />
      {strings.ask_from_ai}
          <input
            type="checkbox"
            className="message-ai"
            name="ai"
            checked={isAiEnabled}
            onChange={handleAiCheckboxChange}
          />
          <div className='audio-recorder-clear' />
          <select className='select-gender' id="gender" value={gender} onChange={handleChange}>
            <option value="male">{strings.male}</option>
            <option value="female">{strings.female}</option>
          </select>
    </div>
  );
};

export default AudioRecorder;
