import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Loader2,
  RefreshCw,
  ArrowRight,
  UserCheck,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTrainees, BulkImportPayloadRow } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';
import { LearningStatus, EnrollmentStatus, CompanyOutcome } from '../../types/trainee';

interface ImportTraineesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALIAS_MAP: Record<string, string[]> = {
  employeeId: [
    'employee id',
    'employee_id',
    'employeeid',
    'emp id',
    'emp_id',
    'empid',
    'id',
    'trainee id',
    'trainee_id',
    'traineeid',
    'staff id',
    'staff_id',
  ],
  fullName: [
    'full name',
    'fullname',
    'employee name',
    'employeename',
    'trainee name',
    'traineename',
    'name',
    'employee',
    'trainee',
    'student name',
    'student',
  ],
  workEmail: [
    'work email',
    'workemail',
    'email',
    'email address',
    'emailaddress',
    'official email',
    'mail',
    'e-mail',
    'trainee email',
    'user email',
  ],
  department: [
    'department / unit',
    'department',
    'dept',
    'unit',
    'department/unit',
    'dept/unit',
    'business unit',
    'bu',
    'stream',
  ],
  role: [
    'role / designation',
    'role',
    'designation',
    'title',
    'job title',
    'position',
    'role/designation',
  ],
  joiningDate: [
    'joining date',
    'date of joining',
    'doj',
    'joined date',
    'hire date',
    'start date',
    'enrollment date',
  ],
  bootcampCode: [
    'bootcamp code',
    'bootcamp_code',
    'program code',
    'cohort code',
    'bootcamp',
    'cohort',
    'bootcamp id',
    'program',
    'cohort id',
  ],
  learningStatus: [
    'learning status',
    'learning_status',
    'status',
    'performance status',
    'learning state',
  ],
  enrollmentStatus: [
    'enrollment status',
    'enrollment_status',
    'active status',
    'state',
    'enrollment state',
  ],
  companyOutcome: [
    'company outcome',
    'company_outcome',
    'selection status',
    'outcome',
    'selection',
    'placement status',
  ],
  track: [
    'track',
    'learning track',
    'technical track',
    'domain',
    'primary domain',
    'tech track',
  ],
};

export const ImportTraineesModal: React.FC<ImportTraineesModalProps> = ({ isOpen, onClose }) => {
  const { trainees, bulkImportTrainees } = useTrainees();
  const { bootcamps } = useBootcamps();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow Steps:
  // 1: Upload Dropzone & Expected Columns
  // 2: Parsing & Processing Progress
  // 3: Validated Records Preview Table
  // 4: Import Complete Summary
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File & Drag State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseProgressIndex, setParseProgressIndex] = useState(0);

  // Parsed Payload Rows
  const [parsedPayloadRows, setParsedPayloadRows] = useState<BulkImportPayloadRow[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);

  // Errors & Summary Metrics
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    fileName: string;
    totalProcessed: number;
    newCount: number;
    updatedCount: number;
    skippedCount: number;
  }>({
    fileName: '',
    totalProcessed: 0,
    newCount: 0,
    updatedCount: 0,
    skippedCount: 0,
  });

  // Reset modal state whenever isOpen toggles
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedFile(null);
      setIsDragOver(false);
      setParseProgressIndex(0);
      setParsedPayloadRows([]);
      setSkippedCount(0);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // TEMPLATE DOWNLOAD GENERATOR
  // ----------------------------------------------------
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Employee ID': 'EMP029',
        'Full Name': 'Kaviram Sudharajanainar Paramasivan',
        'Work Email': 'kaviram.paramasivan@systechusa.com',
        'Department / Unit': 'Data Engineering',
        'Role / Designation': 'Associate Data Engineer',
        'Joining Date': '2026-08-27',
        'Bootcamp Code': 'DE-B-2026-B02',
        'Learning Status': 'On Track',
        'Enrollment Status': 'Active',
        'Track': 'Common Foundation',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trainee_Roster_Template');
    XLSX.writeFile(wb, 'Trainee_Import_Template.xlsx');
  };

  // ----------------------------------------------------
  // HEADER ALIAS MATCHING & NORMALIZATION
  // ----------------------------------------------------
  const normalizeRow = (rawRow: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {};
    Object.keys(rawRow).forEach((rawHeader) => {
      const cleanHeader = rawHeader
        .trim()
        .toLowerCase()
        .replace(/[\/_-]/g, ' ')
        .replace(/\s+/g, ' ');

      let targetFieldKey = rawHeader;

      // Exact alias match
      for (const [fieldKey, aliases] of Object.entries(ALIAS_MAP)) {
        const exactMatch = aliases.some((alias) => {
          const cleanAlias = alias.replace(/[\/_-]/g, ' ').replace(/\s+/g, ' ');
          return cleanHeader === cleanAlias;
        });
        if (exactMatch) {
          targetFieldKey = fieldKey;
          break;
        }
      }

      // Phrase match fallback
      if (targetFieldKey === rawHeader) {
        for (const [fieldKey, aliases] of Object.entries(ALIAS_MAP)) {
          const phraseMatch = aliases.some((alias) => {
            const cleanAlias = alias.replace(/[\/_-]/g, ' ').replace(/\s+/g, ' ');
            if (cleanAlias.length <= 3) return cleanHeader === cleanAlias;
            return cleanHeader.includes(cleanAlias);
          });
          if (phraseMatch) {
            targetFieldKey = fieldKey;
            break;
          }
        }
      }

      normalized[targetFieldKey] = rawRow[rawHeader];
    });
    return normalized;
  };

  // ----------------------------------------------------
  // FILE PROCESSOR PIPELINE
  // ----------------------------------------------------
  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setStep(2);
    setParseProgressIndex(0);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        setParseProgressIndex(1);
        await new Promise((r) => setTimeout(r, 200));

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setErrorMessage('Unable to read spreadsheet. Sheet is empty.');
          setStep(1);
          return;
        }

        setParseProgressIndex(2);
        await new Promise((r) => setTimeout(r, 200));

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          setErrorMessage('Unable to read spreadsheet. No data rows found.');
          setStep(1);
          return;
        }

        setParseProgressIndex(3);
        await new Promise((r) => setTimeout(r, 200));

        const validPayloadRows: BulkImportPayloadRow[] = [];
        let skipped = 0;

        rawRows.forEach((rawRow, index) => {
          const row = normalizeRow(rawRow);

          let empId = String(row.employeeId || row.empId || row.id || '').trim();
          let fullName = String(row.fullName || row.name || row.employeeName || row.traineeName || '').trim();
          let workEmail = String(row.workEmail || row.email || row.emailAddress || '').trim();
          const department = String(row.department || 'Data & Analytics').trim();
          const role = String(row.role || 'Associate Data Engineer').trim();
          const joiningDate = String(row.joiningDate || new Date().toISOString().split('T')[0]).trim();
          const bootcampCode = String(row.bootcampCode || row.bootcamp || row.cohort || '').trim();
          const track = String(row.track || row.domain || '').trim();
          const rawLearningStatus = String(row.learningStatus || row.status || '').trim();
          const rawEnrollmentStatus = String(row.enrollmentStatus || '').trim();

          // Skip completely blank rows
          if (!empId && !fullName && !workEmail) {
            return;
          }

          // Fallback: derive name from email if missing
          if (!fullName && workEmail && workEmail.includes('@')) {
            const prefix = workEmail.split('@')[0].replace(/[._-]/g, ' ');
            fullName = prefix
              .split(' ')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ');
          }

          // Fallback: generate employee ID if missing
          if (!empId && (fullName || workEmail)) {
            empId = 'EMP' + String(100 + index + Math.floor(Math.random() * 900));
          }

          // Fallback: generate email if missing
          if (!workEmail && fullName) {
            const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');
            workEmail = `${cleanName}@systechusa.com`;
          }

          if (!empId || !fullName || !workEmail) {
            skipped++;
            return;
          }

          // Learning Status mapping
          let learningStatus: LearningStatus = 'On Track';
          if (rawLearningStatus) {
            const validStatuses: LearningStatus[] = ['On Track', 'Project Ready', 'Needs Attention', 'At Risk'];
            const found = validStatuses.find((s) => s.toLowerCase() === rawLearningStatus.toLowerCase());
            if (found) learningStatus = found;
          }

          // Enrollment Status mapping
          let enrollmentStatus: EnrollmentStatus = 'Active';
          if (rawEnrollmentStatus) {
            const validEnroll: EnrollmentStatus[] = ['Active', 'Completed', 'Not Assigned', 'Archived'];
            const found = validEnroll.find((s) => s.toLowerCase() === rawEnrollmentStatus.toLowerCase());
            if (found) enrollmentStatus = found;
          }

          // Company Outcome mapping
          const rawCompanyOutcome = String(row.companyOutcome || '').trim();
          let companyOutcome: CompanyOutcome | undefined = undefined;
          if (rawCompanyOutcome) {
            const validOutcomes: CompanyOutcome[] = ['Selected', 'Pending', 'Not Selected'];
            const found = validOutcomes.find((s) => s.toLowerCase() === rawCompanyOutcome.toLowerCase());
            if (found) companyOutcome = found;
          }

          const existingMatch = trainees.find(
            (t) =>
              t.employeeId.trim().toLowerCase() === empId.toLowerCase() ||
              t.email.trim().toLowerCase() === workEmail.toLowerCase()
          );

          validPayloadRows.push({
            employeeId: empId,
            name: fullName,
            email: workEmail,
            department,
            role,
            joiningDate,
            bootcampCode,
            learningStatus,
            enrollmentStatus,
            companyOutcome,
            track,
            isUpdate: !!existingMatch,
          });
        });

        setParseProgressIndex(4);
        await new Promise((r) => setTimeout(r, 200));

        if (validPayloadRows.length === 0) {
          setErrorMessage('No valid trainee rows found. Check column headers for Employee ID, Full Name, and Work Email.');
          setStep(1);
          return;
        }

        setParsedPayloadRows(validPayloadRows);
        setSkippedCount(skipped);
        setStep(3);
      } catch (err) {
        console.error('Spreadsheet processing error:', err);
        setErrorMessage('Unable to process file. Ensure it is a valid XLSX, XLS or CSV spreadsheet.');
        setStep(1);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFinalExecuteImport = () => {
    if (!selectedFile || parsedPayloadRows.length === 0) return;

    const res = bulkImportTrainees(parsedPayloadRows, selectedFile.name);
    setSummary({
      fileName: selectedFile.name,
      totalProcessed: parsedPayloadRows.length + skippedCount,
      newCount: res.newCount,
      updatedCount: res.updatedCount,
      skippedCount,
    });
    setStep(4);
  };

  return (
    <div className="fbm-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.18 }}
        className="fbm-import-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="fbm-modal-header">
          <div className="fbm-header-left-group">
            <div className="fbm-header-icon-tile">
              <FileSpreadsheet size={22} />
            </div>
            <div className="fbm-header-title-block">
              <span className="fbm-header-tag">EXCEL INGESTION</span>
              <h2 className="fbm-header-main-title">Import Trainee Roster</h2>
              <p className="fbm-header-subtitle">
                Upload standardized employee roster to automatically import trainees and map to learning cohorts.
              </p>
            </div>
          </div>

          <div className="fbm-header-right-group">
            <button
              type="button"
              className="fbm-modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <main className="fbm-form-content-area flex-1">
          {/* STEP 1: UPLOAD DROPZONE & EXPECTED COLUMNS */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* DROPZONE */}
              <div
                className={`fbm-import-dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {!selectedFile ? (
                  <>
                    <div className="fbm-dropzone-icon-circle">
                      <FileSpreadsheet size={26} />
                    </div>
                    <strong className="text-sm font-bold text-slate-800">
                      Drop Trainee Roster Excel Here
                    </strong>
                    <span className="text-xs text-slate-400">
                      Supports XLSX • XLS • CSV standardized templates
                    </span>
                    <span className="text-xs text-slate-400 my-0.5">or choose a file manually</span>
                    <button
                      type="button"
                      className="fbm-browse-btn-styled"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden-file-input"
                      onClick={(e) => {
                        (e.target as HTMLInputElement).value = '';
                      }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          processFile(e.target.files[0]);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full max-w-md bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="text-left">
                        <strong className="text-xs font-bold text-slate-800 block truncate max-w-[220px]">
                          {selectedFile.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB • ✓ Ready to process
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-rose-600 font-bold hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* EXPECTED COLUMNS CHIPS SECTION */}
              <div className="fbm-expected-columns-box">
                <span className="text-xs font-bold text-slate-800 block">
                  Expected Roster Columns
                </span>
                <div className="flex flex-col gap-3">
                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">IDENTITY:</span>
                    <div className="fbm-chips-wrap">
                      {['Employee ID', 'Full Name', 'Work Email'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">ASSIGNMENT:</span>
                    <div className="fbm-chips-wrap">
                      {['Bootcamp Code', 'Department', 'Role', 'Joining Date'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">STATUS:</span>
                    <div className="fbm-chips-wrap">
                      {['Learning Status', 'Enrollment Status', 'Track'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING & PROCESSING PROGRESS */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RefreshCw size={36} className="text-teal-700 animate-spin mb-4" />
              <h3 className="text-lg font-black text-slate-900 m-0">Parsing &amp; Mapping Roster</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Validating trainee employee records against master database...
              </p>

              <div className="w-full max-w-sm flex flex-col gap-2.5 text-left bg-white border border-slate-200 p-4 rounded-2xl">
                {[
                  'Reading spreadsheet structure...',
                  'Detecting required column headers...',
                  'Validating employee IDs & email syntax...',
                  'Matching bootcamp cohort codes...',
                  'Preparing trainee record queue...',
                ].map((txt, idx) => {
                  const isDone = parseProgressIndex > idx;
                  const isCurrent = parseProgressIndex === idx;

                  return (
                    <div key={txt} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-teal-600 animate-spin" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                          •
                        </span>
                      )}
                      <span className={isDone ? 'font-bold text-slate-800' : 'text-slate-500'}>
                        {txt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: VALIDATED RECORDS PREVIEW TABLE */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-teal-700" />
                  <span className="font-bold text-slate-800">
                    Validated {parsedPayloadRows.length} Trainee Records
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                    {parsedPayloadRows.filter((r) => !r.isUpdate).length} New
                  </span>
                  <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    {parsedPayloadRows.filter((r) => r.isUpdate).length} Existing Updates
                  </span>
                  {skippedCount > 0 && (
                    <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {skippedCount} Skipped
                    </span>
                  )}
                </div>
              </div>

              {/* RECORD PREVIEW TABLE */}
              <div className="max-h-[260px] overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Emp ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Bootcamp</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedPayloadRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-700">{r.employeeId}</td>
                        <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                        <td className="p-2.5 text-slate-500">{r.email}</td>
                        <td className="p-2.5 text-slate-600">{r.department}</td>
                        <td className="p-2.5 text-slate-700">{r.bootcampCode || 'Default'}</td>
                        <td className="p-2.5 text-right">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                              r.isUpdate
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {r.isUpdate ? 'Update' : 'New'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORT COMPLETE SUMMARY */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 m-0">&check; Trainee Import Completed</h3>
                <span className="text-xs text-slate-500 font-semibold block mt-1">
                  Spreadsheet: <strong className="text-slate-800">{summary.fileName}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-2">
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col items-center">
                  <strong className="text-xl font-black text-teal-800">{summary.newCount}</strong>
                  <span className="text-[11px] text-slate-600 font-bold mt-0.5">New Added</span>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col items-center">
                  <strong className="text-xl font-black text-blue-800">{summary.updatedCount}</strong>
                  <span className="text-[11px] text-slate-600 font-bold mt-0.5">Existing Updated</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
                  <strong className="text-xl font-black text-slate-700">{summary.skippedCount}</strong>
                  <span className="text-[11px] text-slate-600 font-bold mt-0.5">Skipped</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MODAL FOOTER */}
        <div className="fbm-modal-footer">
          {step === 1 && (
            <>
              <button
                type="button"
                className="fbm-footer-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={14} /> Download Template
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    className="cbm-btn-confirm"
                    onClick={() => processFile(selectedFile)}
                  >
                    Upload &amp; Validate &rarr;
                  </button>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                className="fbm-footer-cancel-btn"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="cbm-btn-confirm"
                onClick={handleFinalExecuteImport}
              >
                Confirm &amp; Import {parsedPayloadRows.length} Trainees &rarr;
              </button>
            </>
          )}

          {step === 4 && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                className="cbm-btn-confirm"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
