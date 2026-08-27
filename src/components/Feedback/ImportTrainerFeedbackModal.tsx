import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  Check,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { FeedbackRecord } from '../../types/feedback';

interface ImportTrainerFeedbackModalProps {
  onClose: () => void;
}

interface ParsedValidationRow {
  id: string;
  traineeName: string;
  employeeId: string;
  trainerName: string;
  moduleName: string;
  overallRating: number;
  mappingStatus: 'Matched' | 'Needs Review';
  issueDesc?: string;
  isValid: boolean;
}

const MOCK_PARSED_ROWS: ParsedValidationRow[] = [
  {
    id: 'row-1',
    traineeName: 'Kaviram Sudharajanainar Paramasivan',
    employeeId: 'EMP001',
    trainerName: 'Sneha',
    moduleName: 'SQL Fundamentals & T-SQL',
    overallRating: 4.3,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'imp-2',
    traineeName: 'Saran Mani',
    employeeId: 'EMP002',
    trainerName: 'Sarah David',
    moduleName: 'Python Core & OOP',
    overallRating: 4.7,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'imp-3',
    traineeName: 'Amuthanilavan',
    employeeId: 'EMP003',
    trainerName: 'Unknown Trainer',
    moduleName: 'SQL Fundamentals & T-SQL',
    overallRating: 3.1,
    mappingStatus: 'Needs Review',
    issueDesc: 'Trainer ID not matched in database',
    isValid: false,
  },
  {
    id: 'row-4',
    traineeName: 'Ananya Roy',
    employeeId: 'EMP004',
    trainerName: 'Alex Thomas',
    moduleName: 'PySpark & Delta Lake Architecture',
    overallRating: 4.1,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'row-5',
    traineeName: 'Karthik Raja',
    employeeId: 'EMP005',
    trainerName: 'Dinesh Kumar',
    moduleName: 'Data Warehouse Modeling',
    overallRating: 4.6,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'row-6',
    traineeName: 'Vikas Verma',
    employeeId: 'EMP007',
    trainerName: 'Sarah David',
    moduleName: 'Python Core & OOP',
    overallRating: 3.9,
    mappingStatus: 'Matched',
    isValid: true,
  },
];

export const ImportTrainerFeedbackModal: React.FC<ImportTrainerFeedbackModalProps> = ({
  onClose,
}) => {
  const { addFeedback } = useFeedback();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard Steps: 1: Upload, 2: Parsing Progress, 3: Validation Table & AI, 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Parse Progress Animation step
  const [parseProgressIndex, setParseProgressIndex] = useState(0);

  // AI Analysis state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  // Rows state
  const [rows, setRows] = useState<ParsedValidationRow[]>(MOCK_PARSED_ROWS);

  // File drop handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
      });
    }
  };

  // Trigger parsing progress
  const startParsing = () => {
    setStep(2);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setParseProgressIndex(current);
      if (current >= 6) {
        clearInterval(interval);
        setTimeout(() => setStep(3), 600);
      }
    }, 350);
  };

  // Run AI analysis mock
  const runAiAnalysisBatch = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setAiDone(true);
    }, 1200);
  };

  // Final Import Handler
  const handleFinalImport = () => {
    const validRows = rows.filter((r) => r.isValid);
    validRows.forEach((row) => {
      addFeedback({
        traineeName: row.traineeName,
        employeeId: row.employeeId,
        trainerName: row.trainerName,
        moduleName: row.moduleName,
        overallRating: row.overallRating,
        technicalRating: 4.0,
        participationRating: 4.5,
        communicationRating: 4.0,
        problemSolvingRating: 3.8,
        status: 'Approved',
        source: 'EXCEL_IMPORT',
        feedbackDate: new Date().toISOString().split('T')[0],
      });
    });
    setStep(4);
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const reviewCount = rows.filter((r) => !r.isValid).length;

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
        {/* HEADER (~88px HEIGHT) */}
        <div className="fbm-modal-header">
          <div className="fbm-header-left-group">
            <div className="fbm-header-icon-tile">
              <FileSpreadsheet size={22} />
            </div>
            <div className="fbm-header-title-block">
              <span className="fbm-header-tag">EXCEL INGESTION</span>
              <h2 className="fbm-header-main-title">Import Trainer Feedback</h2>
              <p className="fbm-header-subtitle">
                Upload standardized trainer feedback and automatically map records to trainees and learning activities.
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

        {/* BODY */}
        <main className="fbm-form-content-area flex-1">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              {/* DRAG AND DROP AREA (210px HEIGHT) */}
              <div
                className={`fbm-import-dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
              >
                {!selectedFile ? (
                  <>
                    <div className="fbm-dropzone-icon-circle">
                      <FileSpreadsheet size={26} />
                    </div>
                    <strong className="text-sm font-bold text-slate-800">
                      Drop Trainer Feedback Excel Here
                    </strong>
                    <span className="text-xs text-slate-400">
                      Supports XLSX • XLS • CSV standardized templates
                    </span>
                    <span className="text-xs text-slate-400 my-0.5">or choose a file manually</span>
                    <button
                      type="button"
                      className="fbm-browse-btn-styled"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden-file-input"
                      onChange={handleFileSelect}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full max-w-md bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="text-left">
                        <strong className="text-xs font-bold text-slate-800 block">
                          {selectedFile.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {selectedFile.size} • ✓ Ready to process
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-rose-600 font-bold hover:underline"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* EXPECTED COLUMNS CHIPS SECTION */}
              <div className="fbm-expected-columns-box">
                <span className="text-xs font-bold text-slate-800 block">
                  Expected Feedback Columns
                </span>
                <div className="flex flex-col gap-3">
                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">IDENTITY:</span>
                    <div className="fbm-chips-wrap">
                      {['Trainee ID', 'Trainee Name', 'Trainer ID', 'Trainer Name'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">LEARNING:</span>
                    <div className="fbm-chips-wrap">
                      {['Bootcamp Code', 'Module', 'Session / Topic', 'Feedback Date'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">RATINGS:</span>
                    <div className="fbm-chips-wrap">
                      {['Technical', 'Participation', 'Communication', 'Problem Solving', 'Practical Application', 'Learning Attitude', 'Overall Rating'].map((c) => (
                        <span key={c} className="fbm-column-chip-item">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="fbm-chips-group-row">
                    <span className="fbm-chips-group-lbl">COMMENTS:</span>
                    <div className="fbm-chips-wrap">
                      {['Strengths', 'Improvement Comments', 'General Comments'].map((c) => (
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

          {/* STEP 2: PARSING PROGRESS */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <RefreshCw size={36} className="text-teal-700 animate-spin mb-4" />
              <h3 className="text-lg font-black text-slate-900 m-0">Parsing &amp; Mapping Spreadsheet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Matching trainer feedback rows against active trainee rosters...
              </p>

              <div className="w-full max-w-sm flex flex-col gap-2.5 text-left bg-white border border-slate-200 p-4 rounded-2xl">
                {[
                  'Reading spreadsheet structure...',
                  'Detecting required column headers...',
                  'Matching trainees against master database...',
                  'Matching trainers and roles...',
                  'Validating numeric rating bounds (1.0 - 5.0)...',
                  'Preparing AI analysis queue...',
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
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center animate-pulse text-[10px]">
                          ●
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                          ○
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

          {/* STEP 3: VALIDATION SUMMARY TABLE & AI PREVIEW */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* 5 METRIC CARDS */}
              <div className="grid grid-cols-5 gap-3">
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">ROWS DETECTED</span>
                  <strong className="text-lg font-black text-slate-900">{rows.length}</strong>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 block">VALID RECORDS</span>
                  <strong className="text-lg font-black text-emerald-700">{validCount}</strong>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-600 block">NEED REVIEW</span>
                  <strong className="text-lg font-black text-rose-700">{reviewCount}</strong>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">TRAINEES</span>
                  <strong className="text-lg font-black text-slate-900">{validCount}</strong>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block">TRAINERS</span>
                  <strong className="text-lg font-black text-slate-900">4</strong>
                </div>
              </div>

              {/* AI ANALYSIS BAR */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-teal-700" />
                  <span className="text-xs font-bold text-slate-800">AI Feedback Summarization</span>
                  {aiDone && <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Completed</span>}
                </div>
                <button
                  type="button"
                  className="fbm-footer-action-btn h-8 px-3 text-xs"
                  onClick={runAiAnalysisBatch}
                  disabled={isAiProcessing || aiDone}
                >
                  {isAiProcessing ? 'Analyzing...' : aiDone ? 'AI Ready' : 'Run AI Analysis'}
                </button>
              </div>

              {/* VALIDATION TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">TRAINEE</th>
                      <th className="p-3">TRAINER</th>
                      <th className="p-3">MODULE</th>
                      <th className="p-3">OVERALL RATING</th>
                      <th className="p-3">MAPPING</th>
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-900">{row.traineeName} ({row.employeeId})</td>
                        <td className="p-3 text-slate-700">{row.trainerName}</td>
                        <td className="p-3 text-slate-700">{row.moduleName}</td>
                        <td className="p-3 font-bold text-amber-700">{row.overallRating.toFixed(1)} / 5</td>
                        <td className="p-3">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              ✓ Matched
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              ⚠ {row.issueDesc}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              row.isValid ? 'bg-slate-100 text-slate-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {row.isValid ? 'Valid' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORT SUCCESS STATE */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 m-0">✓ Trainer Feedback Imported</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6 max-w-md">
                <strong>{validCount} feedback records</strong> have been successfully processed, validated and approved into the Feedback Directory.
              </p>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-sm w-full text-left mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Batch Record Import</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Approved</span>
                </div>
                <div className="text-xs text-slate-600">Records Matched: {validCount}</div>
                <div className="text-xs text-slate-600">Excluded / Needs Review: {reviewCount}</div>
                <div className="text-xs font-bold text-teal-800 mt-2">AI Analyzed: {validCount}</div>
              </div>

              <button
                type="button"
                className="fbm-footer-action-btn"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </main>

        {/* FIXED FOOTER (72px HEIGHT) */}
        {step !== 4 && (
          <footer className="fbm-modal-footer">
            <button
              type="button"
              className="fbm-footer-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            {step === 1 && (
              <button
                type="button"
                className="fbm-footer-action-btn"
                disabled={!selectedFile}
                onClick={startParsing}
              >
                Upload &amp; Validate &rarr;
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                className="fbm-footer-action-btn"
                onClick={handleFinalImport}
              >
                Import &amp; Approve ({validCount} Records)
              </button>
            )}
          </footer>
        )}
      </motion.div>
    </div>
  );
};
