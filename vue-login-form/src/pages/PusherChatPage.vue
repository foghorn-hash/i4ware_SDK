<template>
  <div>
    <div class="chat-container">
      <!-- Realtime controls -->
      <div style="float: right; margin-right: 10px; margin-left: 10px;">
        <audio ref="remoteAudioRef" autoplay style="display: none;" />
        <span v-if="isRealtimeActive" style="margin-right: 10px; color: #dc3545; font-weight: bold;">
          🎤 {{ t('realtime_active') }}
        </span>
        <button
          :class="`btn ${isRealtimeActive ? 'btn-danger' : 'btn-success'}`"
          style="margin-right: 6px;"
          @click="isRealtimeActive ? stopRealtimeConversation() : startRealtimeConversation()"
        >
          {{ isRealtimeActive ? t('stop_realtime') : t('start_realtime') }}
        </button>
      </div>

      <button
        class="rohto-button btn btn-outline-secondary"
        style="float: right; margin-bottom: 10px;"
        :disabled="!isRohtoEnabled"
        @click="showPromptOverlay = true"
      >ROHTO</button>
      <div style="float: right; margin-right: 10px; margin-bottom: 10px;">
        <input type="checkbox" v-model="isRohtoEnabled" :id="'rohto-toggle'" />
        <label :for="'rohto-toggle'" style="margin-left: 5px;">
          {{ isRohtoEnabled ? t('rohto_disable') : t('rohto_enable') }}
        </label>
      </div>

      <button class="btn btn-primary message-upload-button" @click="showModal = true">⬆ {{ t('upload_image_with_message') }}</button>
      <button class="btn btn-primary message-capture-button" @click="showCaptureModal = true">📷 {{ t('capture_image_with_message') }}</button>
      <button class="btn btn-primary message-capture-video-button" @click="showCaptureVideoModal = true">🎥 {{ t('capture_video_with_message') }}</button>
      <button class="btn btn-primary message-record-audio-button" @click="showRecordAudioModal = true">🎤 {{ t('speech_to_text') }}</button>

      <div class="message-area">
        <MessageList
          :messages="messages"
          :default-male-image="defaultMaleImage"
          :default-female-image="defaultFemaleImage"
          :has-more="hasMore"
          :loading-older="loadingOlder"
          @load-older="loadOlderMessages"
        />
        <div class="active-list">
          <div v-if="typingIndicator" class="typing-indicator">{{ typingIndicator }}</div>
          <div v-if="speechIndicator" class="typing-indicator">{{ speechIndicator }}</div>
          <div v-if="isThinking" class="typing-indicator">{{ t('aiTypingIndicator') }}</div>
        </div>
      </div>

      <div class="message-form">
        <div>
          <label><input type="radio" v-model="aiMode" value="ai" /> {{ t('ask_from_ai') }}</label>
          <label style="margin-left: 10px;"><input type="radio" v-model="aiMode" value="generate_image" /> {{ t('generate_image') }}</label>
          <label style="margin-left: 10px; display: block; margin-top: 10px;">
            <input type="checkbox" v-model="generateFileEnabled" /> Generate file
          </label>
          <div v-if="generateFileEnabled" style="display: flex; gap: 8px; margin-top: 8px;">
            <button :class="`btn btn-sm ${generateFileType === 'docx' ? 'btn-primary' : 'btn-outline-primary'}`" @click="generateFileType = 'docx'">Word</button>
            <button :class="`btn btn-sm ${generateFileType === 'xlsx' ? 'btn-primary' : 'btn-outline-primary'}`" @click="generateFileType = 'xlsx'">Excel</button>
            <button :class="`btn btn-sm ${generateFileType === 'pdf' ? 'btn-primary' : 'btn-outline-primary'}`" @click="generateFileType = 'pdf'">PDF</button>
          </div>
        </div>

        <div style="position: relative;">
          <textarea
            class="message-input form-control"
            :placeholder="t('box')"
            v-model="message"
            @input="handleTyping"
            style="min-height: 50px;"
          />
          <button @click="message = ''" style="position: absolute; top: 10px; right: 20px; background: transparent; border: none; color: white;">✕</button>
        </div>

        <button class="btn btn-primary" @click="generateFileEnabled ? generateFile() : submitMessage()">
          {{ generateFileEnabled ? 'Generate file' : t('send') }}
        </button>
        <button class="btn btn-primary upload-pdf-button" @click="pdfInputRef.click()">{{ t('upload_pdf') }}</button>
        <input type="file" accept="application/pdf" ref="pdfInputRef" style="display: none;" @change="handlePdfChange" />
      </div>
    </div>

    <div v-if="showPromptOverlay" class="offcanvas offcanvas-end show" style="width: 400px; visibility: visible;">
      <div class="offcanvas-header">
        <h5>ROHTO AI Prompt</h5>
        <button class="btn-close" @click="showPromptOverlay = false" />
      </div>
      <div class="offcanvas-body">
        <div class="mb-3"><label>{{ t('rohto_role_label') }}</label><textarea class="form-control prompt-textarea" v-model="rohto.role" :placeholder="t('rohto_role_placeholder')" :disabled="!isRohtoEnabled" /></div>
        <div class="mb-3"><label>{{ t('rohto_problem_label') }}</label><textarea class="form-control prompt-textarea" v-model="rohto.problem" :placeholder="t('rohto_problem_placeholder')" :disabled="!isRohtoEnabled" /></div>
        <div class="mb-3"><label>{{ t('rohto_history_label') }}</label><textarea class="form-control prompt-textarea" v-model="rohto.history" :placeholder="t('rohto_history_placeholder')" :disabled="!isRohtoEnabled" /></div>
        <div class="mb-3"><label>{{ t('rohto_goal_label') }}</label><textarea class="form-control prompt-textarea" v-model="rohto.goal" :placeholder="t('rohto_goal_placeholder')" :disabled="!isRohtoEnabled" /></div>
        <div class="mb-3"><label>{{ t('rohto_expectation_label') }}</label><textarea class="form-control prompt-textarea" v-model="rohto.expectation" :placeholder="t('rohto_expectation_placeholder')" :disabled="!isRohtoEnabled" /></div>
      </div>
    </div>
    <div v-if="showPromptOverlay" class="offcanvas-backdrop fade show" @click="showPromptOverlay = false" />

    <div v-if="showModal" class="modal d-block"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header message-upload-modal"><h5>{{ t('upload_image_with_message') }}</h5><button class="btn-close" @click="showModal = false" /></div>
      <div class="modal-body message-upload-modal">
        <input type="file" id="upload-input" class="message-file-selector" style="display: none;" @change="handleFileChange" />
        <label for="upload-input" :class="`message-file-button ${highlight.button ? 'highlight' : ''}`">{{ t('browse') }}</label>
        <img v-if="imageUploading" class="imageUpload" :src="imageUploading" alt="" />
        <textarea :class="`message-textarea ${highlight.textarea ? 'highlight' : ''}`" v-model="message" :placeholder="t('enter_your_message')" @input="handleTyping" />
        <div v-if="uploadError" class="error-message" v-html="uploadError" />
        <button class="message-upload-button btn btn-primary" @click="handleUpload">{{ t('upload') }}</button>
      </div>
      <div class="modal-footer message-upload-modal"><button class="btn btn-secondary" @click="showModal = false">{{ t('close') }}</button></div>
    </div></div></div>
    <div v-if="showModal" class="modal-backdrop fade show" @click="showModal = false" />

    <div v-if="showCaptureModal" class="modal d-block"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header message-upload-modal"><h5>{{ t('capture_image_with_message') }}</h5><button class="btn-close" @click="showCaptureModal = false; imageSrc = null" /></div>
      <div class="modal-body message-upload-modal">
        <video ref="captureVideoRef" class="Webcam-message" autoplay playsinline muted />
        <button :class="`message-file-button btn ${highlight.button ? 'highlight' : ''}`" @click="capturePhoto">{{ t('capturePhoto') }}</button>
        <img v-if="imageSrc" class="Webcam-message" :src="imageSrc" alt="" />
        <textarea :class="`message-textarea ${highlight.textarea ? 'highlight' : ''}`" v-model="message" :placeholder="t('enter_your_message')" @input="handleTyping" />
        <div v-if="uploadError" class="error-message" v-html="uploadError" />
        <button class="message-upload-button btn btn-primary" @click="uploadCapture">{{ t('upload') }}</button>
      </div>
      <div class="modal-footer message-upload-modal"><button class="btn btn-secondary" @click="showCaptureModal = false; imageSrc = null">{{ t('close') }}</button></div>
    </div></div></div>
    <div v-if="showCaptureModal" class="modal-backdrop fade show" />

    <div v-if="showCaptureVideoModal" class="modal d-block"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header message-upload-modal"><h5>{{ t('capture_video_with_message') }}</h5><button class="btn-close" @click="showCaptureVideoModal = false; imageVideoSrc = null" /></div>
      <div class="modal-body message-upload-modal">
        <video ref="captureVideoRef2" class="Webcam-message" autoplay playsinline muted />
        <button v-if="!isCapturingVideo" :class="`Webcam-button startVideo btn ${highlight.button ? 'highlight' : ''}`" @click="startVideoCapture">{{ t('start_video') }}</button>
        <button v-else class="Webcam-button stopVideo btn btn-danger" @click="stopVideoCapture">{{ t('stop_video') }}</button>
        <div>{{ t('duration') }}: {{ formatDuration(videoDuration) }}</div>
        <img v-if="imageVideoSrc" class="Webcam-message" :src="imageVideoSrc" alt="" />
        <textarea :class="`message-textarea ${highlight.textarea ? 'highlight' : ''}`" v-model="message" :placeholder="t('enter_your_message')" @input="handleTyping" />
        <div v-if="uploadError" class="error-message" v-html="uploadError" />
        <button class="message-upload-button btn btn-primary" @click="uploadVideo">{{ t('upload') }}</button>
      </div>
      <div class="modal-footer message-upload-modal"><button class="btn btn-secondary" @click="showCaptureVideoModal = false; imageVideoSrc = null">{{ t('close') }}</button></div>
    </div></div></div>
    <div v-if="showCaptureVideoModal" class="modal-backdrop fade show" />

    <div v-if="showRecordAudioModal" class="modal d-block"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header message-upload-modal"><h5>{{ t('speech_to_text') }}</h5><button class="btn-close" @click="showRecordAudioModal = false" /></div>
      <div class="modal-body message-upload-modal">
        <p class="text-muted">Audio recorder component goes here</p>
      </div>
      <div class="modal-footer message-upload-modal"><button class="btn btn-secondary" @click="showRecordAudioModal = false">{{ t('close') }}</button></div>
    </div></div></div>
    <div v-if="showRecordAudioModal" class="modal-backdrop fade show" @click="showRecordAudioModal = false" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Pusher from 'pusher-js';
import Swal from 'sweetalert2';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_PUSHER_KEY, API_PUSHER_CLUSTER } from '../constants/apiConstants';
import MessageList from '../components/chat/MessageList.vue';
import defaultMaleImage from '../assets/male-default-profile-picture.png';
import defaultFemaleImage from '../assets/female-default-profile-picture.png';
import '../assets/css/Chat.css';

const { t, locale } = useI18n();

const authData  = localStorage.getItem(ACCESS_USER_DATA);
const authArray = JSON.parse(authData);

const username          = ref(authArray?.name || 'Guest');
const messages          = ref([]);
const message           = ref('');
const typingIndicator   = ref('');
const speechIndicator   = ref('');
const isThinking        = ref(false);
const aiMode            = ref('');
const generateFileEnabled = ref(false);
const generateFileType  = ref('docx');
const isRohtoEnabled    = ref(false);
const showPromptOverlay = ref(false);
const isRealtimeActive  = ref(false);

const showModal           = ref(false);
const showCaptureModal    = ref(false);
const showCaptureVideoModal = ref(false);
const showRecordAudioModal  = ref(false);

const imageUploading    = ref(null);
const selectedFile      = ref(null);
const imageSrc          = ref(null);
const imageVideoSrc     = ref(null);
const recordedChunks    = ref([]);
const isCapturingVideo  = ref(false);
const videoDuration     = ref(0);
const uploadError       = ref('');
const highlight         = reactive({ button: false, textarea: false });

const hasMore        = ref(true);
const loadingOlder   = ref(false);
const page           = ref(1);

const remoteAudioRef    = ref(null);
const captureVideoRef   = ref(null);
const captureVideoRef2  = ref(null);
const pdfInputRef       = ref(null);

const rohto = reactive({ role: '', problem: '', history: '', goal: '', expectation: '' });

const pcRef             = ref(null);
const localStreamRef    = ref(null);
const dataChannelRef    = ref(null);
const realtimeTextAccum = ref('');
const recognitionRef    = ref(null);

let captureStream    = null;
let mediaRecorder    = null;
let typingTimeout    = null;
let videoDurationInt = null;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

onMounted(async () => {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;

  validateToken();
  await fetchUsername();
  initializePusher();
  await loadInitialMessages();
});

onUnmounted(() => {
  stopRealtimeConversation();
  if (captureStream) captureStream.getTracks().forEach(t => t.stop());
});

const validateToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_NAME);
  if (!token || token.split('.').length !== 3) {
    localStorage.clear();
    alert(t('token_expired_or_invalid'));
    window.location.href = '/';
    return false;
  }
  return true;
};

const fetchUsername = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/userdata`, { headers: authHeaders() });
    username.value = data.name;
  } catch (e) { console.error('fetchUsername:', e); }
};

const initializePusher = () => {
  const pusher  = new Pusher(API_PUSHER_KEY, { cluster: API_PUSHER_CLUSTER });
  const channel = pusher.subscribe(authArray.domain + '_chat');

  channel.bind('message', (msg) => { messages.value.push(msg); });

  channel.bind('user-typing', ({ username: u, isTyping }) => {
    if (isTyping) {
      typingIndicator.value = `${u} ${t('typing')}`;
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => { typingIndicator.value = ''; }, 1000);
    }
  });

  channel.bind('user-speech', ({ username: u, isSpeech }) => {
    speechIndicator.value = isSpeech ? `${u} ${t('speech')}` : '';
  });

  channel.bind('ai-thinking', ({ isThinking: val }) => { isThinking.value = val; });
};

const loadInitialMessages = async () => {
  const res = await fetchMessages(1);
  messages.value = [...res.messages].reverse();
  page.value     = 1;
  hasMore.value  = res.current_page < res.last_page;
};

const loadOlderMessages = async () => {
  if (!hasMore.value) return;
  loadingOlder.value = true;
  const nextPage = page.value + 1;
  const res      = await fetchMessages(nextPage);
  const newer    = res.messages.reverse();
  if (newer.length === 0) { hasMore.value = false; loadingOlder.value = false; return; }
  const existingIds = new Set(messages.value.map(m => m.id));
  messages.value = [...newer.filter(m => !existingIds.has(m.id)), ...messages.value];
  page.value     = nextPage;
  loadingOlder.value = false;
};

const fetchMessages = async (pageNumber = 1) => {
  const res = await axios.get(`${API_BASE_URL}/api/chat/messages?page=${pageNumber}`, { headers: authHeaders() });
  return res.data;
};

const handleTyping = async () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => sendTypingStatus(false), 500);
  sendTypingStatus(true);
  uploadError.value = '';
  highlight.button  = false;
  highlight.textarea = false;
};

const sendTypingStatus = async (isTyping) => {
  await axios.post(`${API_BASE_URL}/api/chat/typing`, { username: username.value, isTyping }, { headers: authHeaders() }).catch(() => {});
};

const sendSpeechStatus = async (isSpeech) => {
  await axios.post(`${API_BASE_URL}/api/chat/speech`, { username: username.value, isSpeech }, { headers: authHeaders() }).catch(() => {});
};

const setThinking = async (val) => {
  isThinking.value = val;
  await axios.post(`${API_BASE_URL}/api/chat/thinking`, { username: 'AI', isThinking: val }, { headers: authHeaders() }).catch(() => {});
};

const submitMessage = async () => {
  try {
    const type = aiMode.value === 'ai' ? 'ask_from_ai' : aiMode.value === 'generate_image' ? 'generate_image' : null;
    await axios.post(`${API_BASE_URL}/api/chat/messages`, { username: username.value, message: message.value, type }, { headers: authHeaders() });
    const msg = message.value;
    message.value = '';
    sendTypingStatus(false);

    if (aiMode.value === 'ai') {
      await setThinking(true);
      await generateResponse(msg);
    } else if (aiMode.value === 'generate_image') {
      await setThinking(true);
      await generateImage(msg);
    }
  } catch (e) { console.error('submitMessage:', e); }
};

const buildRohtoPrompt = (msg) => {
  if (!isRohtoEnabled.value) return msg;
  return `${t('rohto_role_label')}: ${rohto.role}\n${t('rohto_problem_label')}: ${rohto.problem}\n${t('rohto_history_label')}: ${rohto.history}\n${t('rohto_goal_label')}: ${rohto.goal}\n${t('rohto_expectation_label')}: ${rohto.expectation}\n${t('rohto_for_prompt')}: ${msg}`.trim();
};

const saveMessageToDatabase = async (msg) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/chat/save-message`, msg, { headers: authHeaders() });
    return res.data?.message || null;
  } catch (e) { console.error('saveMessage:', e); return null; }
};

const generateResponse = async (prompt) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/chat/generate-response`,
      { prompt: buildRohtoPrompt(prompt), language: locale.value },
      { headers: authHeaders(), timeout: 120000 }
    );
    const aiMsg = { username: 'AI', generate: false, message: res.data.response, created_at: new Date().toISOString() };
    const saved = await saveMessageToDatabase(aiMsg);
    if (saved) {
      const ids = new Set(messages.value.map(m => m.id).filter(Boolean));
      if (!saved.id || !ids.has(saved.id)) messages.value.push(saved);
    }
    await setThinking(false);
  } catch (e) {
    console.error('generateResponse:', e);
    await setThinking(false);
    alert(t('error_generating_response'));
  }
};

const generateImage = async (prompt) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/chat/generate-image`,
      { prompt, generate: true, language: locale.value },
      { headers: authHeaders() }
    );
    const aiMsg = { username: 'AI', generate: true, message: res.data.response, created_at: new Date().toISOString() };
    await saveMessageToDatabase(aiMsg);
    await setThinking(false);
    const freshRes = await fetchMessages(1);
    messages.value = freshRes.messages.reverse();
  } catch (e) { console.error('generateImage:', e); await setThinking(false); }
};

const generateFile = async () => {
  const prompt = buildRohtoPrompt(message.value);
  try {
    await axios.post(`${API_BASE_URL}/api/chat/messages`, { username: username.value, message: message.value, type: 'generate_file' }, { headers: authHeaders() });
    const endpointMap = { docx: '/api/chat/word/send', xlsx: '/api/chat/excel/send', pdf: '/api/chat/pdf/send' };
    await setThinking(true);
    const res = await axios.post(`${API_BASE_URL}${endpointMap[generateFileType.value]}`, { prompt, generate: false }, { headers: authHeaders(), timeout: 120000 });
    const filename = res.data.filename || `generated.${generateFileType.value}`;
    const aiMsg = { username: 'AI', generate: false, message: 'File generated. Click download.', created_at: new Date().toISOString(), filename, download_link: `${API_BASE_URL}/storage/${filename}` };
    const saved = await saveMessageToDatabase(aiMsg);
    if (saved) messages.value.push(saved);
    await setThinking(false);
  } catch (e) { console.error('generateFile:', e); await setThinking(false); alert(t('error_generating_response')); }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { imageUploading.value = ev.target.result; };
  reader.readAsDataURL(file);
  selectedFile.value = file;
  uploadError.value  = '';
};

const validateUpload = (image, msg) => {
  if (!image && !msg) return `${t('please_select_file')}<br />${t('please_write_message')}`;
  if (!image) return t('please_select_file');
  if (!msg)   return t('please_write_message');
  return '';
};

const handleUpload = async () => {
  const err = validateUpload(imageUploading.value, message.value);
  if (err) { uploadError.value = err; highlight.button = true; highlight.textarea = true; setTimeout(() => { highlight.button = false; highlight.textarea = false; }, 3000); return; }
  uploadError.value = '';
  const formData = new FormData();
  formData.append('message', message.value);
  formData.append('image', selectedFile.value);
  try {
    await axios.post(`${API_BASE_URL}/api/chat/upload`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
    message.value = ''; selectedFile.value = null; showModal.value = false;
    Swal.fire({ icon: 'success', title: t('upload_successful'), text: t('image_upload_successful') }).then(r => { if (r.isConfirmed) loadInitialMessages(); });
  } catch (e) { uploadError.value = t('failed_to_upload_file'); }
};

const startCaptureStream = async (videoEl) => {
  captureStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  if (videoEl) videoEl.srcObject = captureStream;
};

const capturePhoto = () => {
  if (!captureVideoRef.value) return;
  const canvas = document.createElement('canvas');
  canvas.width  = captureVideoRef.value.videoWidth;
  canvas.height = captureVideoRef.value.videoHeight;
  canvas.getContext('2d').drawImage(captureVideoRef.value, 0, 0);
  imageSrc.value = canvas.toDataURL('image/jpeg');
};

const uploadCapture = async () => {
  const err = validateUpload(imageSrc.value, message.value);
  if (err) { uploadError.value = err; return; }
  const formData = new FormData();
  formData.append('message', message.value);
  formData.append('file', imageSrc.value);
  try {
    await axios.post(`${API_BASE_URL}/api/chat/capture-upload`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
    message.value = ''; imageSrc.value = null; showCaptureModal.value = false;
    Swal.fire({ icon: 'success', title: t('upload_successful'), text: t('capture_successful') }).then(r => { if (r.isConfirmed) loadInitialMessages(); });
  } catch (e) { uploadError.value = t('failed_to_upload_file'); }
};

const startVideoCapture = async () => {
  isCapturingVideo.value = true;
  recordedChunks.value   = [];
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  if (captureVideoRef2.value) captureVideoRef2.value.srcObject = stream;
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.addEventListener('dataavailable', ({ data }) => { if (data.size > 0) recordedChunks.value.push(data); });
  mediaRecorder.start();
  videoDuration.value = 0;
  videoDurationInt = setInterval(() => { videoDuration.value++; }, 1000);
};

const stopVideoCapture = () => {
  if (captureVideoRef2.value) imageVideoSrc.value = captureVideoRef2.value.toDataURL?.('image/jpeg') || '';
  isCapturingVideo.value = false;
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
  clearInterval(videoDurationInt);
};

const uploadVideo = async () => {
  const err = validateUpload(imageVideoSrc.value, message.value);
  if (err) { uploadError.value = err; return; }
  if (!recordedChunks.value.length) return;
  showCaptureVideoModal.value = false;
  const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('message', message.value);
  formData.append('file', blob, 'captured-video.webm');
  try {
    await axios.post(`${API_BASE_URL}/api/chat/upload-video`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
    Swal.fire({ icon: 'success', title: t('upload_successful'), text: t('video_capture_successful') }).then(r => { if (r.isConfirmed) loadInitialMessages(); });
  } catch (e) { console.error('uploadVideo:', e); }
};

const handlePdfChange = async (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'application/pdf') { alert(t('invalid_pdf_selection')); return; }
  await setThinking(true);
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('message', message.value.trim() || 'Please analyze this PDF document');
  try {
    await axios.post(`${API_BASE_URL}/api/chat/messages`, { username: username.value, message: message.value || 'PDF uploaded', type: null }, { headers: authHeaders() });
    message.value = '';
    const res = await axios.post(`${API_BASE_URL}/api/chat/analyze-pdf`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
    if (!res.data.success) throw new Error('Failed to upload PDF');
    Swal.fire({ icon: 'success', title: t('upload_successful'), text: t('pdf_upload_successful') }).then(r => { if (r.isConfirmed) { setThinking(false); loadInitialMessages(); } });
  } catch (e) {
    console.error(e);
    Swal.fire({ icon: 'error', title: t('upload_failure'), text: t('pdf_upload_failure') });
    await setThinking(false);
  }
};

const formatDuration = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
};

const startRealtimeConversation = async () => {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/chat/openai-session`, { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` } });
    const session = await resp.json();
    const ephemeralKey = session?.client_secret?.value || session?.client_secret;
    if (!ephemeralKey) throw new Error('No client_secret in session');

    const pc = new RTCPeerConnection();
    pcRef.value = pc;

    pc.ontrack = (e) => { if (remoteAudioRef.value) remoteAudioRef.value.srcObject = e.streams[0]; };

    pc.ondatachannel = (ev) => {
      const ch = ev.channel;
      dataChannelRef.value = ch;
      ch.onopen = () => {
        ch.send(JSON.stringify({ type: 'session.update', session: { instructions: 'You are a helpful assistant. Respond in English, Finnish, or Swedish. Be concise.', voice: 'alloy', modalities: ['text', 'audio'] } }));
      };
      ch.onmessage = (m) => {
        try { handleOpenAIEvent(JSON.parse(m.data)); } catch {}
      };
    };

    localStreamRef.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.value.getTracks().forEach(t => pc.addTrack(t, localStreamRef.value));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResp = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ephemeralKey}`, 'Content-Type': 'application/sdp' },
      body: offer.sdp,
    });

    await pc.setRemoteDescription({ type: 'answer', sdp: await sdpResp.text() });
    isRealtimeActive.value = true;
    sendSpeechStatus(true);
  } catch (e) {
    console.error('Realtime start failed:', e);
    alert(`${t('realtime_start_failed')}\n\n${e.message}`);
  }
};

const handleOpenAIEvent = (data) => {
  if (data.type === 'response.created') realtimeTextAccum.value = '';
  if (data.type === 'response.content_block.delta' && data.delta?.type === 'text_delta') realtimeTextAccum.value += data.delta.text;
  if (data.type === 'response.done' && realtimeTextAccum.value.trim()) {
    const aiMsg = { username: 'AI', message: realtimeTextAccum.value.trim(), generate: false, created_at: new Date().toISOString() };
    messages.value.push(aiMsg);
    saveMessageToDatabase(aiMsg);
    realtimeTextAccum.value = '';
  }
};

const stopRealtimeConversation = async () => {
  recognitionRef.value?.stop?.();
  recognitionRef.value = null;
  pcRef.value?.getSenders?.().forEach(s => { try { s.track?.stop(); } catch {} });
  pcRef.value?.close?.();
  pcRef.value = null;
  localStreamRef.value?.getTracks?.().forEach(t => t.stop());
  localStreamRef.value = null;
  if (remoteAudioRef.value) remoteAudioRef.value.srcObject = null;
  isRealtimeActive.value = false;
  sendSpeechStatus(false);
};
</script>