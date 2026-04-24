<template>
  <div v-if="isOpen" class="modal d-block" style="z-index: 1050;">
    <div class="modal-dialog" style="max-width: 80vw; max-height: 80vh; margin: 5vh auto;">
      <div class="modal-content" style="background: #000; height: 80vh;">
        <div style="position: relative; width: 100%; height: 100%;">
          <button
            @click="$emit('close')"
            style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 24px; color: #fff; cursor: pointer; z-index: 1;"
          >&times;</button>

          <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">

            <img
              v-if="!isVideo && contentUrl"
              :src="contentUrl"
              style="width: 100%; height: 100%; object-fit: contain;"
              alt="Media"
            />

            <video
              v-if="isVideo && contentUrl"
              ref="videoRef"
              :src="contentUrl"
              style="width: 100%; height: 100%; object-fit: contain;"
              @timeupdate="currentTime = videoRef.currentTime"
              @loadedmetadata="duration = videoRef.duration"
            />

            <div
              v-if="isVideo"
              @click="togglePlay"
              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; cursor: pointer; z-index: 2;"
            >
              <span style="font-size: 48px;">{{ isPlaying ? '⏹' : '▶' }}</span>
            </div>
          </div>

          <div
            v-if="isVideo"
            style="position: absolute; bottom: 10px; left: 10px; right: 10px; height: 10px; background: #333;"
          >
            <div
              :style="{ width: duration ? `${(currentTime / duration) * 100}%` : '0%', height: '100%', background: '#f00' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show" @click="$emit('close')" />
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen:     Boolean,
  contentUrl: String,
  isVideo:    Boolean,
});

defineEmits(['close']);

const videoRef   = ref(null);
const isPlaying  = ref(false);
const currentTime = ref(0);
const duration   = ref(0);

watch(() => props.isOpen, (val) => {
  if (!val) {
    currentTime.value = 0;
    duration.value    = 0;
    isPlaying.value   = false;
  }
});

const togglePlay = () => {
  if (!videoRef.value) return;
  if (isPlaying.value) {
    videoRef.value.pause();
  } else {
    videoRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};
</script>