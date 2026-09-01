import React, { createContext, useContext, useState } from 'react';
import { Trainee, LearningStatus, EnrollmentStatus, CompanyOutcome } from '../types/trainee';
import { INITIAL_TRAINEES } from '../data/traineeMockData';
import { useBootcamps } from './BootcampContext';

export interface TraineeAuditRecord {
  id: string;
  fileName: string;
  importedAt: string;
  rowsProcessed: number;
  newRecords: number;
  updatedRecords: number;
  errors: number;
}

export interface BulkImportPayloadRow {
  employeeId: string;
  name: string;
  email: string;
  department?: string;
  role?: string;
  joiningDate?: string;
  bootcampCode?: string;
  bootcampId?: string;
  bootcampName?: string;
  learningStatus?: LearningStatus;
  enrollmentStatus?: EnrollmentStatus;
  companyOutcome?: CompanyOutcome;
  primaryDomain?: string;
  track?: string;
  isUpdate: boolean;
}

interface TraineeContextType {
  trainees: Trainee[];
  auditHistory: TraineeAuditRecord[];
  addTrainee: (data: Partial<Trainee>) => void;
  updateTrainee: (id: string, data: Partial<Trainee>) => void;
  changeBootcamp: (id: string, newBootcampId: string, newBootcampName: string, trainerName: string, effectiveDate: string) => void;
  archiveTrainee: (id: string) => void;
  bulkImportTrainees: (importRows: BulkImportPayloadRow[], fileName: string) => { newCount: number; updatedCount: number; skippedCount: number };
}

const LOCAL_STORAGE_KEY = 'ld_trainees';

const normalizeTraineeBootcamps = (list: Trainee[]): Trainee[] => {
  return list.map((t) => {
    let bId = t.bootcampId;
    let bName = t.bootcampName;

    if (bName === 'Power BI & DAX Intelligence' || (bId === 'bc-4' && bName === 'Power BI & DAX Intelligence')) {
      bId = 'bc-4';
      bName = 'Power BI & DAX Intelligence';
    } else if (bName === 'Power BI & DAX Intelligence') {
      bId = 'bc-4';
    } else if (
      bName === 'Lateral Data Engineering Acceleration' ||
      bName === 'Data Engineering' ||
      (bId === 'bc-3' && (bName === 'Data Engineering' || bName === 'Lateral Data Engineering Acceleration'))
    ) {
      bId = 'bc-3';
      bName = 'Lateral Data Engineering Acceleration';
    } else if (bName === 'SQL Data Architecture' || bId === 'bc-1') {
      bId = 'bc-1';
      bName = 'SQL Data Architecture';
    } else if (bName === 'Python Data Engineering' || bId === 'bc-2') {
      bId = 'bc-2';
      bName = 'Python Data Engineering';
    }

    return {
      ...t,
      bootcampId: bId,
      bootcampName: bName,
    };
  });
};

const loadPersistedTrainees = (): Trainee[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeTraineeBootcamps(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to load trainees from localStorage:', err);
  }
  return normalizeTraineeBootcamps(INITIAL_TRAINEES);
};

const TraineeContext = createContext<TraineeContextType | undefined>(undefined);

export const TraineeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainees, setTrainees] = useState<Trainee[]>(loadPersistedTrainees);
  const [auditHistory, setAuditHistory] = useState<TraineeAuditRecord[]>([]);
  const { showToast, bootcamps } = useBootcamps();

  // Persist trainees to localStorage on every change
  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trainees));
    } catch (err) {
      console.error('Failed to persist trainees to localStorage:', err);
    }
  }, [trainees]);

  // 1. Add Trainee
  const addTrainee = (data: Partial<Trainee>) => {
    const selectedBootcamp = bootcamps.find((b) => b.id === data.bootcampId) || bootcamps[0];

    const newTrainee: Trainee = {
      id: 'te-' + Date.now(),
      employeeId: data.employeeId || 'EMP' + Math.floor(100 + Math.random() * 900),
      name: data.name || 'New Trainee',
      email: data.email || 'trainee@systechusa.com',
      role: data.role || 'Associate Engineer',
      department: data.department || 'Data & Analytics',
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      bootcampId: selectedBootcamp.id,
      bootcampName: selectedBootcamp.name,
      primaryTrainerName: selectedBootcamp.primaryTrainerName,
      enrollmentDate: data.enrollmentDate || new Date().toISOString().split('T')[0],
      primaryDomain: data.primaryDomain || selectedBootcamp.name,
      learningStatus: data.learningStatus || 'On Track',
      enrollmentStatus: 'Active',
      progressPercent: data.progressPercent || 0,
      attendancePercent: 100,
      avgScorePercent: 80,
      assignmentsCompleted: 0,
      totalAssignments: 10,
      modulesCompleted: 0,
      totalModules: selectedBootcamp.modulesCount || 5,
      certificationsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTrainees((prev) => [newTrainee, ...prev]);
    showToast('Trainee added successfully');
  };

  // 2. Update Trainee
  const updateTrainee = (id: string, data: Partial<Trainee>) => {
    setTrainees((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const selectedBootcamp = data.bootcampId
            ? bootcamps.find((b) => b.id === data.bootcampId)
            : undefined;

          return {
            ...t,
            ...data,
            bootcampName: selectedBootcamp ? selectedBootcamp.name : t.bootcampName,
            primaryTrainerName: selectedBootcamp ? selectedBootcamp.primaryTrainerName : t.primaryTrainerName,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );
    showToast('Trainee updated successfully');
  };

  // 3. Change Bootcamp
  const changeBootcamp = (
    id: string,
    newBootcampId: string,
    newBootcampName: string,
    trainerName: string,
    effectiveDate: string
  ) => {
    setTrainees((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              bootcampId: newBootcampId,
              bootcampName: newBootcampName,
              primaryTrainerName: trainerName,
              enrollmentDate: effectiveDate,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
    showToast(`Transferred trainee to ${newBootcampName}`);
  };

  // 4. Archive Trainee
  const archiveTrainee = (id: string) => {
    setTrainees((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enrollmentStatus: 'Archived' as const } : t))
    );
    showToast('Trainee archived successfully');
  };

  // 5. Bulk Import Trainees
  const bulkImportTrainees = (
    importRows: BulkImportPayloadRow[],
    fileName: string
  ): { newCount: number; updatedCount: number; skippedCount: number } => {
    let newCount = 0;
    let updatedCount = 0;

    // Synchronously calculate new vs updated counts based on current state
    importRows.forEach((row) => {
      const cleanEmpId = row.employeeId ? row.employeeId.trim().toLowerCase() : '';
      const cleanEmail = row.email ? row.email.trim().toLowerCase() : '';

      const exists = trainees.some(
        (t) =>
          (cleanEmpId && t.employeeId.trim().toLowerCase() === cleanEmpId) ||
          (cleanEmail && t.email.trim().toLowerCase() === cleanEmail)
      );
      if (exists) {
        updatedCount++;
      } else {
        newCount++;
      }
    });

    setTrainees((prev) => {
      const updatedTrainees = [...prev];

      importRows.forEach((row) => {
        const cleanEmpId = row.employeeId ? row.employeeId.trim().toLowerCase() : '';
        const cleanEmail = row.email ? row.email.trim().toLowerCase() : '';

        const existingIndex = updatedTrainees.findIndex(
          (t) =>
            (cleanEmpId && t.employeeId.trim().toLowerCase() === cleanEmpId) ||
            (cleanEmail && t.email.trim().toLowerCase() === cleanEmail)
        );

        let matchedBootcamp = row.bootcampCode
          ? bootcamps.find((b) => b.code.toLowerCase() === row.bootcampCode?.trim().toLowerCase())
          : row.bootcampId
          ? bootcamps.find((b) => b.id === row.bootcampId)
          : undefined;

        // If code couldn't match, fallback to default or keep existing
        const targetBootcamp = matchedBootcamp || bootcamps[0];

        if (existingIndex >= 0) {
          // UPDATE EXISTING: Preserve performance & telemetry history, update master fields
          const existing = updatedTrainees[existingIndex];
          updatedTrainees[existingIndex] = {
            ...existing,
            name: row.name ? row.name.trim() : existing.name,
            email: row.email ? row.email.trim() : existing.email,
            department: row.department ? row.department.trim() : existing.department,
            role: row.role ? row.role.trim() : existing.role,
            joiningDate: row.joiningDate ? row.joiningDate.trim() : existing.joiningDate,
            bootcampId: matchedBootcamp ? matchedBootcamp.id : existing.bootcampId,
            bootcampName: matchedBootcamp ? matchedBootcamp.name : existing.bootcampName,
            primaryTrainerName: matchedBootcamp ? matchedBootcamp.primaryTrainerName : existing.primaryTrainerName,
            learningStatus: row.learningStatus || existing.learningStatus,
            enrollmentStatus: row.enrollmentStatus || existing.enrollmentStatus,
            companyOutcome: row.companyOutcome || existing.companyOutcome || 'Pending',
            primaryDomain: row.track || row.primaryDomain || existing.primaryDomain || targetBootcamp.name,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        } else {
          // CREATE NEW TRAINEE
          const newTrainee: Trainee = {
            id: 'te-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            employeeId: row.employeeId.trim(),
            name: row.name.trim(),
            email: row.email.trim(),
            role: row.role ? row.role.trim() : 'Associate Data Engineer',
            department: row.department ? row.department.trim() : 'Data & Analytics',
            joiningDate: row.joiningDate ? row.joiningDate.trim() : new Date().toISOString().split('T')[0],
            bootcampId: targetBootcamp.id,
            bootcampName: targetBootcamp.name,
            primaryTrainerName: targetBootcamp.primaryTrainerName,
            enrollmentDate: row.joiningDate ? row.joiningDate.trim() : new Date().toISOString().split('T')[0],
            primaryDomain: row.track ? row.track.trim() : targetBootcamp.name,
            learningStatus: row.learningStatus || 'On Track',
            enrollmentStatus: row.enrollmentStatus || 'Active',
            companyOutcome: row.companyOutcome || 'Pending',
            progressPercent: 0,
            attendancePercent: 100,
            avgScorePercent: 80,
            assignmentsCompleted: 0,
            totalAssignments: 10,
            modulesCompleted: 0,
            totalModules: targetBootcamp.modulesCount || 5,
            certificationsCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          };
          updatedTrainees.unshift(newTrainee);
        }
      });

      return updatedTrainees;
    });

    const audit: TraineeAuditRecord = {
      id: 'audit-' + Date.now(),
      fileName,
      importedAt: new Date().toLocaleString(),
      rowsProcessed: importRows.length,
      newRecords: newCount,
      updatedRecords: updatedCount,
      errors: 0,
    };

    setAuditHistory((prev) => [audit, ...prev]);
    showToast(`Successfully imported ${importRows.length} trainees (${newCount} new, ${updatedCount} updated)`);

    return { newCount, updatedCount, skippedCount: 0 };
  };

  return (
    <TraineeContext.Provider
      value={{
        trainees,
        auditHistory,
        addTrainee,
        updateTrainee,
        changeBootcamp,
        archiveTrainee,
        bulkImportTrainees,
      }}
    >
      {children}
    </TraineeContext.Provider>
  );
};

export const useTrainees = () => {
  const context = useContext(TraineeContext);
  if (!context) {
    throw new Error('useTrainees must be used within a TraineeProvider');
  }
  return context;
};

