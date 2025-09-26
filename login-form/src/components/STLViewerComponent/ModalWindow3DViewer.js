import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupCamera, setupSceneMaterialsAndLighting } from '../../utils/stlSceneSettings'
import './STLViewerComponent.css';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from "../../constants/apiConstants";

export function ModalWindow3DViewer({ stlFilename }) {
    const modalViewerRef = useRef(null);
  
    useEffect(() => {
      // Create a scene
      const scene = new THREE.Scene();
  
      // Create a camera
      const camera = setupCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      //camera.position.set(0, 0, 80); // camera position x, y, z
  
      // Create a renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(0.8 * window.innerWidth, 0.8 * window.innerHeight);
      renderer.setClearColor(0xffffff)
  
      loadStlFile(stlFilename, scene)
  
      // Render the scene with the camera
      renderer.render(scene, camera);
  
      // Attach the renderer's canvas to the DOM using the modalViewerRef
      if (modalViewerRef.current) {
        modalViewerRef.current.appendChild(renderer.domElement);
  
        // Create camera controls
        const controls = new OrbitControls(camera, renderer.domElement);
  
        function animate() {
          requestAnimationFrame(animate) // Schedule the animate function to be called before the next repaint of the browser window
          controls.update(); // Update camera controls for interaction
          renderer.render(scene, camera); // Render the scene
          }     
  
        // Start the animation loop
        animate()
      }
  
    }, []);
  
    async function loadStlFile(filenameWithoutExtension, scene) {
      try {
        // Load STL file URL using the function
        const stlUrl = await loadStlAndGetUrl(filenameWithoutExtension);
    
        // Load and display the 3D model
        const loader = new STLLoader();
  
        const geometry = await new Promise((resolve, reject) => {
          loader.load(stlUrl, resolve, undefined, reject);
        });
    
        // Create a mesh and add it to the scene
        const material = setupSceneMaterialsAndLighting(scene)
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      } catch (error) {
        console.error('Error loading STL file:', error);
      }
    }
    
    const loadStlAndGetUrl = async (filenameWithoutExtension) => {
      try {
        // Construct the URL for fetching the STL file
        const apiUrl = API_BASE_URL + '/api/stl/stl-file'; 
        const requestData = {
          filenameWithoutExtension: filenameWithoutExtension,
        };
    
        // Include the Authorization header with the bearer token
        const headers = {
          Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME),
        };
    
        // Send a POST request to the backend to retrieve the STL file as a Blob
        const response = await axios.post(apiUrl, requestData, {
          responseType: 'blob', // Specify the response type as a Blob
          headers: headers, // Include the Authorization header
        });
    
        // Create a URL for the Blob (STL file)
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const stlUrl = URL.createObjectURL(blob);
    
        //return null;
        return stlUrl;
      } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error for handling in the calling function
        }
      };  
  
  return <div className='stl-model' ref={modalViewerRef}></div>;
  }