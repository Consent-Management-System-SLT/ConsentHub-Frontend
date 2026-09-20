import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressProps {
  steps: string[];
  /** 1-based index of the step being filled in */
  current: number;
}

/**
 * The bar across the top of the multi-step auth forms.
 *
 * The fill is a single element whose width animates, so the movement between
 * steps is visible rather than the bar snapping to its new length.
 */
const StepProgress: React.FC<StepProgressProps> = ({ steps, current }) => {
  const pct = steps.length < 2 ? 100 : ((current - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-6 sm:mb-8">
      <div
        className="relative"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${steps.length}: ${steps[current - 1]}`}
      >
        {/* track sits behind the markers, between the first and last centre */}
        <div className="absolute top-4 left-0 right-0 mx-[12.5%] h-1 bg-slate-200 rounded-full" aria-hidden="true">
          <div
            className="h-full bg-blue-600 rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ol className="relative flex justify-between">
          {steps.map((label, i) => {
            const n = i + 1;
            const done = n < current;
            const active = n === current;
            return (
              <li key={label} className="flex flex-col items-center gap-1.5 w-1/4 text-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-colors duration-300 motion-reduce:transition-none ring-4 ring-white ${
                      done
                        ? 'bg-blue-600 text-white'
                        : active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {done ? <Check className="w-4 h-4" aria-hidden="true" /> : n}
                </span>
                <span
                  className={`text-[11px] sm:text-xs leading-tight ${
                    active ? 'font-semibold text-blue-800' : 'text-slate-600'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default StepProgress;
