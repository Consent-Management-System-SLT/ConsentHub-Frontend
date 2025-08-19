import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferred-language', langCode);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="group">
        <button
          type="button"
          className="inline-flex items-center justify-center w-full rounded-md border border-myslt-accent/30 shadow-sm px-4 py-2 bg-myslt-card text-sm font-medium text-myslt-text-primary hover:bg-myslt-accent/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myslt-success"
          id="language-menu"
          aria-expanded="true"
          aria-haspopup="true"
        >
          <Globe className="w-4 h-4 mr-2" />
          {languages.find(lang => lang.code === i18n.language)?.nativeName || 'English'}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-myslt-card ring-1 ring-myslt-accent/20 ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
            <div className="px-4 py-2 text-sm text-myslt-text-secondary border-b border-myslt-accent/20">
              <div className="font-medium">{t('language.selectLanguage')}</div>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`${
                  i18n.language === language.code
                    ? 'bg-myslt-card-gradient text-myslt-primary'
                    : 'text-myslt-text-secondary hover:bg-myslt-service-card'
                } group flex items-center px-4 py-2 text-sm w-full text-left transition-colors duration-150`}
                role="menuitem"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {i18n.language === language.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
