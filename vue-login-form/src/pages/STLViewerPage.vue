<template>
  <div>
    <div v-if="showModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog STLViewerComponent-large-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('modelViewerTitle') }}</h5>
            <button class="btn-close" @click="closeModal" />
          </div>
          <div class="modal-body STLViewerComponent-modal-body">
            <div class="STlViewerComponent-modal-window">
              <ModalWindow3DViewer :stl-filename="selectedModel" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">{{ t('close') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show" @click="closeModal" />

    <ModalDelete
      :show="showDeleteModal"
      :file-name="fileToDelete"
      @close="closeModalDelete"
      @delete="removeItem"
    />

    <div v-if="isGenerating" class="loading-screen">
      <img :src="loadingSpinner" :alt="t('isLoading')" />
      <p>{{ t('isGenerating') }}</p>
    </div>

    <div class="STL-controls">
      <FileUploadForm @uploaded="newItemIsUploaded" />
      <button
        class="btn btn-success STL-generate-button ms-2"
        :disabled="isGenerating"
        @click="handleGenerate('spaceship')"
      >
        {{ isGenerating ? t('generating') : t('generateSpaceship') }}
      </button>
      <button
        class="btn btn-success STL-generate-button ms-2"
        :disabled="isGenerating"
        @click="handleGenerate('car')"
      >
        {{ isGenerating ? t('generating') : t('generateCar') }}
      </button>
      <button
        class="btn btn-success STL-generate-button ms-2"
        :disabled="isGenerating"
        @click="handleGenerate('cyborg')"
      >
        {{ isGenerating ? t('generating') : t('generateCyborg') }}
      </button>
      <div class="STLViewerComponent-clear" />
    </div>

    <div class="container">
      <div class="row STLViewerComponent-row" ref="scrollContainer">
        <div
          v-for="(file, index) in stlItems"
          :key="index"
          class="col-md-4 STLViewerComponent-col"
        >
          <div class="card">
            <div class="card-body">
              <h5 class="card-title STLViewerComponent-card-title">{{ file.stl_filename }}</h5>
              <div class="screenshot-container">
                <img
                  v-if="file.screenshot_file"
                  :src="`data:image/png;base64,${file.screenshot_file}`"
                  :alt="`Screenshot for ${file.stl_filename}`"
                  width="444"
                  height="121"
                />
                <div style="display: flex; justify-content: space-between;">
                  <button class="btn btn-primary" @click="openModal(file.stl_filename)">{{ t('viewSTL') }}</button>
                  <button class="btn btn-danger" @click="openDeleteModal(file.stl_filename)">{{ t('delete') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-screen">
        <img :src="loadingSpinner" :alt="t('isLoading')" />
      </div>
      <div v-else-if="hasMore" class="text-center py-3 text-muted">
        {{ t('isLoading') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import ModalWindow3DViewer from '../components/ModalWindow3DViewer.vue';
import ModalDelete from '../components/ModalDelete.vue';
import FileUploadForm from '../components/FileUploadForm.vue';
import loadingSpinner from '../assets/tube-spinner.svg';
import '../assets/css/STLViewerComponent.css';

const { t, locale } = useI18n();

const selectedModel    = ref(null);
const showModal        = ref(false);
const stlItems         = ref([]);
const hasMore          = ref(true);
const page             = ref(1);
const isLoading        = ref(false);
const showDeleteModal  = ref(false);
const fileToDelete     = ref(null);
const isGenerating     = ref(false);
const scrollContainer  = ref(null);

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

onMounted(() => {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;

  fetchStlFiles();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMore();
  }
};

const fetchStlFiles = async () => {
  if (isLoading.value || !hasMore.value) return;
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_BASE_URL}/api/stl/stl-items?page=${page.value}`, {
      headers: authHeaders(),
    });
    const newFiles = response.data;
    stlItems.value = [...stlItems.value, ...newFiles];
    if (newFiles.length < 9) {
      hasMore.value = false;
    } else {
      page.value++;
    }
  } catch (error) {
    console.error('Error fetching STL files:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  if (hasMore.value && !isLoading.value) fetchStlFiles();
};

const newItemIsUploaded = async (fileName) => {
  if (!hasMore.value) {
    try {
      isLoading.value = true;
      const response = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
        headers: authHeaders(),
      });
      if (response.data) stlItems.value.push(response.data);
    } catch (error) {
      console.error('Error fetching new STL item:', error);
    } finally {
      isLoading.value = false;
    }
  }
};

const handleGenerate = async (type) => {
  try {
    isGenerating.value = true;
    const response = await axios.post(
      `${API_BASE_URL}/api/stl/generate-${type}`,
      {},
      { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
    );
    const newItem = Array.isArray(response.data) ? response.data[0] : response.data;
    const fileName = newItem?.stl_filename;
    if (!fileName) throw new Error('Invalid filename in response.');

    if (!hasMore.value) {
      try {
        isLoading.value = true;
        const fetchResponse = await axios.get(`${API_BASE_URL}/api/stl/stl-item?fileName=${fileName}`, {
          headers: authHeaders(),
        });
        if (fetchResponse.data) stlItems.value.push(fetchResponse.data);
      } catch (error) {
        console.error('Error fetching generated STL:', error);
      } finally {
        isLoading.value = false;
      }
    }
  } catch (error) {
    console.error('AI STL generation failed:', error.response?.data || error.message);
    alert(error.response?.data?.details || 'Failed to generate AI model.');
  } finally {
    isGenerating.value = false;
  }
};

const openModal        = (filename) => { selectedModel.value = filename; showModal.value = true; };
const closeModal       = () => { selectedModel.value = null; showModal.value = false; };
const openDeleteModal  = (filename) => { fileToDelete.value = filename; showDeleteModal.value = true; };
const closeModalDelete = () => { fileToDelete.value = null; showDeleteModal.value = false; };

const removeItem = async (fileName) => {
  try {
    isLoading.value = true;
    const response = await axios.delete(`${API_BASE_URL}/api/stl/delete-stl?fileName=${fileName}`, {
      headers: authHeaders(),
    });
    if (response.status === 200) {
      stlItems.value = stlItems.value.filter(f => f.stl_filename !== fileName);
    }
  } catch (error) {
    console.error('Error deleting STL:', error);
  } finally {
    isLoading.value = false;
    closeModalDelete();
  }
};
</script>