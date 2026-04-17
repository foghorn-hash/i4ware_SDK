<template>
  <div class="VideoPhoto-main">
    <div v-if="isLoading" class="loading-screen">
      <img :src="loadingSpinner" alt="Loading..." />
    </div>

    <template v-else>
      <h3>{{ t('videoPhoto') }}</h3>

      <div class="VideoPhoto-button-bar">
        <!-- Hidden file inputs -->
        <input
          type="file"
          ref="fileInputRef"
          style="display: none"
          accept="image/jpeg, image/png"
          @change="handleFileChange"
        />
        <input
          type="file"
          ref="videoFileInputRef"
          style="display: none"
          accept="video/*"
          @change="handleVideoChange"
        />

        <button class="VideoPhoto-button btn btn-primary btn-sm" @click="fileInputRef.click()">
          {{ t('uploadPhoto') }}
        </button>
        <button class="VideoPhoto-button btn btn-primary btn-sm" @click="handleCapturePhoto">
          {{ t('capturePhoto') }}
        </button>
        <button class="VideoPhoto-button btn btn-primary btn-sm" @click="videoFileInputRef.click()">
          {{ t('uploadVideo') }}
        </button>
        <button class="VideoPhoto-button btn btn-primary btn-sm" @click="handleCaptureVideo">
          {{ t('captureVideo') }}
        </button>
      </div>

      <!-- Gallery -->
      <ImageVideoGallery :data="assets" />

      <!-- Capture modals -->
      <CaptureVideoPhoto
        v-if="showCapturePhoto"
        :model="true"
        capture-type="photo"
        @upload="refreshGallery"
      />
      <CaptureVideoPhoto
        v-if="showCaptureVideo"
        :model="true"
        capture-type="video"
        @upload="refreshGallery"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import ImageVideoGallery from '../components/ImageVideoGallery.vue';
import CaptureVideoPhoto from '../components/CaptureVideoPhoto.vue';
import loadingSpinner from '../assets/tube-spinner.svg';
import '../assets/css/VideoPhoto.css';

const { t, locale } = useI18n();

const page = ref(1);
const assets = ref([]);
const hasMore = ref(true);
const isLoading = ref(false);
const showCapturePhoto = ref(false);
const showCaptureVideo = ref(false);
const fileInputRef = ref(null);
const videoFileInputRef = ref(null);

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }

  loadMore();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
    loadMore();
  }
};

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
  withCredentials: true,
});

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/gallery/assets?page=${page.value}`, getAuthHeaders());
    const newAssets = res.data;
    if (newAssets && newAssets.length > 0) {
      assets.value = [...new Set([...assets.value, ...newAssets])];
      page.value++;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('Error loading assets:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshGallery = async () => {
  isLoading.value = true;
  page.value = 1;
  hasMore.value = true;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/gallery/assets?page=1`, getAuthHeaders());
    const newAssets = res.data;
    if (newAssets && newAssets.length > 0) {
      assets.value = newAssets;
      page.value = 2;
    } else {
      assets.value = [];
      hasMore.value = false;
    }
  } catch (error) {
    console.error('Error refreshing gallery:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    Swal.fire({ title: t('uploadError'), text: t('imageTypeNotSupported'), icon: 'error' });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  try {
    await axios.post(`${API_BASE_URL}/api/gallery/upload-media`, formData, getAuthHeaders());
    Swal.fire({ title: t('uploadSuccess'), text: t('imageUploadSuccess'), icon: 'success', timer: 3000, showConfirmButton: false });
    refreshGallery();
  } catch (error) {
    Swal.fire({ title: t('uploadError'), text: error.response?.data?.message || 'Failed to upload image', icon: 'error' });
  }
};

const handleVideoChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 100 * 1024 * 1024) {
    Swal.fire({ title: t('uploadError'), text: t('videoSizeTooLarge'), icon: 'error' });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  try {
    await axios.post(`${API_BASE_URL}/api/gallery/upload-media`, formData, getAuthHeaders());
    Swal.fire({ title: t('uploadSuccess'), text: t('videoUploadSuccess'), icon: 'success', timer: 3000, showConfirmButton: false });
    refreshGallery();
  } catch (error) {
    Swal.fire({ title: t('uploadError'), text: error.response?.data?.message || 'Failed to upload video', icon: 'error' });
  }
};

const handleCapturePhoto = () => { showCapturePhoto.value = !showCapturePhoto.value; };
const handleCaptureVideo = () => { showCaptureVideo.value = !showCaptureVideo.value; };
</script>