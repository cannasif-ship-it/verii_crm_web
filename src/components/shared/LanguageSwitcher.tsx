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
      <SelectTrigger 
        className="w-[130px] h-9 bg-secondary/50 border-input text-foreground rounded-full focus:ring-1 focus:ring-pink-500/20 focus:border-pink-500/50 hover:bg-accent transition-colors border shadow-none"
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
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
      
      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-2xl z-[60]">
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="focus:bg-accent focus:text-accent-foreground cursor-pointer data-[state=checked]:text-pink-500 pl-8"
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