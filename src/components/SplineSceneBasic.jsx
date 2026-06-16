import { Card } from "./ui/card";
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

        <div className="spline-scene" aria-hidden="true">
          <div className="lab-console-visual">
            <div className="lab-console-panel">
              <div className="lab-console-header">
                <span />
                <span />
                <span />
              </div>
              <div className="lab-circuit-grid">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="lab-waveform">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="lab-kit-stack">
              <span>AI</span>
              <span>IoT</span>
              <span>ROB</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
