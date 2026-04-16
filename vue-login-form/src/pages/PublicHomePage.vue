<template>
  <div class="PublicHomePlayer">
    <video
      id="my-player"
      class="video-js PublicHomePlayer"
      preload="auto"
      autoplay
      loop
      playsinline
      controls
    >
      <source src="/blexsus-basic.mp4" type="video/mp4" />
      <p class="vjs-no-js">
        {{ t('video') }}
        {{ t('web') }}
        <a href="https://videojs.com/html5-video-support/" target="_blank">
          {{ t('support') }}
        </a>
      </p>
    </video>
    <div class="App-copyright">
      <img :src="logoCopy" alt="logo" class="App-logo-copyright" />
      {{ t('copyright') }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import logoCopy from '../assets/PoweredBy_TES_DarkWhite.png';
import 'video.js/dist/video-js.css';
import '../assets/css/PublicHome.css';

const { t, locale } = useI18n();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) {
    locale.value = lang;
  }
});
</script>