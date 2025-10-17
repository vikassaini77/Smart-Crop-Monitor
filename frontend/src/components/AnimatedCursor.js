// src/components/AnimatedCursor.jsx
import { useEffect, useRef } from "react";
import "../styles/AnimatedCursor.css";

const AnimatedCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const animateFollower = () => {
      posX += (mouseX - posX) * 0.2;
      posY += (mouseY - posY) * 0.2;

      follower.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      requestAnimationFrame(animateFollower);
    };

    const addMagneticEffect = (e) => {
      const buttons = document.querySelectorAll(".magnetic-button");
      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        const offsetX = mouseX - (rect.left + rect.width / 2);
        const offsetY = mouseY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
        const maxDistance = 100;

        if (distance < maxDistance) {
          btn.style.transform = `translate(${offsetX * 0.25}px, ${offsetY * 0.25}px)`;
        } else {
          btn.style.transform = `translate(0, 0)`;
        }
      });
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousemove", addMagneticEffect);
    animateFollower();

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousemove", addMagneticEffect);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-follower" ref={followerRef}></div>
    </>
  );
};

export default AnimatedCursor;
