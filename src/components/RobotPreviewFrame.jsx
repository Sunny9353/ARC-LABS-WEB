import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "/robot-preview/robot_model.glb";

function readTheme() {
  if (typeof document === "undefined") return "dark";
  const selectedTheme = document.documentElement.dataset.theme;
  if (selectedTheme === "light" || selectedTheme === "dark") return selectedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getPixelRatio() {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  return Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
}

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose?.();
    });
  });
}

function RobotPreviewScene({ theme }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const isLightTheme = theme === "light";
    const sceneBackground = isLightTheme ? 0xf4f4f5 : 0x09090b;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneBackground);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLightTheme ? 1.12 : 1.28;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    let camera = null;
    let blenderCameraHalfHeight = null;
    let model = null;
    let head = null;
    let neutralHeadQuaternion = null;
    let faceFill = null;
    let animationFrameId = null;
    let hasPointerTarget = false;
    let disposed = false;

    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const pointerPlane = new THREE.Plane();
    const cameraWorldPosition = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    const headWorldPosition = new THREE.Vector3();
    const targetPlanePoint = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const currentHeadQuaternion = new THREE.Quaternion();
    const targetHeadQuaternion = new THREE.Quaternion();
    const clock = new THREE.Clock();
    const targetPlaneDepth = 0.08;
    const lookDamping = 8;

    const requestRender = () => {
      if (animationFrameId === null && !document.hidden && !disposed) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const updateViewport = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const aspect = width / height;

      if (camera?.isOrthographicCamera && blenderCameraHalfHeight !== null) {
        camera.left = -blenderCameraHalfHeight * aspect;
        camera.right = blenderCameraHalfHeight * aspect;
        camera.top = blenderCameraHalfHeight;
        camera.bottom = -blenderCameraHalfHeight;
        camera.updateProjectionMatrix();
      } else if (camera?.isPerspectiveCamera) {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      }

      renderer.setPixelRatio(getPixelRatio());
      renderer.setSize(width, height);
      requestRender();
    };

    function updatePointer(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(
        THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(1 - ((event.clientY - bounds.top) / bounds.height) * 2, -1, 1)
      );
      hasPointerTarget = true;
      requestRender();
    }

    function animate() {
      animationFrameId = null;
      const delta = Math.min(clock.getDelta(), 0.1);
      let needsAnotherFrame = false;

      if (head && camera && neutralHeadQuaternion) {
        currentHeadQuaternion.copy(head.quaternion);
        targetHeadQuaternion.copy(neutralHeadQuaternion);

        if (hasPointerTarget) {
          camera.getWorldPosition(cameraWorldPosition);
          camera.getWorldDirection(cameraDirection);
          head.getWorldPosition(headWorldPosition);

          const headDepth = Math.max(
            0.1,
            targetPlanePoint.copy(headWorldPosition).sub(cameraWorldPosition).dot(cameraDirection)
          );

          targetPlanePoint.copy(cameraWorldPosition).addScaledVector(cameraDirection, headDepth * targetPlaneDepth);
          pointerPlane.setFromNormalAndCoplanarPoint(cameraDirection, targetPlanePoint);
          raycaster.setFromCamera(pointer, camera);

          if (raycaster.ray.intersectPlane(pointerPlane, lookTarget)) {
            head.lookAt(lookTarget);
            targetHeadQuaternion.copy(head.quaternion);
          }
        }

        head.quaternion.copy(currentHeadQuaternion);
        const remainingAngle = head.quaternion.angleTo(targetHeadQuaternion);
        if (remainingAngle > 0.0005) {
          head.quaternion.slerp(targetHeadQuaternion, 1 - Math.exp(-lookDamping * delta));
          needsAnotherFrame = true;
        } else {
          head.quaternion.copy(targetHeadQuaternion);
        }
      }

      if (faceFill) {
        const fillWeight = hasPointerTarget ? Math.max(0, -pointer.x) * Math.max(0, -pointer.y) : 0;
        faceFill.intensity = (isLightTheme ? 320 : 520) + 420 * fillWeight;
      }

      if (camera) renderer.render(scene, camera);
      if (needsAnotherFrame) requestRender();
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/");
    dracoLoader.setDecoderConfig({ type: "wasm" });
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    scene.add(
      new THREE.HemisphereLight(
        isLightTheme ? 0xffffff : 0xd8e1de,
        isLightTheme ? 0xd4d4d8 : 0x050706,
        isLightTheme ? 1.45 : 1.05
      )
    );
    scene.add(new THREE.AmbientLight(isLightTheme ? 0xffffff : 0xb8c2bf, isLightTheme ? 0.72 : 0.58));

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;

        model = gltf.scene;
        let exportedCamera = null;
        scene.add(model);
        model.updateMatrixWorld(true);

        model.traverse((child) => {
          if (child.name === "Cabeza") head = child;
          if (child.isCamera && !exportedCamera) exportedCamera = child;

          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            const clonedMaterials = materials.map((material) => material.clone());

            clonedMaterials.forEach((material) => {
              if (/plane|floor|ground/i.test(child.name)) {
                material.color?.setHex(isLightTheme ? 0xe4e4e7 : 0x111113);
                material.roughness = Math.max(material.roughness ?? 0.7, 0.72);
              }
              material.needsUpdate = true;
            });

            child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
          }

          if (child.isLight) {
            if (child.name === "Spot Light") {
              child.castShadow = true;
              child.shadow.mapSize.set(2048, 2048);
              child.shadow.camera.near = 1;
              child.shadow.camera.far = 2000;
              child.shadow.bias = -0.0001;
              child.shadow.normalBias = 0.02;
            } else {
              child.castShadow = false;
            }

            const worldScale = new THREE.Vector3();
            child.getWorldScale(worldScale);
            const unitScale = (Math.abs(worldScale.x) + Math.abs(worldScale.y) + Math.abs(worldScale.z)) / 3;
            child.intensity *= unitScale * unitScale * 10;
          }
        });

        camera = exportedCamera;
        if (!camera) {
          throw new Error("robot_model.glb does not contain an exported camera.");
        }

        const cameraPosition = new THREE.Vector3();
        const cameraRotation = new THREE.Quaternion();
        camera.getWorldPosition(cameraPosition);
        camera.getWorldQuaternion(cameraRotation);
        scene.add(camera);
        camera.position.copy(cameraPosition);
        camera.quaternion.copy(cameraRotation);
        camera.scale.set(1, 1, 1);
        camera.updateMatrixWorld(true);

        if (camera.isOrthographicCamera) {
          blenderCameraHalfHeight = (camera.top - camera.bottom) / 2;
        }

        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const modelRadius = Math.max(size.x, size.y, size.z) || 10;

        const keyLight = new THREE.DirectionalLight(0xffffff, isLightTheme ? 2.25 : 2.8);
        keyLight.position.copy(center).add(new THREE.Vector3(modelRadius, modelRadius * 1.4, modelRadius));
        keyLight.target.position.copy(center);
        scene.add(keyLight, keyLight.target);

        const rimLight = new THREE.DirectionalLight(0x00dc82, isLightTheme ? 0.85 : 1.45);
        rimLight.position.copy(center).add(new THREE.Vector3(-modelRadius, modelRadius * 0.55, -modelRadius));
        rimLight.target.position.copy(center);
        scene.add(rimLight, rimLight.target);

        if (head) {
          head.lookAt(camera.position);
          neutralHeadQuaternion = head.quaternion.clone();

          faceFill = new THREE.PointLight(isLightTheme ? 0xffffff : 0xcff5e8, isLightTheme ? 260 : 180, 0, 2);
          const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
          faceFill.name = "Face Fill";
          faceFill.position.copy(camera.position).addScaledVector(cameraRight, -6).addScaledVector(cameraUp, -4);
          scene.add(faceFill);
        }

        dracoLoader.dispose();
        updateViewport();
        requestRender();
      },
      undefined,
      (error) => {
        dracoLoader.dispose();
        // Keep the page usable if the model asset is missing on a deployment.
        console.error("Unable to load robot_model.glb:", error);
      }
    );

    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(mount);
    renderer.domElement.addEventListener("pointerenter", updatePointer, { passive: true });
    renderer.domElement.addEventListener("pointermove", updatePointer, { passive: true });

    const onVisibilityChange = () => {
      if (document.hidden && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      } else if (!document.hidden) {
        clock.getDelta();
        requestRender();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("pointerenter", updatePointer);
      renderer.domElement.removeEventListener("pointermove", updatePointer);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      dracoLoader.dispose();
      if (model) disposeObject(model);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [theme]);

  return <div ref={mountRef} className="robot-preview-canvas" aria-hidden="true" />;
}

export default function RobotPreviewFrame({ className, title, view = "home" }) {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setTheme(readTheme());
    const observer = new MutationObserver(updateTheme);

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className} role="img" aria-label={title || "Interactive robot preview"} data-view={view}>
      <RobotPreviewScene theme={theme} />
    </div>
  );
}
