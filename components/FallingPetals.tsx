'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const flowersCount = 20;
    const flowers: HTMLDivElement[] = [];

    for (let i = 0; i < flowersCount; i++) {
      const flower = document.createElement('div');
      flower.className = 'absolute pointer-events-none opacity-0';
      flower.innerHTML = `
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <path d="M50 0 C60 20 80 20 100 40 C80 60 60 60 50 100 C40 60 20 60 0 40 C20 20 40 20 50 0" fill="#D4AF37" fill-opacity="0.2" />
          <circle cx="50" cy="50" r="10" fill="#D4AF37" fill-opacity="0.3" />
        </svg>
      `;
      containerRef.current.appendChild(flower);
      flowers.push(flower);

      // Randomize initial position and size
      const size = Math.random() * 20 + 15;
      gsap.set(flower, {
        x: Math.random() * window.innerWidth,
        y: -100,
        width: size,
        height: size,
        rotation: Math.random() * 360,
        opacity: 0
      });

      // Animation
      gsap.to(flower, {
        y: window.innerHeight + 100,
        x: `+=${Math.random() * 200 - 100}`,
        rotation: `+=${Math.random() * 720 - 360}`,
        opacity: 1,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        delay: Math.random() * 10,
        ease: 'none',
        onRepeat: () => {
          gsap.set(flower, {
            x: Math.random() * window.innerWidth,
            y: -100,
            opacity: 0
          });
        }
      });
      
      // Horizontal floating effect
      gsap.to(flower, {
        x: `+=${Math.random() * 50 - 25}`,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    return () => {
      flowers.forEach(f => f.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />;
}
