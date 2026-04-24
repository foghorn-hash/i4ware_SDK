<template>
  <div class="messages-list">
    <!-- Load older button -->
    <div v-if="hasMore" style="text-align: center; padding: 5px;">
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="loadingOlder"
        @click="$emit('load-older')"
      >
        {{ loadingOlder ? 'Loading...' : 'Load older messages' }}
      </button>
    </div>

    <!-- Messages -->
    <div ref="listRef" style="height: 500px; overflow-y: auto;">
      <div v-for="(msg, index) in processedMessages" :key="index" class="message">
        <div class="date-line">{{ checkDate(new Date(msg.formatted_created_at).toLocaleDateString()) }}</div>

        <div class="message-date">
          <strong>{{ msg.username }}: </strong>
          <i>{{ new Date(msg.formatted_created_at).toLocaleTimeString() }}</i>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button
              :class="`message-TTS ${loadingMessageId === msg.id ? 'tts-loading' : ''} ${currentMessageId === msg.id ? 'tts-playing' : ''}`"
              :disabled="loadingMessageId === msg.id"
              @click="handleToggleSpeech(msg.message, msg.gender, msg.id)"
            >
              <span v-if="currentMessageId === msg.id">⏹</span>
              <span v-else>▶</span>
            </button>
            <svg v-if="currentMessageId === msg.id" width="20" height="20" viewBox="0 0 24 24" fill="none" class="classic-spinner">
              <line x1="12" y1="2" x2="12" y2="6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-1"/>
              <line x1="18.36" y1="5.64" x2="15.54" y2="8.46" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-2"/>
              <line x1="22" y1="12" x2="18" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-3"/>
              <line x1="18.36" y1="18.36" x2="15.54" y2="15.54" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-4"/>
              <line x1="12" y1="22" x2="12" y2="18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-5"/>
              <line x1="5.64" y1="18.36" x2="8.46" y2="15.54" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-6"/>
              <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-7"/>
              <line x1="5.64" y1="5.64" x2="8.46" y2="8.46" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="spinner-line-8"/>
            </svg>
          </div>
        </div>

        <div class="massage-container">
          <div class="message-left">
            <img
              :src="msg.profilePicUrl || msg.defaultImg"
              class="message-avatar"
              :alt="`Profile of ${msg.username}`"
            />
            <a
              v-if="getDownloadUrl(msg)"
              :href="getDownloadUrl(msg)"
              class="message-download-under-avatar"
              target="_blank"
              rel="noopener noreferrer"
              title="Download"
            >⬇</a>
          </div>

          <span>
            <HighlightedResponse :markdown="msg.message" />
          </span>

          <template v-if="msg.image_path && msg.type === 'image'">
            <br /><br />
            <img
              :src="`${apiBaseUrl}/${msg.image_path}`"
              class="message-image"
              alt="Uploaded"
              @click="openModal(`${apiBaseUrl}/${msg.image_path}`, false)"
            />
          </template>

          <template v-else-if="msg.image_path">
            <br /><br />
            <video
              class="Webcam-video"
              style="cursor: pointer;"
              @click="openModal(`${apiBaseUrl}/${msg.image_path}`, true)"
            >
              <source :src="`${apiBaseUrl}/${msg.image_path}`" type="video/mp4" />
              {{ t('your_browser_not_support_video_tag') }}
            </video>
          </template>

          <div class="message-clear" />
        </div>
      </div>
    </div>

    <div ref="messagesEndRef" />

    <CustomModal
      :is-open="isModalOpen"
      :content-url="modalContentUrl"
      :is-video="modalIsVideo"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, API_STORAGE_BASE_URL, ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import HighlightedResponse from './HighlightedResponse.vue';
import CustomModal from './CustomModal.vue';

const { t } = useI18n();

const props = defineProps({
  messages:       Array,
  defaultMaleImage:   String,
  defaultFemaleImage: String,
  hasMore:        Boolean,
  loadingOlder:   Boolean,
});

defineEmits(['load-older']);

const apiBaseUrl       = API_BASE_URL;
const messagesEndRef   = ref(null);
const listRef          = ref(null);
const currentMessageId = ref(null);
const currentAudio     = ref(null);
const currentAudioUrl  = ref(null);
const loadingMessageId = ref(null);
const isModalOpen      = ref(false);
const modalContentUrl  = ref('');
const modalIsVideo     = ref(false);

let prevDate = null;

const processedMessages = computed(() =>
  (props.messages || []).map(msg => {
    const profilePicUrl = msg.profile_picture_path
      ? `${API_BASE_URL}${msg.profile_picture_path.replace('public/uploads', '/storage/uploads')}`
      : null;
    return {
      ...msg,
      profilePicUrl,
      defaultImg: msg.gender === 'male' ? props.defaultMaleImage : props.defaultFemaleImage,
    };
  })
);

watch(() => props.messages, () => {
  nextTick(() => {
    if (messagesEndRef.value) messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  });
});

onUnmounted(() => {
  if (currentAudioUrl.value) URL.revokeObjectURL(currentAudioUrl.value);
});

const checkDate = (date) => {
  if (date !== prevDate) { prevDate = date; return date; }
  return null;
};

const openModal = (url, isVideo) => {
  modalContentUrl.value = url;
  modalIsVideo.value    = isVideo;
  isModalOpen.value     = true;
};

const getDownloadUrl = (msg) => {
  const raw = msg?.download_link;
  if (raw && typeof raw === 'string' && raw.startsWith('http')) return raw;
  const filePath = msg?.file_path;
  if (filePath && typeof filePath === 'string') {
    const cleaned = filePath.replace(/^\/+/, '').replace(/^storage\/?/, '');
    return `${API_STORAGE_BASE_URL.replace(/\/+$/, '')}/${cleaned}`;
  }
  if (raw && typeof raw === 'string' && raw.startsWith('/')) return `${API_BASE_URL}${raw}`;
  return null;
};

const handleToggleSpeech = async (text, gender, messageId) => {
  if (currentMessageId.value === messageId) {
    currentAudio.value?.pause();
    currentMessageId.value = null;
    currentAudio.value     = null;
    return;
  }

  currentAudio.value?.pause();
  if (currentAudioUrl.value) { URL.revokeObjectURL(currentAudioUrl.value); currentAudioUrl.value = null; }
  currentMessageId.value = null;
  currentAudio.value     = null;

  const voiceMap = { male: 'onyx', female: 'shimmer' };
  const voice    = voiceMap[gender] || 'nova';

  try {
    loadingMessageId.value = messageId;
    const startTime = Date.now();

    const response = await axios.post(
      `${API_BASE_URL}/api/chat/tts`,
      { text, voice, message_id: messageId },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` } }
    );

    if (response.status !== 200) throw new Error('Failed to fetch audio');

    const urlPath  = response.data.url.startsWith('/') ? response.data.url.substring(1) : response.data.url;
    const audioUrl = `${API_BASE_URL}/${urlPath}`;
    const audio    = new Audio(audioUrl);

    const remaining = Math.max(0, 800 - (Date.now() - startTime));
    setTimeout(() => {
      loadingMessageId.value = null;
      audio.play();
      currentAudio.value     = audio;
      currentMessageId.value = messageId;
      currentAudioUrl.value  = audioUrl;
      audio.onended = () => { currentMessageId.value = null; currentAudio.value = null; currentAudioUrl.value = null; };
    }, remaining);
  } catch (error) {
    console.error('Error generating speech:', error);
    setTimeout(() => { loadingMessageId.value = null; }, 500);
  }
};
</script>