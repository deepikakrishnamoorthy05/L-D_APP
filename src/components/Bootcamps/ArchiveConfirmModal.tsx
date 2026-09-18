import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Trash2, X } from 'lucide-react';

interface ArchiveConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="premium-confirm-backdrop" onClick={onClose}>
      <motion.div initial={{opacity:0,scale:.94,y:16}} animate={{opacity:1,scale:1,y:0}} transition={{duration:.24,ease:[.16,1,.3,1]}} className="premium-confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="premium-confirm-accent" />
        <header>
          <div className="premium-warning-icon"><AlertTriangle /></div>
          <div><span>Destructive action</span><h3>{title}</h3></div>
          <button type="button" className="premium-confirm-close" onClick={onClose} aria-label="Close"><X /></button>
        </header>
        <div className="premium-confirm-body">
          <p>{message}</p>
          <div className="premium-warning-note"><ShieldAlert /><span>This action is permanent and cannot be reversed.</span></div>
        </div>
        <footer>
          <button type="button" className="premium-confirm-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="premium-confirm-delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 /> {confirmLabel}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};
