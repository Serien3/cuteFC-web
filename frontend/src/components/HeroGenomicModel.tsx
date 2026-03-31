import React, { useEffect, useRef } from 'react';

const HeroGenomicModel: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 600;
    let height = 600;
    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw a highly aesthetic 3D DNA / Ion structure using points
      // We will create a twisting double helix wrapper inside a spherical field
      
      time += 0.01;

      // 1. Draw outer ambient sphere (Ion field)
      for (let i = 0; i < 80; i++) {
        const theta = i * Math.PI * 2 / 80 + time * 0.5;
        const radius = 200 + Math.sin(time * 2 + i) * 20;
        const x = centerX + Math.cos(theta) * radius * Math.cos(time * 0.2);
        const y = centerY + Math.sin(theta) * radius * 0.5 + Math.cos(time + i)*10;
        
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 150, 200, ${0.1 + Math.abs(Math.sin(time + i))*0.2})`;
        ctx.fill();
      }

      // 2. Draw DNA Helix core
      const strands = 2;
      const pointsPerStrand = 40;
      const helixRadius = 50;
      const helixHeight = 350;
      const yOffset = centerY - helixHeight / 2;

      for (let s = 0; s < strands; s++) {
        const phaseOffset = s * Math.PI;
        for (let i = 0; i < pointsPerStrand; i++) {
          const t = i / pointsPerStrand; // 0 to 1
          const y = yOffset + t * helixHeight;
          const angle = t * Math.PI * 6 + time + phaseOffset; // 3 full turns
          
          // 3D projection
          const z = Math.cos(angle); // -1 to 1
          const scale = 0.8 + (z + 1) * 0.2; // far = smaller
          
          const x = centerX + Math.sin(angle) * helixRadius * scale * (1 + Math.sin(time*0.5)*0.2);
          
          // draw point
          ctx.beginPath();
          ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
          
          if (s === 0) {
            ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + (z+1)*0.3})`; // Amber
            ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          } else {
            ctx.fillStyle = `rgba(59, 130, 246, ${0.4 + (z+1)*0.3})`; // Blue
            ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
          }
          ctx.shadowBlur = 10 * scale;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          
          // Connect strands horizontally
          if (s === 0 && i % 2 === 0) {
            const angle2 = t * Math.PI * 6 + time + Math.PI;
            const z2 = Math.cos(angle2);
            const scale2 = 0.8 + (z2 + 1) * 0.2;
            const x2 = centerX + Math.sin(angle2) * helixRadius * scale2 * (1 + Math.sin(time*0.5)*0.2);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.15 * scale})`;
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }
        }
      }

      // 3. Central glowing nucleus core
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.2, 'rgba(100, 150, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative ${className} pointer-events-none mix-blend-multiply`}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default HeroGenomicModel;
