import React, { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** fired when all boxes are filled, so the form can submit itself */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * One box per digit.
 *
 * The boxes are a presentation of a single value: typing advances, Backspace on
 * an empty box steps back, arrows move, and a pasted code fills the whole row.
 * Each box is labelled for screen readers, which otherwise announce six
 * unrelated text fields.
 */
const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  describedBy,
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    // a code pasted or autofilled into one box fills the rest
    const chars = value.split('');
    typed.split('').forEach((c, k) => {
      if (i + k < length) chars[i + k] = c;
    });
    const next = chars.join('').slice(0, length);
    commit(next);
    focusBox(i + typed.length);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.split('');
      if (chars[i]) {
        chars[i] = '';
        commit(chars.join('').replace(/\s/g, ''));
      } else if (i > 0) {
        chars[i - 1] = '';
        commit(chars.slice(0, i - 1).join(''));
        focusBox(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    commit(pasted);
    focusBox(pasted.length);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-13 sm:w-12 sm:h-14 rounded-lg border bg-white text-center text-xl font-semibold
            text-slate-900 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
            disabled:opacity-60
            ${invalid ? 'border-red-400' : 'border-slate-300'}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
