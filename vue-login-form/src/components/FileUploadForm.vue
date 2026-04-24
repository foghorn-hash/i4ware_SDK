<template>
  <div>
    <strong class="FileFormUpload-title">{{ t('uploadStlFile') }}</strong>
    <br /><br />
    <div class="file-input-container">
      <input
        type="file"
        ref="fileInputRef"
        class="FileFormUplaod-file-selector"
        accept=".stl"
        style="display: none"
        @change="handleFileChange"
      />
      <button
        type="button"
        :style="browseButtonStyle"
        @click="fileInputRef.click()"
        @mouseenter="browseBg = 'red'"
        @mouseleave="browseBg = 'transparent'"
      >
        {{ t('browse') }}
      </button>
    </div>

    <button class="FileFormUplaod-file-button" @click="handleFileUpload">
      {{ t('upload') }}
    </button>

    <div v-if="selectedFile" class="file-info">
      <p>{{ t('chose') }} {{ selectedFile.name }}. {{ t('press') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { captureScreenshot } from '../utils/screenshotCapture';
import '../assets/css/FileUploadForm.css';

const { t } = useI18n();

const emit = defineEmits(['uploaded']);

const selectedFile = ref(null);
const fileInputRef = ref(null);
const browseBg     = ref('transparent');

const browseButtonStyle = computed(() => ({
  backgroundColor: browseBg.value,
  color: '#fff',
  padding: '10px 15px',
  marginRight: '10px',
  marginLeft: '10px',
  border: '1px red solid',
  borderRadius: '20px',
  cursor: 'pointer',
}));

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) selectedFile.value = file;
};

const handleFileUpload = async () => {
  if (!selectedFile.value) {
    alert('Please select a file first');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const screenshotDataUrl = await captureScreenshot(selectedFile.value);
    formData.append('screenshot', screenshotDataUrl);

    const response = await axios.post(`${API_BASE_URL}/api/stl/upload-stl`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
      },
    });

    if (response.data?.fileName) {
      emit('uploaded', response.data.fileName);
      selectedFile.value = null;
      fileInputRef.value.value = '';
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Upload failed: ' + error.message);
  }
};
</script>