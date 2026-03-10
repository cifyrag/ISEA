import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'es', label: 'ES', name: 'Español' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => i18n.language.startsWith(l.code)) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 text-abyss-500 hover:text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
        title={currentLang.name}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-ocean-200 py-1 z-[2000] min-w-[140px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                currentLang.code === lang.code
                  ? 'bg-ocean-50 text-ocean-700 font-semibold'
                  : 'text-abyss-600 hover:bg-ocean-50'
              }`}
            >
              <span className="font-mono text-xs w-5">{lang.label}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
