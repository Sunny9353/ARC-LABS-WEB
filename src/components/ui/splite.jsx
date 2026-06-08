import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineScene({ scene, className }) {
  return (
    <Suspense
      fallback={
        <div className="spline-loader-wrap">
          <span className="loader" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
