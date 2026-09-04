import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, CheckCircle2, Target, Ticket } from 'lucide-react';

export const CertificationOrbit: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`hero-orbit-wrapper ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Radial Glow behind Central Sphere */}
      <div className={`orbit-glow-halo ${isHovered ? 'active' : ''}`} />

      {/* 3 Concentric SVG Orbit Rings */}
      <svg className="hero-orbit-svg" viewBox="0 0 220 160">
        <circle cx="110" cy="80" r="30" className="orbit-ring ring-inner" />
        <circle cx="110" cy="80" r="52" className="orbit-ring ring-middle" />
        <circle cx="110" cy="80" r="72" className="orbit-ring ring-outer" />
      </svg>

      {/* Central Core Sphere - AWARD / CERTIFICATE ICON */}
      <motion.div
        className="orbit-center-core text-teal-600 dark:text-teal-400 flex items-center justify-center bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/30 rounded-full"
        animate={{
          scale: isHovered ? 1.08 : [1, 1.06, 1],
          y: isHovered ? -3 : 0,
        }}
        transition={{
          scale: isHovered
            ? { duration: 0.25 }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 0.25 },
        }}
      >
        <Award size={24} className="text-teal-600 dark:text-teal-400" />
      </motion.div>

      {/* Rotating Layer 1 (Outer Clockwise: 24s / 12s on hover) */}
      <motion.div
        className="orbit-layer layer-outer"
        animate={{ rotate: 360 }}
        transition={{
          duration: isHovered ? 12 : 24,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Node 1: Top Right - Partnership Requirements */}
        <motion.div
          className="orbit-floating-node node-1"
          animate={{ scale: isHovered ? 1.1 : 1, x: isHovered ? 4 : 0, y: isHovered ? -4 : 0 }}
          title="Partnership Requirements"
        >
          <ShieldCheck size={14} />
        </motion.div>

        {/* Node 2: Bottom Left - Exam Vouchers */}
        <motion.div
          className="orbit-floating-node node-2"
          animate={{ scale: isHovered ? 1.1 : 1, x: isHovered ? -4 : 0, y: isHovered ? 4 : 0 }}
          title="Exam Vouchers & Budget"
        >
          <Ticket size={14} />
        </motion.div>
      </motion.div>

      {/* Rotating Layer 2 (Middle Counter-Clockwise: 18s / 9s on hover) */}
      <motion.div
        className="orbit-layer layer-middle"
        animate={{ rotate: -360 }}
        transition={{
          duration: isHovered ? 9 : 18,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Node 3: Top Left - Certified Talent */}
        <motion.div
          className="orbit-floating-node node-3"
          animate={{ scale: isHovered ? 1.1 : 1, x: isHovered ? -4 : 0, y: isHovered ? -4 : 0 }}
          title="Certified Talent"
        >
          <CheckCircle2 size={14} />
        </motion.div>

        {/* Node 4: Bottom Right - Certification Targets */}
        <motion.div
          className="orbit-floating-node node-4"
          animate={{ scale: isHovered ? 1.1 : 1, x: isHovered ? 4 : 0, y: isHovered ? 4 : 0 }}
          title="Certification Targets"
        >
          <Target size={14} />
        </motion.div>
      </motion.div>
    </div>
  );
};
