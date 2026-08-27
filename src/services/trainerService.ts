import { COMPANY_CALENDAR_SESSIONS } from '../data/companyCalendarDataset';

export interface TrainerDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: 'Primary Trainer' | 'Trainer' | 'Coordinator' | 'Evaluator';
  initials: string;
  assignedBootcampIds: string[];
  sessionCount: number;
}

// Compute initials dynamically
export const getTrainerInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TR';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Authoritative Central Trainer Directory
 * Extracted dynamically from the schedule dataset to ensure 100% data consistency.
 */
export const getCentralTrainerDirectory = (): TrainerDirectoryItem[] => {
  const trainerMap = new Map<string, TrainerDirectoryItem>();

  // Known Primary Roster from Schedule Excel
  const knownTrainers: Array<{ id: string; name: string; email: string; role: 'Primary Trainer' | 'Trainer' | 'Coordinator' | 'Evaluator' }> = [
    { id: 'tr-1', name: 'John Mathew', email: 'john.mathew@systechusa.com', role: 'Primary Trainer' },
    { id: 'tr-2', name: 'Sarah David', email: 'sarah.david@systechusa.com', role: 'Primary Trainer' },
    { id: 'tr-3', name: 'Alex Thomas', email: 'alex.thomas@systechusa.com', role: 'Primary Trainer' },
    { id: 'tr-4', name: 'Michael Paul', email: 'michael.paul@systechusa.com', role: 'Primary Trainer' },
    { id: 'tr-sn', name: 'Sneha', email: 'sneha@systechusa.com', role: 'Trainer' },
    { id: 'tr-it-1', name: 'Ramesh', email: 'ramesh@systechusa.com', role: 'Trainer' },
    { id: 'tr-hr-1', name: 'Anusha Roy', email: 'anusha.roy@systechusa.com', role: 'Coordinator' },
    { id: 'co-1', name: 'Priya Sharma', email: 'priya.sharma@systechusa.com', role: 'Coordinator' },
    { id: 'eval-1', name: 'Dinesh Kumar', email: 'dinesh.kumar@systechusa.com', role: 'Evaluator' },
  ];

  knownTrainers.forEach((kt) => {
    const key = kt.name.trim().toLowerCase();
    trainerMap.set(key, {
      id: kt.id,
      name: kt.name,
      email: kt.email,
      role: kt.role,
      initials: getTrainerInitials(kt.name),
      assignedBootcampIds: [],
      sessionCount: 0,
    });
  });

  // Extract dynamically from COMPANY_CALENDAR_SESSIONS
  COMPANY_CALENDAR_SESSIONS.forEach((session) => {
    const rawTrainer = session.trainerName || session.moduleOwner;
    if (
      !rawTrainer ||
      rawTrainer === 'L&D Team' ||
      rawTrainer === 'Executive Leadership' ||
      rawTrainer === 'L&D Leadership' ||
      rawTrainer === 'IT Ops'
    ) {
      return;
    }

    const norm = rawTrainer.trim().toLowerCase();
    let existingKey: string | undefined = undefined;

    for (const key of trainerMap.keys()) {
      if (key === norm || key.includes(norm) || norm.includes(key)) {
        existingKey = key;
        break;
      }
    }

    if (existingKey) {
      const item = trainerMap.get(existingKey)!;
      item.sessionCount += 1;
      if (session.bootcampId && !item.assignedBootcampIds.includes(session.bootcampId)) {
        item.assignedBootcampIds.push(session.bootcampId);
      }
    } else {
      const formattedName = rawTrainer.trim();
      const newKey = formattedName.toLowerCase();
      trainerMap.set(newKey, {
        id: `tr-gen-${trainerMap.size + 1}`,
        name: formattedName,
        email: `${formattedName.toLowerCase().replace(/\s+/g, '.')}@systechusa.com`,
        role: 'Trainer',
        initials: getTrainerInitials(formattedName),
        assignedBootcampIds: session.bootcampId ? [session.bootcampId] : [],
        sessionCount: 1,
      });
    }
  });

  return Array.from(trainerMap.values());
};

/**
 * Returns Primary Trainer for a given Bootcamp ID based on schedule session density
 */
export const getPrimaryTrainerForBootcamp = (bootcampId: string, fallbackName?: string): string => {
  const sessions = COMPANY_CALENDAR_SESSIONS.filter((s) => s.bootcampId === bootcampId);
  const trainerCounts = new Map<string, number>();

  sessions.forEach((s) => {
    const rawTrainer = s.trainerName || s.moduleOwner;
    if (
      rawTrainer &&
      rawTrainer !== 'L&D Team' &&
      rawTrainer !== 'Executive Leadership' &&
      rawTrainer !== 'L&D Leadership' &&
      rawTrainer !== 'IT Ops'
    ) {
      const normName = rawTrainer.trim();
      trainerCounts.set(normName, (trainerCounts.get(normName) || 0) + 1);
    }
  });

  if (trainerCounts.size > 0) {
    const sorted = Array.from(trainerCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  // If no calendar sessions exist for this bootcamp id, fallback to central directory or explicit fallback
  const directory = getCentralTrainerDirectory();
  const candidate = directory.find((t) => t.assignedBootcampIds.includes(bootcampId));
  if (candidate) return candidate.name;

  return fallbackName || 'Trainer not assigned';
};
