<template>
  <div>
    <div v-if="showCropper" class="cropper-wrapper">
      <vue-cropper
        ref="cropperEl"
        :src="imageSrc"
        :aspect-ratio="1"
        :view-mode="1"
        style="max-height: 400px; width: 100%"
      />
      <button class="cropImageButton btn btn-primary mt-2" @click="cropImage">
        {{ t('cropImage') }}
      </button>
    </div>

    <img
      v-if="croppedImage && !showCropper"
      class="max-height-profile-pic"
      :src="croppedImage"
      alt="Cropped"
      @click="$emit('update:showCropper', true)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import getCroppedImg, { getCroppedImgFile } from '../utils/cropImage';
import '../assets/css/ImageCropper.css';

const props = defineProps({
  imageSrc:    { type: String,  required: true },
  showCropper: { type: Boolean, default: false },
});

const emit = defineEmits(['update:showCropper', 'cropped']);

const { t } = useI18n();

const cropperEl   = ref(null);
const croppedImage = ref(null);

const cropImage = async () => {
  try {
    const cropperData = cropperEl.value.getCropper().getData(true);

    const pixelCrop = {
      x:      cropperData.x,
      y:      cropperData.y,
      width:  cropperData.width,
      height: cropperData.height,
    };

    const croppedUrl  = await getCroppedImg(props.imageSrc, pixelCrop);
    const croppedFile = await getCroppedImgFile(props.imageSrc, pixelCrop);

    croppedImage.value = croppedUrl;
    emit('cropped', croppedFile);
    emit('update:showCropper', false);
  } catch (e) {
    console.error(e);
  }
};
</script>