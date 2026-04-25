<template>
  <div class="webcam-overlay">
    <div class="Webcam-container">

      <div class="Webcam-close-container">
        <button class="close-overlay-button" @click="$emit('close')">X</button>
      </div>

      <video
        v-show="!imageSrc"
        ref="videoRef"
        class="Webcam"
        autoplay
        playsinline
        muted
      />

      <img
        v-if="imageSrc && !showCropper"
        :src="imageSrc"
        class="Webcam"
        alt="Captured"
      />

      <br />

      <button
        v-if="!imageSrc"
        class="Webcam-capture-button"
        @click="capture"
      >
        {{ t('capturePhoto') }}
      </button>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileChange"
      />

      <ImageCropper
        v-if="imageSrc && showCropper"
        :image-src="imageSrc"
        :crop="crop"
        :zoom="zoom"
        :aspect="1"
        :show-cropper="showCropper"
        crop-shape="round"
        @update:show-cropper="showCropper = $event"
        @crop-change="crop = $event"
        @crop-complete="onCropComplete"
        @zoom-change="zoom = $event"
        @cropped-file="croppedImageFile = $event"
      />

      <template v-if="imageSrc">
        <button class="Webcam-upload-button" @click="upload">
          {{ t('upload') }}
        </button>
        <button class="Webcam-remove-button" @click="imageSrc = null">
          {{ t('removeImage') }}
        </button>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import ImageCropper from './ImageCropper.vue';
import '../assets/css/WebcamCapture.css';

const props = defineProps({
  onClose: Function,
  loadUserData: Function,
});

const emit = defineEmits(['close']);

const { t, locale } = useI18n();

const videoRef = ref(null);
const fileInputRef = ref(null);
const imageSrc = ref(null);
const crop = ref({ x: 0, y: 0 });
const zoom = ref(1);
const croppedArea = ref(null);
const croppedImageFile = ref(null);
const showCropper = ref(false);
const showMessage = ref(null);

let stream = null;

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1920, height: 1080 },
      audio: false,
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (error) {
    console.error('Error accessing webcam:', error);
  }
});

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});

const capture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  canvas.getContext('2d').drawImage(videoRef.value, 0, 0);
  imageSrc.value = canvas.toDataURL('image/jpeg');
  showCropper.value = true;
};

const onFileChange = (event) => {
  if (event.target.files && event.target.files.length > 0) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]);
    fileReader.onload = () => {
      imageSrc.value = fileReader.result;
      showCropper.value = true;
    };
  }
};

const onCropComplete = (area) => {
  if (area) {
    croppedArea.value = area;
  }
};

const upload = async () => {
  if (!croppedImageFile.value) return;

  try {
    const formData = new FormData();
    formData.append('file', croppedImageFile.value);

    await axios.post(`${API_BASE_URL}/api/manage/capture-upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (props.loadUserData) props.loadUserData();
    emit('close');
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};
</script>