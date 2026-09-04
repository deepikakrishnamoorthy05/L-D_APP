import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Check,
  FileCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

interface ImportTrainerFeedbackModalProps {
  onClose: () => void;
}

interface ParsedValidationRow {
  id: string;
  sessionTitle: string;
  trainingType: string;
  trainerName: string;
  overallRating: number;
  mappingStatus: 'Matched' | 'Needs Review';
  isValid: boolean;
}

const MOCK_PARSED_ROWS: ParsedValidationRow[] = [
  {
    id: 'row-1',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    trainerName: 'Sarah David',
    overallRating: 4.6,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'row-2',
    sessionTitle: 'AI Agentic Workflows & Tool Use',
    trainingType: 'Antigravity Training',
    trainerName: 'Ramesh',
    overallRating: 4.4,
    mappingStatus: 'Matched',
    isValid: true,
  },
  {
    id: 'row-3',
    sessionTitle: 'Informatica Cloud Data Integration',
    trainingType: 'Informatica Training',
    trainerName: 'Dinesh Kumar',
    overallRating: 4.2,
    mappingStatus: 'Matched',
    isValid: true,
  },
];

export const ImportTrainerFeedbackModal: React.FC<ImportTrainerFeedbackModalProps> = ({ onClose }) => {
  const { importSessionFeedback } = useFeedback();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedValidationRow[]>([]);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      alert('Please upload a valid .csv or .xlsx Excel file');
      return;
    }
    setSelectedFile(file);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPreviewRows(MOCK_PARSED_ROWS);
    }, 700);
  };

  const handleImport = () => {
    importSessionFeedback([
      {
        sessionTitle: 'Databricks Performance Optimization (Imported)',
        trainingType: 'Knowledge Sharing Series',
        track: 'DE',
        trainerName: 'Sarah David',
        overallRating: 4.6,
        totalParticipants: 18,
        responsesCount: 16,
      },
      {
        sessionTitle: 'AI Agentic Workflows (Imported)',
        trainingType: 'Antigravity Training',
        track: 'Tools',
        trainerName: 'Ramesh',
        overallRating: 4.4,
        totalParticipants: 20,
        responsesCount: 15,
      },
    ]);

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="cert-modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="cert-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="cert-modal-header">
            <div className="flex items-center gap-3">
              <div className="import-icon-badge" style={{ marginBottom: 0 }}>
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h3 className="cert-modal-title">
                  Import Feedback Data (Excel / CSV)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload survey responses from external forms or legacy L&amp;D feedback spreadsheets.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="cert-modal-close"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-black text-xl text-slate-900 dark:text-white">Import Complete!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Successfully imported session feedback records into the organization L&amp;D evaluation database.
              </p>
            </div>
          ) : (
            <div className="cert-modal-body">
              {/* Dropzone Container */}
              <div
                className={`import-dropzone-box ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Strictly Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />

                <div className="import-icon-badge">
                  <Upload size={24} />
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                  {selectedFile ? (
                    <span className="text-teal-700 dark:text-teal-300 font-mono flex items-center justify-center gap-1.5">
                      <FileCheck size={16} /> {selectedFile.name}
                    </span>
                  ) : (
                    'Click or Drag & Drop Excel (.xlsx / .csv) File'
                  )}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Supports Microsoft Excel (.xlsx) and Comma-Separated Values (.csv)
                </p>

                {/* Expected Header Columns Chips */}
                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 w-full">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Expected Spreadsheet Header Columns
                  </span>
                  <div className="import-columns-strip">
                    {['Session ID', 'Session Name', 'Training Type', 'Trainer Name', 'Overall Rating', 'Comments'].map((col) => (
                      <span key={col} className="import-column-chip">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Processing Loader */}
              {isProcessing && (
                <div className="p-4 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold text-teal-800 dark:text-teal-300">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span>Validating spreadsheet rows &amp; mapping session headers...</span>
                </div>
              )}

              {/* Validated Preview Table */}
              {!isProcessing && previewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-teal-600" /> Validated Import Preview ({previewRows.length} Rows Matched)
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Ready to Import
                    </span>
                  </div>

                  <div className="bootcamp-table-wrapper max-h-48 overflow-y-auto">
                    <table className="enterprise-table text-xs">
                      <thead>
                        <tr>
                          <th>Session Title</th>
                          <th>Type</th>
                          <th>Trainer</th>
                          <th>Rating</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((r) => (
                          <tr key={r.id} className="table-row-hover">
                            <td className="font-bold text-slate-900 dark:text-white">{r.sessionTitle}</td>
                            <td><span className="code-chip lg text-[10px]">{r.trainingType}</span></td>
                            <td>{r.trainerName}</td>
                            <td className="font-extrabold text-teal-700">{r.overallRating} / 5</td>
                            <td>
                              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <Check size={13} /> Matched
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {!isSuccess && (
            <div className="cert-modal-footer">
              <button
                type="button"
                className="ui-button-secondary text-xs"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={previewRows.length === 0 || isProcessing}
                className="ui-button-primary text-xs flex items-center gap-1.5"
                onClick={handleImport}
              >
                <Upload size={14} />
                <span>{isProcessing ? 'Validating Data...' : 'Confirm & Import Records'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
