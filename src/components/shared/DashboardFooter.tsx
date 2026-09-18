import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Full-width footer across the bottom of every dashboard.
 *
 * This replaces the "Privacy Protected" panel that used to sit inside each
 * navigation rail, where it took vertical space from the menu and was repeated
 * three times with slightly different wording.
 */
const DashboardFooter: React.FC = () => (
  <footer className="shrink-0 bg-white border-t border-slate-200">
    <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
      <p className="flex items-center gap-2 text-[11px] text-slate-600">
        <ShieldCheck className="w-3.5 h-3.5 text-green-700 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium text-slate-700">Privacy protected</span>
          <span className="text-slate-500"> — your data is secure and encrypted</span>
        </span>
      </p>
      <p className="text-[11px] text-slate-500">
        A product of <span className="font-medium text-slate-700">SLT&nbsp;Mobitel</span>
      </p>
    </div>
  </footer>
);

export default DashboardFooter;
