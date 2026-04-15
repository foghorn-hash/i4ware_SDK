<template>
  <div>
    <div v-if="isModalOpen && !photoUploading && !videoUploading" class="webcam-overlay">
      <div class="Webcam-container">
        <div class="Webcam-close-container">
          <button class="close-overlay-button" @click="isModalOpen = false">X</button>
        </div>

        <video v-if="!capturedPhoto" ref="videoEl" autoplay playsinline class="webcam-video" />
        <canvas ref="canvasEl" style="display:none" />

        <template v-if="capturedPhoto">
          <img :src="capturedPhoto" alt="Captured Photo" />
          <button class="Webcam-button upload" @click="uploadPhoto">Upload Photo</button>
        </template>

        <template v-if="captureType === 'photo' && !capturedPhoto">
          <button class="Webcam-button capture" @click="capturePhoto">Capture Photo</button>
        </template>

        <template v-if="captureType === 'video'">
          <button v-if="!isCapturingVideo" class="Webcam-button startVideo" @click="startVideoCapture">
            Start Video
          </button>
          <button v-else class="Webcam-button stopVideo" @click="stopVideoCapture">
            Stop Video
          </button>
          <button v-if="recordedChunks.length > 0" class="Webcam-button upload download" @click="uploadVideo">
            Upload Video
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const props = defineProps({
  captureType: { type: String, default: 'photo' },
  onUpload:    { type: Function, required: true },
});

const isModalOpen      = ref(true);
const capturedPhoto    = ref(null);
const recordedChunks   = ref([]);
const isCapturingVideo = ref(false);
const photoUploading   = ref(false);
const videoUploading   = ref(false);

const videoEl  = ref(null);
const canvasEl = ref(null);

let mediaStream = null;
let mediaRecorder = null;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

onMounted(async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoEl.value) videoEl.value.srcObject = mediaStream;
  } catch (err) {
    console.error('Error accessing camera', err);
  }
});

onUnmounted(() => {
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
});

const capturePhoto = () => {
  const video = videoEl.value;
  const canvas = canvasEl.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  capturedPhoto.value = canvas.toDataURL('image/jpeg');
};

const startVideoCapture = () => {
  isCapturingVideo.value = true;
  recordedChunks.value = [];
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
  mediaRecorder.addEventListener('dataavailable', ({ data }) => {
    if (data.size > 0) recordedChunks.value.push(data);
  });
  mediaRecorder.start();
};

const stopVideoCapture = () => {
  isCapturingVideo.value = false;
  if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
};

const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/jpeg' });
};

const uploadPhoto = async () => {
  if (!capturedPhoto.value) return;
  photoUploading.value = true;
  isModalOpen.value = false;

  const formData = new FormData();
  formData.append('file', dataURItoBlob(capturedPhoto.value), 'captured-photo.jpg');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/gallery/upload-media`,
      formData, { headers: authHeaders() });
    photoUploading.value = false;
    const result = await Swal.fire({ icon: 'success', title: 'Upload Successful', text: response.data.message });
    if (result.isConfirmed) props.onUpload();
  } catch (err) {
    console.error('Error uploading photo:', err);
    photoUploading.value = false;
  }
};

const uploadVideo = async () => {
  if (!recordedChunks.value.length) return;
  isModalOpen.value = false;

  const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('file', blob, 'captured-video.webm');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/gallery/upload-media`,
      formData, { headers: authHeaders() });
    videoUploading.value = false;
    const result = await Swal.fire({ icon: 'success', title: 'Upload Successful', text: response.data.message });
    if (result.isConfirmed) props.onUpload();
  } catch (err) {
    console.error('Error uploading video:', err);
    videoUploading.value = false;
  }
};
</script>