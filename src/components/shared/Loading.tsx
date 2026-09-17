import React from 'react';

/**
 * One loading design for the whole app.
 *
 * There were three before — a border-spun circle, a Loader icon and a spinning
 * RefreshCw — in different sizes and colours depending on the screen.
 */

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  /** on a coloured button the ring has to be white */
  tone?: 'brand' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', tone = 'brand', className = '' }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block rounded-full animate-spin align-[-0.125em] ${SIZES[size]} ${
      tone === 'white' ? 'border-white/30 border-t-white' : 'border-blue-200 border-t-blue-700'
    } ${className}`}
  />
);

interface LoadingPanelProps {
  /** e.g. "Loading consents" — rendered without a trailing ellipsis */
  label?: string;
  /** fills the card it sits in rather than a fixed height */
  className?: string;
}

/** The block used while a screen or a card is fetching. */
export const LoadingPanel: React.FC<LoadingPanelProps> = ({ label = 'Loading', className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
    aria-busy="true"
  >
    <Spinner size="lg" />
    <p className="text-sm text-slate-600">{label}…</p>
  </div>
);

/** A grey bar for skeleton rows. Animation is dropped for reduced-motion users by index.css. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${className}`} aria-hidden="true" />
);

export default Spinner;
