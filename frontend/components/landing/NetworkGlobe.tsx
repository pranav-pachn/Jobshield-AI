"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface GlobeNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  connections: number[];
  pulsePhase: number;
}

export const NetworkGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesRef = useRef<GlobeNode[]>([]);
  const nodeParticlesRef = useRef<THREE.Points | null>(null);
  const lineGroupRef = useRef<THREE.Group | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "highp",
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Create nodes
    const nodeCount = 120;
    const nodes: GlobeNode[] = [];
    const sphereRadius = 1.5;

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
      const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
      const z = sphereRadius * Math.cos(phi);

      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        vz: (Math.random() - 0.5) * 0.001,
        radius: 0.03 + Math.random() * 0.02,
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dz = nodes[j].z - nodes[i].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 0.8 && nodes[i].connections.length < 4) {
          nodes[i].connections.push(j);
          if (nodes[j].connections.length < 4) {
            nodes[j].connections.push(i);
          }
        }
      }
    }

    nodesRef.current = nodes;

    // Create particle geometry for nodes
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    nodes.forEach((node, i) => {
      positions[i * 3] = node.x;
      positions[i * 3 + 1] = node.y;
      positions[i * 3 + 2] = node.z;

      // Color gradient from cyan to blue to purple
      const hue = (i / nodeCount) * 0.3 + 0.5; // Blue to cyan range
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    nodeParticlesRef.current = particles;

    // Create line group for connections
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);
    lineGroupRef.current = lineGroup;

    // Create initial lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x64c8ff,
      transparent: true,
      opacity: 0.2,
      fog: false,
    });

    nodes.forEach((node, i) => {
      node.connections.forEach((connIndex) => {
        if (i < connIndex) {
          const connNode = nodes[connIndex];
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array([node.x, node.y, node.z, connNode.x, connNode.y, connNode.z]),
              3
            )
          );
          const line = new THREE.Line(geometry, lineMaterial);
          lineGroup.add(line);
        }
      });
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0x64c8ff, 1);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the globe
      rotationRef.current.y += 0.0002;
      rotationRef.current.x += 0.00005;

      // Update node positions
      const positions = (particleGeometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

      nodes.forEach((node, i) => {
        // Apply velocity
        node.vx += (Math.random() - 0.5) * 0.0001;
        node.vy += (Math.random() - 0.5) * 0.0001;
        node.vz += (Math.random() - 0.5) * 0.0001;

        // Damping
        node.vx *= 0.98;
        node.vy *= 0.98;
        node.vz *= 0.98;

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Keep nodes on sphere surface
        const length = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
        if (length > 0) {
          node.x = (node.x / length) * sphereRadius;
          node.y = (node.y / length) * sphereRadius;
          node.z = (node.z / length) * sphereRadius;
        }

        positions[i * 3] = node.x;
        positions[i * 3 + 1] = node.y;
        positions[i * 3 + 2] = node.z;

        // Update pulse
        node.pulsePhase += 0.02;
      });

      (particleGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Update lines
      if (lineGroupRef.current) {
        lineGroupRef.current.children.forEach((line, idx) => {
          if (line instanceof THREE.Line) {
            const posAttr = (line.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
            const connectionIndex = Math.floor(idx / nodeCount);
            if (connectionIndex < nodes.length) {
              const node1 = nodes[connectionIndex];
              posAttr[0] = node1.x;
              posAttr[1] = node1.y;
              posAttr[2] = node1.z;

              if (
                node1.connections[idx % node1.connections.length] !== undefined
              ) {
                const node2 = nodes[node1.connections[idx % node1.connections.length]];
                posAttr[3] = node2.x;
                posAttr[4] = node2.y;
                posAttr[5] = node2.z;
              }
              (line.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            }
          }
        });
      }

      // Update particles group with rotation
      if (nodeParticlesRef.current) {
        nodeParticlesRef.current.rotation.x = rotationRef.current.x;
        nodeParticlesRef.current.rotation.y = rotationRef.current.y;
      }

      if (lineGroupRef.current) {
        lineGroupRef.current.rotation.x = rotationRef.current.x;
        lineGroupRef.current.rotation.y = rotationRef.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
};
