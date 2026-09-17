import React, { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  /** id for the <nav>, referenced by the header's aria-controls */
  navId: string;
  /** describes the landmark, e.g. "Admin sections" */
  navLabel: string;
  items: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * The navigation rail shared by the admin, CSR and customer dashboards.
 *
 * It scrolls on its own: the page itself does not scroll, so the rail stays put
 * while the content area moves, and a long menu scrolls within the rail rather
 * than dragging the whole page.
 *
 * Below `lg` it becomes a drawer over the content, with a scrim, Escape to
 * close, and focus moved inside on open.
 */
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navId,
  navLabel,
  items,
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
}) => {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      navRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSectionChange(id);
    // only closes the drawer; onToggle would otherwise open it on a wide-to-narrow resize
    if (isOpen && window.innerWidth < 1024) onToggle();
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 w-64 shrink-0 bg-white border-r border-slate-200 z-50
          flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand — only rendered in the drawer; on desktop the header carries it */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <img src="/Logo-SLT.png" alt="SLT Mobitel" className="h-8 w-auto" />
          <button
            onClick={onToggle}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* The rail's own scroll region */}
        <nav
          ref={navRef}
          id={navId}
          aria-label={navLabel}
          className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-1"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const descId = `${navId}-${item.id}-desc`;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-describedby={descId}
                className={`
                  w-full text-left rounded-lg px-3 py-2.5 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1
                  ${isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                {/* icon beside the heading */}
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                  <span className={`text-[13px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </span>
                {/* description sits under it, aligned to the label */}
                <span
                  id={descId}
                  className="block pl-[26px] mt-0.5 text-[11px] leading-snug text-slate-600 line-clamp-2"
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
