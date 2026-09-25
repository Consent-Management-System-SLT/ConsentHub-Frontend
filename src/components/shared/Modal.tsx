import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * The dialog shell every modal uses.
 *
 * Portals to <body>: a dialog rendered inside the header or the rail inherits
 * their stacking context and gets painted underneath the navigation.
 *
 * Widths are deliberately generous on wide screens — the previous dialogs were
 * capped at `max-w-md` regardless of how much they held, so a two-column form
 * ran as a narrow ribbon down the middle of a 1440px laptop.
 */

const WIDTHS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl lg:max-w-2xl',
  lg: 'sm:max-w-2xl lg:max-w-4xl',
  xl: 'sm:max-w-4xl lg:max-w-6xl',
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** small line under the title: status chips, version, timestamps */
  subtitle?: React.ReactNode;
  size?: keyof typeof WIDTHS;
  /** pinned under the body, outside the scroll region */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // callers pass inline onClose; keep it in a ref so re-renders (every keystroke)
  // don't re-run the effect below and steal focus from the input being typed in
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 focus:outline-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white w-full ${WIDTHS[size]} rounded-t-2xl sm:rounded-xl shadow-xl
                    max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 leading-snug">{title}</h2>
            {subtitle && <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-2 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* only this region scrolls */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5">{children}</div>

        {footer && (
          <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
