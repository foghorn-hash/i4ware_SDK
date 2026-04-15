<template>
  <div class="image-video-gallary">
    <div
      v-for="item in validItems"
      :key="item.id"
      class="image-video-item-container"
    >
      <div class="image-video-item" @click="openModal(item)">
        <video v-if="isVideo(item.asset_path)" controls @error="handleVideoError">
          <source :src="mediaUrl(item.asset_path)" type="video/mp4" />
          {{ t('your_browser_not_support_video_tag') }}
        </video>

        <img
          v-else-if="isImage(item.asset_path)"
          :src="mediaUrl(item.asset_path)"
          :alt="item.filename"
          @error="(e) => console.error('Image loading error:', e)"
        />

        <div v-else class="unsupported-file">Unsupported file type</div>
      </div>

      <button
        class="btn btn-danger"
        style="margin-bottom:20px; margin-top:10px"
        @click="openDeleteModal(item.filename)"
      >
        {{ t('delete') }}
      </button>
    </div>

    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3">
          <h5>{{ t('are_you_sure') }}</h5>
          <p>{{ t('are_you_sure_text_modalphoto') }}</p>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-danger" @click="removeItem(fileToDelete)">
              {{ t('yes_delete') }}
            </button>
            <button class="btn btn-secondary" @click="closeDeleteModal">
              {{ t('no_delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedItem" class="modal mediapopup">
      <div class="modal-container">
        <div class="modal-content">
          <div class="close-button-container">
            <button class="close-button" @click="closeModal">X</button>
          </div>

          <video v-if="isVideo(selectedItem.asset_path)" controls @error="handleVideoError">
            <source :src="mediaUrl(selectedItem.asset_path)" type="video/mp4" />
            {{ t('your_browser_not_support_video_tag') }}
          </video>

          <img
            v-else-if="isImage(selectedItem.asset_path)"
            :src="mediaUrl(selectedItem.asset_path)"
            :alt="selectedItem.filename"
          />

          <div v-else class="unsupported-file">Unsupported file type</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const props = defineProps({
  data: { type: Array, default: () => [] },
});

const { t } = useI18n();

const items = ref([...props.data]);

const validItems = computed(() =>
  items.value.filter((item) => item && item.asset_path)
);

const selectedItem  = ref(null);
const showDeleteModal = ref(false);
const fileToDelete  = ref(null);
const isLoading     = ref(false);

const mediaUrl = (assetPath) => `${API_BASE_URL}/storage/${assetPath}`;
const isVideo  = (path) => /\.(mp4|webm|ogg)$/i.test(path);
const isImage  = (path) => /\.(jpg|jpeg|png|gif)$/i.test(path);

const openModal      = (item) => { selectedItem.value = item; };
const closeModal     = () => { selectedItem.value = null; };
const openDeleteModal  = (filename) => { fileToDelete.value = filename; showDeleteModal.value = true; };
const closeDeleteModal = () => { fileToDelete.value = null; showDeleteModal.value = false; };

const handleVideoError = (e) => {
  console.error('Video loading error:', e.target?.error?.message ?? e);
};

const removeItem = async (fileName) => {
  isLoading.value = true;
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/gallery/photos_videos/delete?fileName=${fileName}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` } }
    );
    if (response.status === 200) {
      items.value = items.value.filter((item) => item.filename !== fileName);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  } finally {
    isLoading.value = false;
    closeDeleteModal();
  }
};
</script>