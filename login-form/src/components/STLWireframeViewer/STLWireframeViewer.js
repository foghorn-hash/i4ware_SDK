import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const STLWireframeViewer = () => {
  const mount = useRef(null);
  const url = "spaceship.stl"; 

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const loader = new STLLoader();
    loader.load(url, function (geometry) {
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });

    camera.position.z = 5;

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.current.removeChild(renderer.domElement);
    };
  }, [url]);

  return <div ref={mount} />;
};

export default STLWireframeViewer;