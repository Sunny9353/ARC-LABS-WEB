import { Card } from "./ui/card";
import { InteractiveRobotSpline } from "./ui/interactive-3d-robot";
import { Spotlight } from "./ui/spotlight";
import { useEffect, useRef, useState } from "react";

export function SplineSceneBasic() {
  const sceneRef = useRef(null);
  const [shouldMountScene, setShouldMountScene] = useState(false);

  useEffect(() => {
    const node = sceneRef.current;
    if (!node || shouldMountScene) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMountScene(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMountScene]);

  return (
    <Card className="spline-card">
      <Spotlight className="spline-spotlight" fill="white" />

      <div className="spline-layout">
        <div className="spline-copy">
          <div className="section-label">Interactive Lab Preview</div>
          <h2>
            Interactive 3D lab experiences for modern STEM classrooms.
          </h2>
          <p>
            Bring AI, IoT, and Robotics programs to life with immersive 3D
            scenes that help schools and colleges understand the lab ecosystem
            before installation.
          </p>
          <div className="spline-points">
            <span>AI + IoT labs</span>
            <span>Robotics kits</span>
            <span>Teacher training</span>
          </div>
        </div>

        <div className="spline-scene" ref={sceneRef}>
          {shouldMountScene ? (
            <InteractiveRobotSpline
              scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
              className="spline-canvas"
            />
          ) : (
            <div className="spline-idle-preview" aria-hidden="true">
              <span />
              <strong>3D lab preview</strong>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
