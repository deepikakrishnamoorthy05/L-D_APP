import React, { useRef, useState } from 'react';

interface Mouse3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees (default 2deg)
  style?: React.CSSProperties;
}

export const Mouse3DTiltCard: React.FC<Mouse3DTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 2,
  style: propStyle,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(900px) translateY(-6px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
      boxShadow: '0 18px 42px rgba(20, 70, 75, 0.14)',
      backgroundImage: `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(56, 232, 212, 0.15), transparent 70%)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(900px) translateY(0deg) rotateX(0deg) rotateY(0deg)',
      boxShadow: '0 10px 30px rgba(20,60,70,0.08), 0 2px 8px rgba(20,60,70,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
      backgroundImage: 'none',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`mouse-3d-tilt-card ${className}`}
      style={{ ...propStyle, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
