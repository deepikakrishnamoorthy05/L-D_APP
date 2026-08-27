import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: string; // e.g. 'min(1100px, calc(100vw - 64px))' or '600px'
  className?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth,
  className,
  children,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bootcamp-modal-backdrop ui-modal-overlay"
              >
                <DialogPrimitive.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    style={maxWidth ? { width: maxWidth } : undefined}
                    className={clsx('bootcamp-modal-shell ui-modal-content', className)}
                  >
                    {(title || icon) && (
                      <ModalHeader title={title} subtitle={subtitle} icon={icon} onClose={onClose} />
                    )}
                    {children}
                  </motion.div>
                </DialogPrimitive.Content>
              </motion.div>
            </DialogPrimitive.Overlay>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};

export const ModalHeader: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, icon, onClose, className, children }) => {
  return (
    <div className={clsx('ui-modal-header', className)}>
      {children ? (
        children
      ) : (
        <div className="ui-modal-title-block">
          {icon && <span className="ui-modal-icon">{icon}</span>}
          <div>
            {title && <DialogPrimitive.Title className="ui-modal-title">{title}</DialogPrimitive.Title>}
            {subtitle && <DialogPrimitive.Description className="ui-modal-subtitle">{subtitle}</DialogPrimitive.Description>}
          </div>
        </div>
      )}
      {onClose && (
        <DialogPrimitive.Close asChild>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
};

export const ModalBody: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return <div className={clsx('ui-modal-body', className)}>{children}</div>;
};

export const ModalFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return <div className={clsx('ui-modal-footer', className)}>{children}</div>;
};
