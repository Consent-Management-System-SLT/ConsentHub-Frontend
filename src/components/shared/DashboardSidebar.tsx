import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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

const COLLAPSE_KEY = 'consenthub.sidebarCollapsed';

/**
 * The navigation rail shared by every dashboard.
 *
 * It scrolls on its own: the page itself does not scroll, so the rail stays put
 * while the content area moves, and a long menu scrolls within the rail rather
 * than dragging the whole page.
 *
 * On desktop it collapses to an icon rail and the choice is remembered. Below
 * `lg` it is a drawer over the content, with a scrim, Escape to close, and
 * focus moved inside on open; collapsing does not apply there, since a drawer
 * of bare icons would be harder to use than the full list.
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
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false; // blocked storage: just start expanded
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        /* the preference simply does not persist */
      }
      return !c;
    });
  };

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
    // only closes the drawer; onToggle would otherwise open it on a wide screen
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

      {/* lg:z-auto matters: the rail is a flex item, so a z-index here would
          outrank dialogs opened from the header, which sits in its own context. */}
      <aside
        className={`
          fixed lg:static z-50 lg:z-auto inset-y-0 left-0 shrink-0 bg-white border-r border-slate-200
          flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-64 lg:w-[76px]' : 'w-64'}
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

        {/* The rail's own scroll region. Every item is one box of the same
            height, separated by a hairline rule, so the list reads evenly
            whether a label wraps or not. */}
        <nav
          ref={navRef}
          id={navId}
          aria-label={navLabel}
          className={`flex-1 overflow-y-auto overscroll-contain py-2 divide-y divide-slate-100 ${
            collapsed ? 'px-2 lg:px-1.5' : 'px-2'
          }`}
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
                aria-describedby={collapsed ? undefined : descId}
                title={collapsed ? `${item.label} — ${item.description}` : undefined}
                className={`
                  w-full text-left rounded-lg transition-colors my-0.5
                  flex flex-col justify-center min-h-[56px]
                  ${collapsed ? 'px-3 lg:px-2' : 'px-3'}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1
                  ${isActive
                    ? 'bg-blue-50 text-blue-800 border-l-[3px] border-l-blue-700'
                    : 'text-slate-700 hover:bg-slate-50 border-l-[3px] border-l-transparent'}
                `}
              >
                {/* icon beside the heading — and the only thing left when collapsed,
                    so the active state is carried by the icon and the fill */}
                <span className={`flex items-center gap-2.5 ${collapsed ? 'lg:gap-0 lg:justify-center' : ''}`}>
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-[13px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'} ${
                      collapsed ? 'lg:sr-only' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
                {/* description sits under it, aligned to the label */}
                <span
                  id={descId}
                  className={`block pl-[26px] mt-0.5 text-[11px] leading-snug text-slate-600 line-clamp-2 ${
                    collapsed ? 'lg:hidden' : ''
                  }`}
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Collapse control, ruled off from the menu above it */}
        <div className="hidden lg:block border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            aria-controls={navId}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            className={`w-full min-h-[40px] flex items-center gap-2.5 rounded-lg text-[13px] font-medium
              text-slate-600 hover:bg-slate-50 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
              ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
