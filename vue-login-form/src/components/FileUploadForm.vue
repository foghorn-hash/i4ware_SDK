<template>
  <div>
    <strong class="FileFormUpload-title">{{ t('uploadStlFile') }}</strong>
    <br /><br />

    <div class="file-input-container">
      <input
        ref="fileInputEl"
        type="file"
        id="file-input"
        class="FileFormUplaod-file-selector"
        accept=".stl"
        style="display:none"
        @change="handleFileChange"
      />
      <button
        type="button"
        class="browse-btn"
        @click="fileInputEl.click()"
        @mouseenter="browseBg = 'red'"
        @mouseleave="browseBg = 'transparent'"
        :style="{ backgroundColor: browseBg, color: '#fff', padding: '10px 15px',
          marginRight: '10px', marginLeft: '10px', border: '1px red solid',
          borderRadius: '20px', cursor: 'pointer' }"
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { captureScreenshot } from '../utils/screenshotCapture';

const props = defineProps({
  newItemIsUploaded: { type: Function, required: true },
});

const { t } = useI18n();

const selectedFile = ref(null);
const fileInputEl  = ref(null);
const browseBg     = ref('transparent');

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
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

    const response = await axios.post(
      `${API_BASE_URL}/api/stl/upload-stl`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
        },
      }
    );

    if (response.data?.fileName) {
      props.newItemIsUploaded(response.data.fileName);
      selectedFile.value = null;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Upload failed: ' + error.message);
  }
};
</script>