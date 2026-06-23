import { useEffect, useState } from "react";

function readTheme() {
  if (typeof document === "undefined") return "dark";
  const selectedTheme = document.documentElement.dataset.theme;
  if (selectedTheme === "light" || selectedTheme === "dark") return selectedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function RobotPreviewFrame({ className, title, loading = "lazy", view = "home" }) {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setTheme(readTheme());
    const observer = new MutationObserver(updateTheme);

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <iframe
      className={className}
      src={`/robot-preview/tiny_robo.html?theme=${theme}&view=${view}`}
      title={title}
      loading={loading}
      allow="fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
