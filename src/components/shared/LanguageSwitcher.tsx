import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher(): ReactElement {
  const { i18n } = useTranslation();
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (value: string): void => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      {/* Tetikleyici Buton: Search input ile aynı stil (Koyu Mor) */}
      <SelectTrigger 
        className="w-[130px] h-9 bg-[#1a1025] border-white/10 text-slate-300 rounded-full focus:ring-1 focus:ring-pink-500/20 focus:border-pink-500/50 hover:bg-white/5 transition-colors border shadow-none"
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <Languages className="h-4 w-4 shrink-0 text-slate-500" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-sm">{currentLanguage.flag}</span>
              <span className="hidden sm:inline text-xs font-medium truncate">
                {currentLanguage.name}
              </span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      
      {/* Açılır Menü: Koyu tema ve Glassmorphism */}
      <SelectContent className="bg-[#1a1025] border-white/10 text-slate-200 rounded-xl shadow-2xl z-[60]">
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="focus:bg-white/10 focus:text-white cursor-pointer data-[state=checked]:text-pink-400 pl-8"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span className="text-xs">{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}