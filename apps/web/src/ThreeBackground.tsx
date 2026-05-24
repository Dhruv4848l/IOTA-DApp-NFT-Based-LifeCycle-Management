import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 500;

    const COUNT = 110;
    const COLORS = [0x00d4ff, 0xa855f7, 0x06b6d4, 0x7c3aed, 0x00f5ff];
    const meshes: THREE.Mesh[] = [];
    const positions: THREE.Vector3[] = [];
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < COUNT; i++) {
      const geo = new THREE.SphereGeometry(1.8 + Math.random() * 1.2, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: COLORS[i % COLORS.length],
        transparent: true,
        opacity: 0.5 + Math.random() * 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const w = window.innerWidth * 0.48;
      const h = window.innerHeight * 0.48;
      mesh.position.set(
        (Math.random() - 0.5) * w * 2,
        (Math.random() - 0.5) * h * 2,
        (Math.random() - 0.5) * 80
      );
      meshes.push(mesh);
      positions.push(mesh.position);
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35,
        0
      ));
      scene.add(mesh);
    }

    // Line segments for connections
    const MAX_PAIRS = COUNT * COUNT;
    const linePositions = new Float32Array(MAX_PAIRS * 6);
    const lineColors = new Float32Array(MAX_PAIRS * 6);
    const lineGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute('position', posAttr);
    lineGeo.setAttribute('color', colAttr);
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.18 });
    const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegs);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 40;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const CONNECT_DIST = 160;
    let animId: number;

    const colorA = new THREE.Color(0x00d4ff);
    const colorB = new THREE.Color(0xa855f7);

    function animate() {
      animId = requestAnimationFrame(animate);

      const w = window.innerWidth * 0.48;
      const h = window.innerHeight * 0.48;

      for (let i = 0; i < COUNT; i++) {
        positions[i].addScaledVector(velocities[i], 1);
        if (positions[i].x > w) velocities[i].x = -Math.abs(velocities[i].x);
        if (positions[i].x < -w) velocities[i].x = Math.abs(velocities[i].x);
        if (positions[i].y > h) velocities[i].y = -Math.abs(velocities[i].y);
        if (positions[i].y < -h) velocities[i].y = Math.abs(velocities[i].y);
      }

      // Smooth camera parallax
      camera.position.x += (mouse.x - camera.position.x) * 0.025;
      camera.position.y += (mouse.y - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      // Build lines
      let idx = 0;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST && idx < MAX_PAIRS - 1) {
            const alpha = 1 - dist / CONNECT_DIST;
            const c = colorA.clone().lerp(colorB, i / COUNT);
            linePositions[idx * 6 + 0] = positions[i].x;
            linePositions[idx * 6 + 1] = positions[i].y;
            linePositions[idx * 6 + 2] = positions[i].z;
            linePositions[idx * 6 + 3] = positions[j].x;
            linePositions[idx * 6 + 4] = positions[j].y;
            linePositions[idx * 6 + 5] = positions[j].z;
            lineColors[idx * 6 + 0] = c.r * alpha;
            lineColors[idx * 6 + 1] = c.g * alpha;
            lineColors[idx * 6 + 2] = c.b * alpha;
            lineColors[idx * 6 + 3] = c.r * alpha;
            lineColors[idx * 6 + 4] = c.g * alpha;
            lineColors[idx * 6 + 5] = c.b * alpha;
            idx++;
          }
        }
      }
      lineGeo.setDrawRange(0, idx * 2);
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      meshes.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
