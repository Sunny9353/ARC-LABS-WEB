import React, { useEffect, useRef, useState } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const CircularGallery = React.forwardRef(
  ({ items, className, radius = 520, autoRotateSpeed = 0.035, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        setRotation(scrollProgress * 360);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling) {
          setRotation((prev) => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, autoRotateSpeed]);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="ARC LABS circular training gallery"
        className={cn("circular-gallery", className)}
        {...props}
      >
        <div
          className="circular-gallery-track"
          style={{
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {items.map((item, index) => {
            const itemAngle = index * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.32, 1 - normalizedAngle / 180);

            return (
              <article
                key={item.photo.url}
                className="circular-gallery-item"
                aria-label={item.common}
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  opacity,
                }}
              >
                <img src={item.photo.url} alt={item.photo.text} style={{ objectPosition: item.photo.pos || "center" }} />
                <div className="circular-gallery-caption">
                  <h3>{item.common}</h3>
                  <p>{item.binomial}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
