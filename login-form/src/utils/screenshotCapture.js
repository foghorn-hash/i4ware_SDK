import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

/**
 * Capture a screenshot of a Three.js scene.
 * @param {THREE.File} stlFile - User submitted STL file.
 * @returns {Promise<string>} - Promise that resolves with a base64-encoded image data URL.
 */
export function captureScreenshot(stlFile) {
  return new Promise((resolve, reject) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, 453 / 160, 0.1, 1000);
    camera.lookAt(0, 0, 0) // camera is pointing to x, y, z 
    camera.position.set(0, 0, 50); // camera position x, y, z
    const loader = new STLLoader();

    // Load the selected STL file
    loader.load(URL.createObjectURL(stlFile), (stlGeometry) => {
      if (stlGeometry) {
        const material = new THREE.MeshPhongMaterial({
          color: 0xAAAAAA, // Base color of the material
          specular: 0x222222, // Specular highlight color
          shininess: 100, // Shininess of the material
        });
        const stlModel = new THREE.Mesh(stlGeometry, material);
        scene.add(stlModel);

        //some lighting adjustments:
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color, Intensity
        directionalLight.position.set(1, 1, 1); // Direction of the light
        scene.add(directionalLight);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(453, 160);
        renderer.setClearColor(0xffffff, 1);
  
        // Render the scene
        renderer.render(scene, camera);
  
        // Resolve the Promise with the rendered scene as a data URL
        resolve(renderer.domElement.toDataURL('image/png'));
        } else {
          // Reject the Promise with an error message
          reject(new Error('Failed to load STL file or invalid geometry.'));
          }
    }, undefined, (error) => {
      // Handle any loading errors
      reject(error);
    });
  });
}
  