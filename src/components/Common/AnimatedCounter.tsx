import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  suffix = '',
  className = '',
}) => {
  const targetNumber = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
  const hasPercentage = typeof value === 'string' && value.includes('%');
  const finalSuffix = suffix || (hasPercentage ? '%' : '');

  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOutQuad * targetNumber));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetNumber);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetNumber, duration]);

  return (
    <span className={`animated-counter-value ${className}`}>
      {count}
      {finalSuffix}
    </span>
  );
};
