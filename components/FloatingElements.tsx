'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const FloatingElements = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const butterflyCount = 12; // Increased count
    const heartsCount = 10; // Increased count

    // Create Butterflies
    for (let i = 0; i < butterflyCount; i++) {
      const butterfly = document.createElement('div');
      butterfly.className = 'absolute pointer-events-none opacity-0';
      butterfly.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 10C12 10 10 4 5 4C2 4 1 7 4 9C1 11 2 14 5 14C10 14 12 10 12 10Z" fill="#D4AF37" fill-opacity="0.8"/>
          <path d="M12 10C12 10 14 4 19 4C22 4 23 7 20 9C23 11 22 14 19 14C14 14 12 10 12 10Z" fill="#D4AF37" fill-opacity="0.6"/>
        </svg>
      `;
      container.appendChild(butterfly);
      animateElement(butterfly, true);
    }

    // Create Hearts
    for (let i = 0; i < heartsCount; i++) {
      const heart = document.createElement('div');
      heart.className = 'absolute pointer-events-none opacity-0';
      heart.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" fill-opacity="0.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" />
        </svg>
      `;
      container.appendChild(heart);
      animateElement(heart, false);
    }

    function animateElement(el: HTMLElement, isButterfly: boolean) {
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 100;
      
      gsap.set(el, {
        x: startX,
        y: startY,
        opacity: 0,
        scale: 0.6 + Math.random() * 0.6,
        rotation: Math.random() * 360
      });

      const duration = 12 + Math.random() * 15; // Slightly faster
      
      if (isButterfly) {
        gsap.to(el.querySelector('svg'), {
          scaleX: 0.1,
          duration: 0.15,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }

      gsap.to(el, {
        y: -300,
        x: startX + (Math.random() - 0.5) * 500,
        rotation: "+=720",
        opacity: 1,
        duration: duration,
        ease: "none",
        onComplete: () => {
          gsap.to(el, {
            opacity: 0,
            duration: 2,
            onComplete: () => animateElement(el, isButterfly)
          });
        }
      });

      gsap.to(el, {
        x: "+=80",
        duration: 1.5 + Math.random() * 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]" />;
};

export default FloatingElements;
