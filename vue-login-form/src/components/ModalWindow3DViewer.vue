<template>
  <div class="stl-model" ref="viewerRef" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

const props = defineProps({ stlFilename: String });

const viewerRef = ref(null);
let renderer = null;
let animFrameId = null;

onMounted(async () => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 80);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(0.8 * window.innerWidth, 0.8 * window.innerHeight);
  renderer.setClearColor(0xffffff);

  if (viewerRef.value) {
    viewerRef.value.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    try {
      const stlUrl = await loadStlAndGetUrl(props.stlFilename);
      const loader = new STLLoader();
      const geometry = await new Promise((resolve, reject) => {
        loader.load(stlUrl, resolve, undefined, reject);
      });
      const material = new THREE.MeshPhongMaterial({ color: 0x606060, specular: 0x111111, shininess: 200 });
      const mesh = new THREE.Mesh(geometry, material);

      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      mesh.position.sub(center);
      scene.add(mesh);

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      camera.position.z = Math.max(size.x, size.y, size.z) * 1.5;
    } catch (error) {
      console.error('Error loading STL:', error);
    }

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }
});

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (renderer) renderer.dispose();
});

const loadStlAndGetUrl = async (filename) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/stl/stl-file`,
    { filenameWithoutExtension: filename },
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }
  );
  const blob = new Blob([response.data], { type: 'application/octet-stream' });
  return URL.createObjectURL(blob);
};
</script>