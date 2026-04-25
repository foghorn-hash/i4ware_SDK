<template>
  <div>
    <audio class="audio-recorded" ref="audioEl" controls />
    <div class="audio-recorder-clear" />

    <strong>{{ t('waveform') }}</strong>
    <div ref="waveformEl" class="audio-waveform" />
    <div class="audio-recorder-clear" />

    <strong>{{ t('volume') }}</strong>
    <progress ref="meterEl" max="255" value="0" class="audio-meter" />
    <div class="audio-recorder-clear" />

    <button class="audio-recorder-button" @click="isRecording ? stopRecording() : startRecording()">
      <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        <rect x="8" y="8" width="8" height="8"/>
      </svg>
    </button>

    <div class="audio-recorder-clear" />

    <div>
      <input type="radio" name="ai-options" id="ask-ai" value="ai"
        :checked="isAiEnabled" @change="handleAiChange" />
      <label for="ask-ai" class="ms-1 message-ai">{{ t('ask_from_ai') }}</label>
    </div>
    <div>
      <input type="radio" name="ai-options" id="generate-image" value="generate-image"
        :checked="isGenerateEnabled" @change="handleGenerateChange" />
      <label for="generate-image" class="ms-1 generate-image-ai">{{ t('generate_image') }}</label>
    </div>

    <div class="audio-recorder-clear" />

    <select class="select-gender" v-model="gender">
      <option value="male">{{ t('male') }}</option>
      <option value="female">{{ t('female') }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import RecordRTC from 'recordrtc';
import WaveSurfer from 'wavesurfer.js';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const props = defineProps({
  fetchMessages:     { type: Function, required: true },
  setSpeechIndicator:{ type: Function, required: true },
  sendSpeechStatus:  { type: Function, required: true },
  setIsThinking:     { type: Function, required: true },
});

const { t } = useI18n();

const isRecording    = ref(false);
const isAiEnabled    = ref(false);
const isGenerateEnabled = ref(false);
const gender         = ref('male');
const audioBlob      = ref(null);

const audioEl    = ref(null);
const waveformEl = ref(null);
const meterEl    = ref(null);

let recorder = null;
let wavesurfer = null;
let audioContext = null;
let mediaStream = null;
let animationFrameId = null;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

// Rebuild waveform when audioBlob changes
watch(audioBlob, (blob) => {
  if (!blob || !waveformEl.value) return;
  if (wavesurfer) wavesurfer.destroy();
  wavesurfer = WaveSurfer.create({
    container: waveformEl.value,
    waveColor: '#ddd',
    progressColor: '#ff5500',
    responsive: true,
  });
  wavesurfer.load(URL.createObjectURL(blob));
});

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = RecordRTC(stream, { type: 'audio', mimeType: 'audio/mp3' });
    recorder.startRecording();
    isRecording.value = true;
    mediaStream = stream;
    setupAudioLevelMeter(stream);
    props.sendSpeechStatus(true);
  } catch (err) {
    console.error('Error accessing microphone', err);
  }
};

const setupAudioLevelMeter = (stream) => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  source.connect(analyser);

  const drawMeter = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    if (meterEl.value) meterEl.value.value = average;
    animationFrameId = requestAnimationFrame(drawMeter);
  };
  drawMeter();
};

const stopRecording = () => {
  recorder.stopRecording(async () => {
    const blob = recorder.getBlob();
    audioEl.value.src = URL.createObjectURL(blob);
    audioBlob.value = blob;

    const formData = new FormData();
    formData.append('audio', blob, 'recording.mp3');
    formData.append('gender', gender.value);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/stt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      });
      const msg = response.data.message;
      await handleChatGPTResponse(msg.message);
      props.sendSpeechStatus(false);
      props.setSpeechIndicator('');
    } catch (err) {
      console.error('Error uploading audio:', err);
    }

    isRecording.value = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (audioContext) audioContext.close();
    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
  });
};

const handleChatGPTResponse = async (responseText) => {
  if (isAiEnabled.value) {
    props.sendSpeechStatus(false);
    props.setSpeechIndicator('');
    props.setIsThinking(true);
    await axios.post(`${API_BASE_URL}/api/chat/thinking`,
      { username: 'AI', isThinking: true }, { headers: authHeaders() });
    await generateResponse(responseText);
  } else if (isGenerateEnabled.value) {
    props.sendSpeechStatus(false);
    props.setSpeechIndicator('');
    props.setIsThinking(true);
    await axios.post(`${API_BASE_URL}/api/chat/thinking`,
      { username: 'AI', isThinking: true }, { headers: authHeaders() });
    await generateImage(responseText);
  }
  props.fetchMessages();
};

const generateResponse = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/generate-response`,
      { prompt: message }, { headers: authHeaders() });
    await saveMessage({ username: 'AI', message: response.data.response,
      generate: false, gender: gender.value, created_at: new Date().toISOString() });
    props.setIsThinking(false);
    await axios.post(`${API_BASE_URL}/api/chat/thinking`,
      { username: 'AI', isThinking: false }, { headers: authHeaders() });
    props.fetchMessages();
  } catch (err) {
    console.error('Error generating AI response:', err);
  }
};

const generateImage = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/generate-image`,
      { prompt: message, generate: true }, { headers: authHeaders() });
    await saveMessage({ username: 'AI', generate: true,
      message: response.data.response, created_at: new Date().toISOString() });
    props.setIsThinking(false);
    await axios.post(`${API_BASE_URL}/api/chat/thinking`,
      { username: 'AI', isThinking: false }, { headers: authHeaders() });
    props.fetchMessages();
  } catch (err) {
    console.error('Error generating image:', err);
    props.setIsThinking(false);
  }
};

const saveMessage = async (message) => {
  try {
    await axios.post(`${API_BASE_URL}/api/chat/save-message`, message, { headers: authHeaders() });
    props.fetchMessages();
  } catch (err) {
    console.error('Error saving message:', err);
  }
};

const handleAiChange = (e) => {
  isAiEnabled.value = e.target.checked;
  if (e.target.checked) isGenerateEnabled.value = false;
};

const handleGenerateChange = (e) => {
  isGenerateEnabled.value = e.target.checked;
  if (e.target.checked) isAiEnabled.value = false;
};

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (audioContext) audioContext.close();
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
  if (wavesurfer) wavesurfer.destroy();
});
</script>