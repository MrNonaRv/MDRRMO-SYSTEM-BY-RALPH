import React, { useEffect, useRef } from 'react';

export const SmokeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000 };
    let hue = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Spawn particles on mouse move
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 30,
          y: mouse.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 1.5, // drift upwards
          life: 0,
          maxLife: Math.random() * 80 + 60,
          size: Math.random() * 30 + 20,
          color: `hsl(${hue + Math.random() * 30}, 80%, 60%)`
        });
      }
      hue += 2; // Cycle colors
      if (hue > 360) hue = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.size += 0.8; // expand
        
        const progress = p.life / p.maxLife;
        const opacity = Math.max(0, 1 - progress);
        
        ctx.save();
        ctx.globalAlpha = opacity * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
        
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          i--;
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(20px)' }}
    />
  );
};
