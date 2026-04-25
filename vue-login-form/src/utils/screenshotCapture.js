import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export function captureScreenshot(stlFile) {
  return new Promise((resolve, reject) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, 453 / 160, 0.1, 1000);
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0, 50);

    const loader = new STLLoader();
    loader.load(URL.createObjectURL(stlFile), (stlGeometry) => {
      if (!stlGeometry) {
        reject(new Error('Failed to load STL file or invalid geometry.'));
        return;
      }
      const material = new THREE.MeshPhongMaterial({
        color: 0xAAAAAA,
        specular: 0x222222,
        shininess: 100,
      });
      const stlModel = new THREE.Mesh(stlGeometry, material);
      scene.add(stlModel);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(453, 160);
      renderer.setClearColor(0xffffff, 1);
      renderer.render(scene, camera);

      resolve(renderer.domElement.toDataURL('image/png'));
    }, undefined, reject);
  });
}