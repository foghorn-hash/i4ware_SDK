import * as THREE from 'three';

export function setupSceneMaterialsAndLighting(scene) {
    // Material settings
    const material = new THREE.MeshPhongMaterial({
      color: 0xAAAAAA, // Base color of the material
      specular: 0x222222, // Specular highlight color
      shininess: 100, // Shininess of the material
    });
  
    // Lighting settings
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color, Intensity
    directionalLight.position.set(1, 1, 1); // Direction of the light
  
    // Add objects to the scene
    scene.add(ambientLight);
    scene.add(directionalLight);
  
    return material; // Return the material for use in adding objects to the scene
  }

export function setupCamera(fov, aspectRatio, nearClip, farClip) {
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearClip, farClip);
    camera.lookAt(0, 0, 0) // camera is pointing to x, y, z 
    camera.position.set(0, 0, 50); // camera position x, y, z
    return camera
  }   