import React, { createContext, useContext, useState } from 'react';
import {
  Bootcamp,
  BootcampModule,
  BootcampEnrollment,
  User,
  BootcampFilterState,
  BootcampType,
} from '../types/bootcamp';
import {
  MOCK_BOOTCAMPS,
  MOCK_USERS,
  INITIAL_BOOTCAMP_MODULES,
  INITIAL_BOOTCAMP_ENROLLMENTS,
} from '../data/bootcampMockData';
import { INITIAL_TRAINEES } from '../data/traineeMockData';
import { getCentralTrainerDirectory } from '../services/trainerService';

interface BootcampContextType {
  bootcamps: Bootcamp[];
  trainers: User[];
  coordinators: User[];
  allTrainees: User[];
  modulesMap: Record<string, BootcampModule[]>;
  enrollmentsMap: Record<string, BootcampEnrollment[]>;
  filterState: BootcampFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<BootcampFilterState>>;
  createBootcamp: (
    data: Partial<Bootcamp>,
    selectedModules?: string[],
    selectedTraineeIds?: string[]
  ) => void;
  updateBootcamp: (
    id: string,
    data: Partial<Bootcamp>,
    selectedModules?: string[],
    selectedTraineeIds?: string[]
  ) => void;
  duplicateBootcamp: (
    id: string,
    newParams: { name: string; code: string; startDate: string; endDate: string }
  ) => void;
  archiveBootcamp: (id: string) => void;
  deleteBootcamp: (id: string) => void;
  addModuleToBootcamp: (bootcampId: string, moduleData: Partial<BootcampModule>) => void;
  updateModule: (bootcampId: string, moduleId: string, data: Partial<BootcampModule>) => void;
  deleteModule: (bootcampId: string, moduleId: string) => void;
  reorderModules: (bootcampId: string, fromIndexOrModules: number | BootcampModule[], toIndex?: number) => void;
  addTraineesToBootcamp: (bootcampId: string, traineeIds: string[]) => void;
  removeTraineeFromBootcamp: (bootcampId: string, traineeId: string) => void;
  createFromPreviousYear: (sourceBootcampId: string, targetYear: number) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const BootcampContext = createContext<BootcampContextType | undefined>(undefined);

export const BootcampProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>(MOCK_BOOTCAMPS);
  const [modulesMap, setModulesMap] = useState<Record<string, BootcampModule[]>>(
    INITIAL_BOOTCAMP_MODULES
  );
  const [enrollmentsMap, setEnrollmentsMap] = useState<Record<string, BootcampEnrollment[]>>(
    INITIAL_BOOTCAMP_ENROLLMENTS
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const centralDirectory = getCentralTrainerDirectory();
  const trainers: User[] = centralDirectory
    .filter((t) => t.role === 'Primary Trainer' || t.role === 'Trainer')
    .map((t) => ({
      id: t.id,
      employeeId: `EMP-${t.id.toUpperCase()}`,
      name: t.name,
      email: t.email,
      role: 'Trainer',
    }));

  const coordinators: User[] = centralDirectory
    .filter((t) => t.role === 'Coordinator')
    .map((t) => ({
      id: t.id,
      employeeId: `EMP-${t.id.toUpperCase()}`,
      name: t.name,
      email: t.email,
      role: 'Coordinator',
    }));
  const allTrainees = INITIAL_TRAINEES.map((t) => ({
    id: t.id,
    employeeId: t.employeeId,
    name: t.name,
    email: t.email,
    role: 'Trainee' as const,
    avatar: t.avatar,
  }));

  const [filterState, setFilterState] = useState<BootcampFilterState>({
    searchQuery: '',
    status: 'All',
    trainer: 'All',
    technology: 'All',
    bootcampYear: 2026,
    bootcampType: 'All',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getTrainerName = (id: string) =>
    trainers.find((t) => t.id === id)?.name || 'Assigned Trainer';

  const getCoordinatorName = (id: string) =>
    coordinators.find((c) => c.id === id)?.name || 'L&D Coordinator';

  // 1. Create Bootcamp
  const createBootcamp = (
    data: Partial<Bootcamp>,
    selectedModules: string[] = ['SQL', 'Python'],
    selectedTraineeIds: string[] = []
  ) => {
    const newId = 'bc-' + Date.now();
    const type: BootcampType = data.bootcampType || 'BOOTCAMP';
    const year = data.bootcampYear || 2026;

    const newBootcamp: Bootcamp = {
      id: newId,
      name: data.name || 'New Technical Bootcamp',
      code: data.code || `DE-${type === 'BOOTCAMP' ? 'B' : 'L'}-${year}-B01`,
      bootcampType: type,
      bootcampYear: year,
      cohortName: data.cohortName || 'Cohort 01',
      description: data.description || 'Enterprise technical skill acceleration program.',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: data.status || 'Active',
      primaryTrainerId: data.primaryTrainerId || trainers[0]?.id || 'tr-1',
      primaryTrainerName: getTrainerName(data.primaryTrainerId || trainers[0]?.id || 'tr-1'),
      additionalTrainerId: data.additionalTrainerId,
      additionalTrainerName: data.additionalTrainerId ? getTrainerName(data.additionalTrainerId) : undefined,
      coordinatorId: data.coordinatorId || coordinators[0]?.id || 'co-1',
      coordinatorName: getCoordinatorName(data.coordinatorId || coordinators[0]?.id || 'co-1'),
      traineesCount: selectedTraineeIds.length,
      modulesCount: selectedModules.length,
      progressPercent: 0,
      attendancePercent: 100,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setBootcamps((prev) => [newBootcamp, ...prev]);

    // Create Modules
    const newModules: BootcampModule[] = selectedModules.map((mName, idx) => ({
      id: `m-${newId}-${idx}`,
      bootcampId: newId,
      name: mName,
      description: `${mName} curriculum module`,
      sequence: idx + 1,
      plannedDuration: '2 Weeks',
      status: 'Not Started',
      stage: mName.includes('SQL') || mName.includes('Python') ? 'Common Foundation' : 'Shared',
    }));
    setModulesMap((prev) => ({ ...prev, [newId]: newModules }));

    showToast('Bootcamp cohort launched successfully!');
  };

  // 2. Update Bootcamp
  const updateBootcamp = (
    id: string,
    data: Partial<Bootcamp>,
    selectedModules?: string[],
    selectedTraineeIds?: string[]
  ) => {
    setBootcamps((prev) =>
      prev.map((bc) => {
        if (bc.id === id) {
          return {
            ...bc,
            ...data,
            primaryTrainerName: data.primaryTrainerId ? getTrainerName(data.primaryTrainerId) : bc.primaryTrainerName,
            coordinatorName: data.coordinatorId ? getCoordinatorName(data.coordinatorId) : bc.coordinatorName,
            traineesCount: selectedTraineeIds ? selectedTraineeIds.length : bc.traineesCount,
            modulesCount: selectedModules ? selectedModules.length : bc.modulesCount,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return bc;
      })
    );

    showToast('Bootcamp updated successfully');
  };

  // 3. Duplicate Bootcamp
  const duplicateBootcamp = (
    id: string,
    newParams: { name: string; code: string; startDate: string; endDate: string }
  ) => {
    const existing = bootcamps.find((b) => b.id === id);
    if (!existing) return;

    const newId = 'bc-' + Date.now();
    const duplicated: Bootcamp = {
      ...existing,
      id: newId,
      name: newParams.name,
      code: newParams.code,
      startDate: newParams.startDate,
      endDate: newParams.endDate,
      status: 'Planned',
      traineesCount: 0,
      progressPercent: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setBootcamps((prev) => [duplicated, ...prev]);

    const existingModules = modulesMap[id] || [];
    const copiedModules = existingModules.map((m, idx) => ({
      ...m,
      id: `m-${newId}-${idx}`,
      bootcampId: newId,
      status: 'Not Started' as const,
    }));

    setModulesMap((prev) => ({ ...prev, [newId]: copiedModules }));
    showToast('Bootcamp duplicated as new draft');
  };

  // 4. Create From Previous Year (Annual Duplication)
  const createFromPreviousYear = (sourceBootcampId: string, targetYear: number) => {
    const source = bootcamps.find((b) => b.id === sourceBootcampId);
    if (!source) return;

    const newId = 'bc-yr-' + Date.now();
    const newCode = source.code.replace(String(source.bootcampYear), String(targetYear));

    const cloned: Bootcamp = {
      ...source,
      id: newId,
      name: `${source.name} (${targetYear})`,
      code: newCode,
      bootcampYear: targetYear,
      status: 'Planned',
      progressPercent: 0,
      traineesCount: 0,
      attendancePercent: 100,
      startDate: `${targetYear}-01-19`,
      endDate: `${targetYear}-05-18`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setBootcamps((prev) => [cloned, ...prev]);

    const sourceModules = modulesMap[sourceBootcampId] || [];
    const clonedModules = sourceModules.map((m, idx) => ({
      ...m,
      id: `m-${newId}-${idx}`,
      bootcampId: newId,
      status: 'Not Started' as const,
    }));

    setModulesMap((prev) => ({ ...prev, [newId]: clonedModules }));
    showToast(`Created ${targetYear} cohort structure from ${source.bootcampYear} reference!`);
  };

  // 5. Archive Bootcamp
  const archiveBootcamp = (id: string) => {
    setBootcamps((prev) =>
      prev.map((bc) => (bc.id === id ? { ...bc, status: 'Archived' as const } : bc))
    );
    showToast('Bootcamp archived successfully');
  };

  // 6. Delete Bootcamp
  const deleteBootcamp = (id: string) => {
    const target = bootcamps.find((b) => b.id === id);
    setBootcamps((prev) => prev.filter((bc) => bc.id !== id));
    showToast(`Bootcamp "${target?.name || 'Cohort'}" deleted permanently`);
  };

  const addModuleToBootcamp = (bootcampId: string, moduleData: Partial<BootcampModule>) => {
    const existing = modulesMap[bootcampId] || [];
    const newModule: BootcampModule = {
      id: `m-${bootcampId}-${Date.now()}`,
      bootcampId,
      name: moduleData.name || 'New Module',
      description: moduleData.description || '',
      sequence: moduleData.sequence || existing.length + 1,
      plannedDuration: moduleData.plannedDuration || '1 Week',
      status: moduleData.status || 'Not Started',
      stage: moduleData.stage || 'Common Foundation',
    };

    setModulesMap((prev) => ({
      ...prev,
      [bootcampId]: [...(prev[bootcampId] || []), newModule],
    }));

    setBootcamps((prev) =>
      prev.map((b) => (b.id === bootcampId ? { ...b, modulesCount: (b.modulesCount || 0) + 1 } : b))
    );

    showToast('Module added to bootcamp');
  };

  const updateModule = (bootcampId: string, moduleId: string, data: Partial<BootcampModule>) => {
    setModulesMap((prev) => ({
      ...prev,
      [bootcampId]: (prev[bootcampId] || []).map((m) => (m.id === moduleId ? { ...m, ...data } : m)),
    }));
    showToast('Module updated successfully');
  };

  const deleteModule = (bootcampId: string, moduleId: string) => {
    setModulesMap((prev) => ({
      ...prev,
      [bootcampId]: (prev[bootcampId] || []).filter((m) => m.id !== moduleId),
    }));
    showToast('Module deleted');
  };

  const reorderModules = (bootcampId: string, fromIndexOrModules: number | BootcampModule[], toIndex?: number) => {
    setModulesMap((prev) => {
      const current = [...(prev[bootcampId] || [])];
      if (Array.isArray(fromIndexOrModules)) {
        return { ...prev, [bootcampId]: fromIndexOrModules };
      } else if (typeof fromIndexOrModules === 'number' && typeof toIndex === 'number') {
        if (toIndex >= 0 && toIndex < current.length) {
          const item = current.splice(fromIndexOrModules, 1)[0];
          current.splice(toIndex, 0, item);
          const resequenced = current.map((m, i) => ({ ...m, sequence: i + 1 }));
          return { ...prev, [bootcampId]: resequenced };
        }
      }
      return prev;
    });
    showToast('Module sequence reordered');
  };

  const addTraineesToBootcamp = (bootcampId: string, traineeIds: string[]) => {
    const newEnrollments: BootcampEnrollment[] = traineeIds.map((tId, idx) => {
      const traineeObj = INITIAL_TRAINEES.find((t) => t.id === tId) || INITIAL_TRAINEES[idx % INITIAL_TRAINEES.length];
      return {
        id: `en-${bootcampId}-${tId}`,
        bootcampId,
        traineeId: tId,
        trainee: {
          id: traineeObj.id,
          employeeId: traineeObj.employeeId,
          name: traineeObj.name,
          email: traineeObj.email,
          role: 'Trainee',
          department: traineeObj.department,
          primaryDomain: traineeObj.primaryDomain,
          joiningDate: traineeObj.joiningDate,
          companyOutcome: traineeObj.companyOutcome,
          avgScorePercent: traineeObj.avgScorePercent,
        },
        enrollmentDate: new Date().toISOString().split('T')[0],
        enrollmentStatus: (traineeObj.learningStatus as any) || 'On Track',
        progressPercent: traineeObj.progressPercent || 0,
        attendancePercent: traineeObj.attendancePercent || 100,
      };
    });

    setEnrollmentsMap((prev) => ({ ...prev, [bootcampId]: newEnrollments }));
    setBootcamps((prev) =>
      prev.map((b) => (b.id === bootcampId ? { ...b, traineesCount: traineeIds.length } : b))
    );

    showToast(`Updated bootcamp roster with ${traineeIds.length} trainees`);
  };

  const removeTraineeFromBootcamp = (bootcampId: string, traineeId: string) => {
    setEnrollmentsMap((prev) => ({
      ...prev,
      [bootcampId]: (prev[bootcampId] || []).filter((e) => e.traineeId !== traineeId),
    }));

    setBootcamps((prev) =>
      prev.map((b) =>
        b.id === bootcampId ? { ...b, traineesCount: Math.max(0, b.traineesCount - 1) } : b
      )
    );

    showToast('Trainee removed from bootcamp roster');
  };

  return (
    <BootcampContext.Provider
      value={{
        bootcamps,
        trainers,
        coordinators,
        allTrainees,
        modulesMap,
        enrollmentsMap,
        filterState,
        setFilterState,
        createBootcamp,
        updateBootcamp,
        duplicateBootcamp,
        archiveBootcamp,
        deleteBootcamp,
        addModuleToBootcamp,
        updateModule,
        deleteModule,
        reorderModules,
        addTraineesToBootcamp,
        removeTraineeFromBootcamp,
        createFromPreviousYear,
        toastMessage,
        showToast,
      }}
    >
      {children}

      {toastMessage && (
        <div className="toast-notification-banner" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </BootcampContext.Provider>
  );
};

export const useBootcamps = () => {
  const context = useContext(BootcampContext);
  if (!context) {
    throw new Error('useBootcamps must be used within a BootcampProvider');
  }
  return context;
};
