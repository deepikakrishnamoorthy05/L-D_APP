import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  X,
  Send,
  Mail,
  Copy,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';
import { quizAttemptService, QuizAssessment } from '../../services/quizAttemptService';

interface QuizPublishAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: QuizAssessment | null;
  onInvitationsSent?: () => void;
}

export const QuizPublishAssignModal: React.FC<QuizPublishAssignModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onInvitationsSent,
}) => {
  const { trainees } = useTrainees();
  const { bootcamps } = useBootcamps();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBootcamp, setSelectedBootcamp] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessCount, setSentSuccessCount] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Candidate Database List
  const candidatePool = useMemo(() => {
    if (!trainees || trainees.length === 0) {
      return [
        { id: 'EMP-1001', name: 'Swetha Ramakrishnan', email: 'swetha@systech.com', bootcampId: 'bc-1', bootcampName: 'Data Engineering', department: 'Data Platform', track: 'DE' },
        { id: 'EMP-1002', name: 'Deepika Mookan', email: 'deepika@systech.com', bootcampId: 'bc-1', bootcampName: 'Data Engineering', department: 'Data Analytics', track: 'BA' },
        { id: 'EMP-1003', name: 'Mohit Sharma', email: 'mohit@systech.com', bootcampId: 'bc-2', bootcampName: 'Cloud Data Architecture', department: 'Cloud & AI', track: 'DE' },
        { id: 'EMP-1004', name: 'Janani Venkatesh', email: 'janani@systech.com', bootcampId: 'bc-3', bootcampName: 'Power BI & DAX', department: 'BI & Tools', track: 'Tools' },
        { id: 'EMP-1005', name: 'Manoj Kumar', email: 'manoj@systech.com', bootcampId: 'bc-1', bootcampName: 'Data Engineering', department: 'Data Platform', track: 'DE' },
        { id: 'EMP-1006', name: 'Ananya Roy', email: 'ananya@systech.com', bootcampId: 'bc-2', bootcampName: 'Cloud Data Architecture', department: 'Cloud & AI', track: 'BA' },
        { id: 'EMP-1007', name: 'Karthik Raja', email: 'karthik@systech.com', bootcampId: 'bc-3', bootcampName: 'Power BI & DAX', department: 'BI & Tools', track: 'Tools' },
        { id: 'EMP-1008', name: 'Priya Sundaram', email: 'priya@systech.com', bootcampId: 'bc-1', bootcampName: 'Data Engineering', department: 'Data Platform', track: 'DE' },
      ];
    }

    return trainees.map((t) => ({
      id: t.employeeId || t.id,
      name: t.name,
      email: t.email || `${t.name.toLowerCase().replace(/\s+/g, '.')}@systech.com`,
      bootcampId: t.bootcampId,
      bootcampName: t.bootcampName || 'Shared Track',
      department: t.department || 'Data & AI',
      track: t.primaryDomain?.includes('Analytics') ? 'BA' : t.primaryDomain?.includes('Power') ? 'Tools' : 'DE',
    }));
  }, [trainees]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidatePool.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBootcamp = selectedBootcamp === 'all' || c.bootcampId === selectedBootcamp;
      const matchesDept = selectedDepartment === 'all' || c.department === selectedDepartment;
      const matchesTrack = selectedTrack === 'all' || c.track === selectedTrack;

      return matchesSearch && matchesBootcamp && matchesDept && matchesTrack;
    });
  }, [candidatePool, searchQuery, selectedBootcamp, selectedDepartment, selectedTrack]);

  // Select / Deselect Logic
  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredCandidates.map((c) => c.id);
    setSelectedCandidateIds(allFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedCandidateIds([]);
  };

  // Send Invitations Action
  const handleSendInvitations = async () => {
    if (!assessment || selectedCandidateIds.length === 0) return;

    setIsSending(true);
    try {
      const selectedCandidates = candidatePool.filter((c) => selectedCandidateIds.includes(c.id));
      const payload = selectedCandidates.map((c) => ({
        candidateId: c.id,
        candidateName: c.name,
        candidateEmail: c.email,
        bootcampName: c.bootcampName,
        department: c.department,
        track: c.track,
      }));

      const invitations = await quizAttemptService.inviteCandidates(assessment.id, payload);
      setSentSuccessCount(invitations.length);

      if (onInvitationsSent) {
        onInvitationsSent();
      }
    } catch (err: any) {
      alert(`Failed to send invitations: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !assessment) return null;

  return (
    <div className="assessment-modal-backdrop" onMouseDown={onClose}>
      <motion.div
        className="assessment-generator-modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%' }}
      >
        {/* MODAL HEADER */}
        <div className="generator-modal-header" style={{ padding: '20px 24px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.5px' }}>
              ASSESSMENT INVITATION MANAGER
            </span>
            <h2 style={{ fontSize: '1.3rem', margin: '4px 0 0 0' }}>Assign Candidates</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="close-btn">
            <X size={18} />
          </button>
        </div>

        {/* QUIZ SUMMARY STRIP */}
        <div style={{ padding: '12px 24px', background: 'rgba(13, 148, 136, 0.1)', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>{assessment.title}</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginLeft: '12px' }}>
              {assessment.questions?.length || 5} Questions • {assessment.durationMinutes}m Duration • Pass: {assessment.passPercentage}%
            </span>
          </div>
          <span style={{ padding: '3px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
            Status: Published
          </span>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {sentSuccessCount !== null ? (
          <div style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>
              {sentSuccessCount} Invitations Dispatched!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', margin: 0, maxWidth: '420px' }}>
              Unique secure invitation links with individual tokens have been generated and emailed to all selected candidates.
            </p>
            <button
              type="button"
              onClick={() => {
                setSentSuccessCount(null);
                onClose();
              }}
              className="ai-quiz-btn-primary"
              style={{ marginTop: '12px', padding: '10px 24px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* FILTERS & SEARCH ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {/* SEARCH BAR */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-3)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or ID..."
                  style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', color: 'var(--text-1)', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              {/* BOOTCAMP FILTER */}
              <select
                value={selectedBootcamp}
                onChange={(e) => setSelectedBootcamp(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', color: 'var(--text-1)', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="all">All Bootcamps</option>
                {bootcamps.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* TRACK FILTER */}
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-1)', color: 'var(--text-1)', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="all">All Tracks (BA / DE / Tools)</option>
                <option value="DE">DE (Data Engineering)</option>
                <option value="BA">BA (Business Analytics)</option>
                <option value="Tools">Tools (Power BI / DAX)</option>
              </select>
            </div>

            {/* SELECTION BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-1)' }}>
                Selected Candidates: <span style={{ color: '#0d9488' }}>{selectedCandidateIds.length}</span> / {filteredCandidates.length}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={handleSelectAll} style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Select All
                </button>
                <button type="button" onClick={handleDeselectAll} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  ✕ Deselect All
                </button>
              </div>
            </div>

            {/* CANDIDATES TABLE */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--border-1)' }}>
              <table className="recent-quiz-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', textAlign: 'left', fontSize: '0.78rem' }}>
                    <th style={{ padding: '10px 14px', width: '40px' }}>Select</th>
                    <th style={{ padding: '10px 14px' }}>Candidate Name</th>
                    <th style={{ padding: '10px 14px' }}>Employee ID</th>
                    <th style={{ padding: '10px 14px' }}>Bootcamp</th>
                    <th style={{ padding: '10px 14px' }}>Track</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c) => {
                    const isChecked = selectedCandidateIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleToggleCandidate(c.id)}
                        style={{ cursor: 'pointer', background: isChecked ? 'rgba(13, 148, 136, 0.1)' : 'transparent', borderBottom: '1px solid var(--border-1)' }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by tr click
                            style={{ accentColor: '#0d9488', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-1)' }}>
                          {c.name}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{c.email}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-2)' }}>{c.id}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-2)' }}>{c.bootcampName}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 800 }}>
                            {c.track}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.84rem' }}>
                        No candidates match the specified filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={onClose} className="ai-quiz-btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedCandidateIds.length === 0 || isSending}
                onClick={handleSendInvitations}
                className="ai-quiz-btn-primary"
                style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)', padding: '10px 24px', opacity: selectedCandidateIds.length === 0 ? 0.5 : 1 }}
              >
                {isSending ? <><span className="ai-loading-dot" /> Dispatching...</> : <><Send size={15} /> Send Quiz Invitations ({selectedCandidateIds.length})</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
