<template>
  <div v-if="!data" class="loading-screen">
    <img :src="loadingSpinner" alt="Loading..." />
  </div>

  <div v-else class="mt-2 container-fluid">
    <div v-if="showMessage" class="alert alert-success">{{ showMessage }}</div>
    <h3 class="my-2">{{ t('myDetails') }}</h3>

    <div class="profile-image-container">
      <img
        v-if="!imageSrc"
        class="max-height-profile-pic"
        alt="Profile"
        :src="profilePicUrl || defaultImg"
        @error="(e) => e.target.src = defaultImg"
      />
      <ImageCropper
        v-if="imageSrc"
        :image-src="imageSrc"
        :show-cropper="showCropper"
        :aspect="1"
        crop-shape="round"
        @update:show-cropper="showCropper = $event"
        @cropped="onCropped"
      />
    </div>

    <div class="mt-3">
      <template v-if="!imageSrc">
        <button class="btn btn-info me-2" @click="fileInput.click()">
          {{ t('uploadImage') }}
        </button>
      </template>
      <template v-else>
        <button class="btn btn-danger me-2" @click="removeImage">
          {{ t('removeImage') }}
        </button>
        <button class="btn btn-info me-2" @click="showCropper = true">
          {{ t('cropImage') }}
        </button>
      </template>
      <button class="btn btn-primary" @click="isWebcamOpen = true">
        {{ t('capturePhoto') }}
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileSelected"
    />

    <WebcamCapture
      v-if="isWebcamOpen"
      @close="isWebcamOpen = false"
      @capture="onWebcamCapture"
      :load-user-data="loadUserData"
    />

    <div class="userForm mt-4">
      <form class="row g-3" @submit.prevent="handleSubmit">
        <div class="col-12">
          <label>{{ t('fullname') }}</label>
          <input v-model="form.name" type="text" class="form-control"
            :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="col-12">
          <label class="form-label">{{ t('gender') }}</label><br />
          <select v-model="form.gender" class="form-select select-gender-myprofile">
            <option value="male">{{ t('male') }}</option>
            <option value="female">{{ t('female') }}</option>
          </select>
          <div v-if="errors.gender" class="text-danger small">{{ errors.gender }}</div>
        </div>

        <div class="col-12 mt-4">
          <button type="submit" class="btn btn-success" :disabled="isSubmitting"
            style="margin-bottom:40px">
            {{ isSubmitting ? t('saving') : t('save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import * as Yup from 'yup';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import loadingSpinner from '../assets/tube-spinner.svg';
import DefaultMaleImage from '../assets/male-default-profile-picture.png';
import DefaultFemaleImage from '../assets/female-default-profile-picture.png';
import ImageCropper from '../components/ImageCropper.vue';
import WebcamCapture from '../components/WebcamCapture.vue';

const { t } = useI18n();

const data = ref(null);
const imageSrc = ref(null);
const croppedImageFile = ref(null);
const showCropper = ref(false);
const showMessage = ref(null);
const isWebcamOpen = ref(false);
const isSubmitting = ref(false);
const fileInput = ref(null);

const form = reactive({ name: '', gender: 'male' });
const errors = reactive({});

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

const profilePicUrl = computed(() =>
  data.value?.profile_picture_path
    ? API_BASE_URL + data.value.profile_picture_path.replaceAll('public/uploads', '/storage/uploads')
    : null
);

const defaultImg = computed(() =>
  data.value?.gender === 'female' ? DefaultFemaleImage : DefaultMaleImage
);

const loadUserData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/users/userdata`, { headers: authHeaders() });
    const responseData = res?.data?.data || res?.data || res;
    if (responseData && typeof responseData === 'object') {
      data.value = responseData;
      form.name = responseData.fullname || responseData.name || '';
      form.gender = responseData.gender || 'male';
    } else {
      data.value = {};
    }
  } catch (err) {
    console.error('Load error', err);
    data.value = {};
  }
};

const schema = () => Yup.object().shape({
  name:   Yup.string().required(t('nameRequired')),
  gender: Yup.string().required(t('genderRequired')),
});

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => delete errors[k]);
  try {
    await schema().validate(form, { abortEarly: false });
  } catch (err) {
    err.inner.forEach((e) => { errors[e.path] = e.message; });
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    if (croppedImageFile.value && typeof croppedImageFile.value !== 'string') {
      formData.append('file', croppedImageFile.value);
    }
    formData.append('fullname', form.name);
    formData.append('gender', form.gender);

    const res = await axios.post(`${API_BASE_URL}/api/manage/myprofile`, formData, {
      headers: authHeaders(),
    });

    const updatedUser = res?.data?.user || res?.data || res;
    if (updatedUser) {
      data.value = updatedUser;
      showMessage.value = t('saved');
      setTimeout(() => { showMessage.value = null; }, 2500);
      imageSrc.value = null;
      croppedImageFile.value = null;
    }
  } catch (err) {
    console.error('Submit error', err);
  } finally {
    isSubmitting.value = false;
  }
};

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    imageSrc.value = reader.result;
    showCropper.value = true;
  };
};

const onCropped = (blob) => {
  croppedImageFile.value = blob;
};

const removeImage = () => {
  imageSrc.value = null;
  croppedImageFile.value = null;
};

// Called by WebcamCapture
const onWebcamCapture = (img) => {
  imageSrc.value = img;
  isWebcamOpen.value = false;
  showCropper.value = true;
};

onMounted(() => loadUserData());
</script>