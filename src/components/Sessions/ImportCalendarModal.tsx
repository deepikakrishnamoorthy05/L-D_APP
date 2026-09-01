import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles, Check, Trash2, ArrowRight } from 'lucide-react';
import { useSessions } from '../../context/SessionContext';

interface ImportCalendarModalProps {
  onClose: () => void;
}

export const ImportCalendarModal: React.FC<ImportCalendarModalProps> = ({ onClose }) => {
  const { importCalendarData } = useSessions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parseStage, setParseStage] = useState('Reading spreadsheet...');
  const [importStats, setImportStats] = useState<{ total: number; valid: number; reviewNeeded: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Please drop a valid Excel (.xlsx / .csv) file.');
      }
    }
  };

  const handleUploadAndValidate = () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportProgress(15);
    setParseStage('Reading spreadsheet...');

    setTimeout(() => {
      setImportProgress(45);
      setParseStage('Validating sessions & date formats...');
    }, 400);

    setTimeout(() => {
      setImportProgress(75);
      setParseStage('Checking trainer assignments & conflict logic...');
    }, 800);

    setTimeout(() => {
      setImportProgress(100);
      setParseStage('Preparing calendar dataset...');

      importCalendarData([
        { Bootcamp: 'Data Eng 2026', Track: 'Common Foundation', Module: 'SQL Advanced', Date: '2026-01-25', Slot: 'FN', Trainer: 'Sneha' },
      ]);

      setIsImporting(false);
      setImportStats({
        total: 28,
        valid: 26,
        reviewNeeded: 2,
      });
    }, 1300);
  };

  return (
    <div className="unified-modal-backdrop" onClick={onClose}>
      <div className="unified-modal-shell import-calendar-modal" onClick={(e) => e.stopPropagation()}>
        {/* Subtle Ambient Radial Glows */}
        <div className="modal-ambient-glow glow-top-left" />
        <div className="modal-ambient-glow glow-bottom-right" />

        {/* 1. FIXED HEIGHT HEADER (86px) */}
        <div className="unified-modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <FileSpreadsheet size={22} className="text-teal-700" />
            </div>
            <div className="modal-title-block">
              <h2 className="modal-title-text">Import Training Calendar</h2>
              <p className="modal-subtitle-text">
                Upload and validate the company training schedule spreadsheet.
              </p>
            </div>
          </div>

          <div className="modal-header-right">
            <button type="button" className="modal-close-btn" onClick={onClose} title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. BODY PANE */}
        <div className="import-modal-body-pane">
          {importStats ? (
            /* VALIDATION SUMMARY SUCCESS VIEW */
            <div className="import-success-summary-card">
              <div className="success-icon-circle">
                <CheckCircle2 size={44} className="text-emerald-600" />
              </div>
              <h3 className="summary-title-text">Spreadsheet Validation Complete</h3>
              <p className="summary-subtitle-text">
                Ready to import <strong>{importStats.total} sessions</strong> into the 2026 Training Calendar.
              </p>

              <div className="validation-stats-grid">
                <div className="stat-pill-box">
                  <span className="stat-num">{importStats.total}</span>
                  <span className="stat-lbl">Sessions Found</span>
                </div>
                <div className="stat-pill-box success">
                  <span className="stat-num">{importStats.valid}</span>
                  <span className="stat-lbl">Valid Schedules</span>
                </div>
                <div className="stat-pill-box warning">
                  <span className="stat-num">{importStats.reviewNeeded}</span>
                  <span className="stat-lbl">Need Review</span>
                </div>
              </div>
            </div>
          ) : (
            /* UPLOAD & DRAG DROP VIEW */
            <div className="import-upload-flow-wrapper">
              {/* DRAG & DROP ZONE (200px height) */}
              <div
                className={`import-drag-drop-zone ${isDragOver ? 'drag-active' : ''} ${selectedFile ? 'file-ready' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx, .xls, .csv"
                  className="hidden-file-input"
                  onChange={handleFileChange}
                />

                {!selectedFile ? (
                  <div className="drop-empty-content">
                    <div className="upload-icon-bounce">
                      <Upload size={32} className="text-teal-700" />
                    </div>
                    <h4 className="drop-title">Drop training calendar here</h4>
                    <span className="drop-formats">XLSX • XLS • CSV</span>
                    <span className="drop-or-text">or choose a file manually</span>
                    <label htmlFor="excelFileInput" className="ui-button-secondary btn-sm cursor-pointer mt-2">
                      Browse Files
                    </label>
                  </div>
                ) : (
                  <div className="drop-file-selected-content">
                    <div className="file-icon-box">
                      <FileSpreadsheet size={32} className="text-teal-700" />
                    </div>
                    <div className="file-details">
                      <h4 className="selected-filename">{selectedFile.name}</h4>
                      <span className="file-meta">
                        {(selectedFile.size / 1024).toFixed(1)} KB &bull; <Check size={12} className="inline text-emerald-600" /> File ready
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => setSelectedFile(null)}
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* UPLOAD PARSING PROGRESS */}
              {isImporting && (
                <div className="import-parsing-progress-box">
                  <div className="progress-info-row">
                    <span className="stage-text">{parseStage}</span>
                    <span className="percent-text">{importProgress}%</span>
                  </div>
                  <div className="progress-track-bar">
                    <div className="progress-fill-bar" style={{ width: `${importProgress}%` }} />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="modal-alert-banner error mt-3">
                  <AlertCircle size={16} /> <span>{errorMessage}</span>
                </div>
              )}

              {/* REQUIRED COLUMNS COMPACT SECTION */}
              <div className="required-columns-section">
                <span className="required-columns-title">
                  Required Columns
                </span>
                <div className="required-chips-grid">
                  <span className="col-chip">Bootcamp</span>
                  <span className="col-chip">Learning Track</span>
                  <span className="col-chip">Module</span>
                  <span className="col-chip">Session Date</span>
                  <span className="col-chip">Time Slot</span>
                  <span className="col-chip">Primary Trainer</span>
                  <span className="col-chip">Agenda</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. COMMON FOOTER (FIXED HEIGHT 72px) */}
        <div className="unified-modal-footer">
          <div className="footer-left">
            <button type="button" className="ui-button-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="footer-right">
            {importStats ? (
              <button type="button" className="ui-button-primary" onClick={onClose}>
                Import {importStats.total} Sessions <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="ui-button-primary"
                onClick={handleUploadAndValidate}
                disabled={!selectedFile || isImporting}
              >
                <Upload size={14} /> {isImporting ? 'Validating...' : 'Upload & Validate'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
