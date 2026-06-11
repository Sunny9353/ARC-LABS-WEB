import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function SplineScene({ scene, className, onLoad, onError }) {
  return (
    <Suspense
      fallback={
        <div className="spline-loader-wrap">
          <span className="loader" />
        </div>
      }
    >
      <Spline scene={scene} className={className} onLoad={onLoad} onError={onError} />
    </Suspense>
  );
}
