import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

/**
 * Opens on click, not on hover: a hover-only menu cannot be reached by keyboard
 * and never opens on a touch screen.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const choose = (code: string) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('preferred-language', code);
    } catch {
      /* the choice just does not persist */
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language.selectLanguage', 'Select language')}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Globe className="w-[18px] h-[18px] text-slate-600 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{current.nativeName}</span>
        <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('language.selectLanguage', 'Select language')}
          className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
        >
          {LANGUAGES.map((language) => {
            const isCurrent = i18n.language === language.code;
            return (
              <button
                key={language.code}
                role="menuitemradio"
                aria-checked={isCurrent}
                type="button"
                onClick={() => choose(language.code)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors
                  focus:outline-none focus-visible:bg-slate-50
                  ${isCurrent ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <span>
                  <span className={`block text-[13px] ${isCurrent ? 'font-semibold text-blue-800' : 'font-medium text-slate-800'}`}>
                    {language.nativeName}
                  </span>
                  <span className="block text-[11px] text-slate-500">{language.name}</span>
                </span>
                {isCurrent && <Check className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
