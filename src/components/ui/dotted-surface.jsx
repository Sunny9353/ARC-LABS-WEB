import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "../../lib/utils";

export function DottedSurface({ className, ...props }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const isMobileLike =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.connection?.saveData;
    if (isMobileLike) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const SEPARATION = 130;
    const AMOUNTX = 42;
    const AMOUNTY = 34;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1700, 8500);

    const camera = new THREE.PerspectiveCamera(58, 1, 1, 10000);
    camera.position.set(0, 360, 1180);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(scene.fog.color, 0);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let ix = 0; ix < AMOUNTX; ix += 1) {
      for (let iy = 0; iy < AMOUNTY; iy += 1) {
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0,
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        );
        colors.push(0.2, 0.95, 0.88);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 7,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const positionAttribute = geometry.attributes.position;
      const positionArray = positionAttribute.array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix += 1) {
        for (let iy = 0; iy < AMOUNTY; iy += 1) {
          const index = i * 3;
          positionArray[index + 1] =
            Math.sin((ix + count) * 0.3) * 46 +
            Math.sin((iy + count) * 0.5) * 46;
          i += 1;
        }
      }

      positionAttribute.needsUpdate = true;
      points.rotation.y = Math.sin(count * 0.018) * 0.06;
      renderer.render(scene, camera);
      count += 0.08;
    };

    resize();
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);

    sceneRef.current = { scene, renderer, animationId };

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={cn("dotted-surface", className)} {...props} />;
}
