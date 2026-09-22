import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Users, BookOpen } from 'lucide-react';
import { useBootcamps } from '../../context/BootcampContext';
import { Bootcamp, BootcampStatus, BootcampType } from '../../types/bootcamp';
import { CreateBootcampModal } from './CreateBootcampModal';
import { BootcampOrbit } from './BootcampOrbit';

interface BootcampManagementProps {
  onSelectBootcamp: (bootcampId: string, initialTab?: string) => void;
}

interface BootcampGroup {
  id: string;
  type: BootcampType;
  year: number;
  name: string;
  trainees: number;
  status: BootcampStatus;
  programs: Bootcamp[];
}

export const BootcampManagement: React.FC<BootcampManagementProps> = ({ onSelectBootcamp }) => {
  const { bootcamps, enrollmentsMap } = useBootcamps();
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [selectedType, setSelectedType] = useState<BootcampType | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const groups = useMemo(() => {
    const grouped = new Map<string, BootcampGroup>();
    bootcamps.forEach((bootcamp) => {
      const key = `${bootcamp.bootcampType}-${bootcamp.bootcampYear}`;
      const enrollments = enrollmentsMap[bootcamp.id] || [];
      const traineeCount = enrollments.length || bootcamp.traineesCount || 0;
      const existing = grouped.get(key);
      if (existing) {
        existing.programs.push(bootcamp);
        existing.trainees += traineeCount;
        if (bootcamp.status === 'Active') existing.status = 'Active';
        else if (bootcamp.status === 'Planned' && existing.status !== 'Active') existing.status = 'Planned';
      } else {
        grouped.set(key, {
          id: bootcamp.id,
          type: bootcamp.bootcampType,
          year: bootcamp.bootcampYear,
          name: `${bootcamp.bootcampType === 'LATERAL' ? 'Lateral Bootcamp' : 'Bootcamp'} ${bootcamp.bootcampYear}`,
          trainees: traineeCount,
          status: bootcamp.status,
          programs: [bootcamp],
        });
      }
    });
    return Array.from(grouped.values()).sort((a, b) => b.year - a.year || a.type.localeCompare(b.type));
  }, [bootcamps, enrollmentsMap]);

  const years = Array.from(new Set(groups.map((group) => group.year))).sort((a, b) => b - a);
  const visibleGroups = groups.filter(
    (group) =>
      (selectedYear === 'All' || group.year === selectedYear) &&
      (selectedType === 'All' || group.type === selectedType)
  );

  return (
    <motion.main className="bootcamp-groups-page page-container space-y-6" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      {/* UNIFIED HERO CARD WITH ANIMATED ORBIT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card mb-6"
      >
        {/* LEFT SECTION: ANIMATED LEARNING ORBIT */}
        <div className="hero-section-left">
          <BootcampOrbit />
        </div>

        {/* CENTER SECTION: EYEBROW, TITLE, SUBTITLE & METRICS */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D LEARNING OPERATIONS / BOOTCAMPS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hero-merged-title"
          >
            Bootcamps
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hero-merged-subtitle"
          >
            Manage L&amp;D bootcamp and lateral bootcamp cohorts by year.
          </motion.p>
        </div>

        {/* RIGHT SECTION: ACTION BUTTON */}
        <div className="hero-section-right">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <button
              type="button"
              className="bootcamp-new-btn hero-action-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={17} /> New Bootcamp
            </button>
          </motion.div>
        </div>
      </motion.div>

      <section className="bootcamp-group-filters" aria-label="Bootcamp filters">
        <div className="bootcamp-filter-set"><span>Year</span><div className="bootcamp-filter-pills"><button className={selectedYear === 'All' ? 'active' : ''} onClick={() => setSelectedYear('All')}>All Years</button>{years.map((year) => <button key={year} className={selectedYear === year ? 'active' : ''} onClick={() => setSelectedYear(year)}>{year}</button>)}</div></div>
        <div className="bootcamp-filter-set"><span>Type</span><div className="bootcamp-filter-pills"><button className={selectedType === 'All' ? 'active' : ''} onClick={() => setSelectedType('All')}>All Types</button><button className={selectedType === 'BOOTCAMP' ? 'active' : ''} onClick={() => setSelectedType('BOOTCAMP')}>Bootcamp</button><button className={selectedType === 'LATERAL' ? 'active' : ''} onClick={() => setSelectedType('LATERAL')}>Lateral Bootcamp</button></div></div>
      </section>

      <section className="bootcamp-group-grid">
        {visibleGroups.map((group, index) => (
          <motion.article className="bootcamp-group-card" key={group.id} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -2 }}>
            <div className="bootcamp-group-card-top"><span>{group.type === 'LATERAL' ? 'LATERAL BOOTCAMP' : 'BOOTCAMP'}</span><span className={`bootcamp-group-status ${group.status.toLowerCase()}`}><i />{group.status}</span></div>
            <div className="bootcamp-group-card-main"><h2>{group.name}</h2><span><Users size={15} /> {group.trainees} Trainees</span></div>
            <button type="button" className="bootcamp-view-btn" onClick={() => onSelectBootcamp(group.id)}>View Bootcamp <ArrowRight size={14} /></button>
          </motion.article>
        ))}
        {!visibleGroups.length && <div className="bootcamp-groups-empty"><strong>No bootcamp groups found</strong><span>Try another year or bootcamp type.</span></div>}
      </section>

      {showCreateModal && <CreateBootcampModal onClose={() => setShowCreateModal(false)} />}
    </motion.main>
  );
};
