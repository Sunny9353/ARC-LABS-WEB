import { Card } from "./ui/card";
import { InteractiveRobotSpline } from "./ui/interactive-3d-robot";
import { Spotlight } from "./ui/spotlight";

export function SplineSceneBasic() {
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

        <div className="spline-scene">
          <InteractiveRobotSpline
            scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
            className="spline-canvas"
          />
        </div>
      </div>
    </Card>
  );
}
