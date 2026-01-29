import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface VoiceSearchComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  onSelect: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  modal?: boolean;
}

export function VoiceSearchCombobox({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  className,
  disabled = false,
  modal = false,
}: VoiceSearchComboboxProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        const langMap: Record<string, string> = {
          'tr': 'tr-TR',
          'en': 'en-US',
          'de': 'de-DE',
          'fr': 'fr-FR'
        };
        recognition.lang = langMap[i18n.language] || 'tr-TR';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error(t('common.voiceSearchPermissionDenied', 'Mikrofon izni reddedildi.'));
          } else if (event.error === 'no-speech') {
            // Ignore no-speech error, just stop listening
          } else {
            toast.error(t('common.voiceSearchError', 'Sesli arama sırasında bir hata oluştu.'));
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [i18n.language]);

  const handleVoiceSearch = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!recognitionRef.current) {
      toast.error(t('common.voiceSearchNotSupported', 'Tarayıcınız sesli aramayı desteklemiyor.'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition start error', error);
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [open]);

  const selectedLabel = value 
    ? options.find((option) => option.value === value)?.label 
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between px-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedLabel || placeholder || t('common.select', 'Seçiniz')}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder || t('common.search', 'Ara...')} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          >
             {recognitionRef.current && (
               <Button
                 type="button"
                 variant="ghost"
                 size="icon"
                 className={cn(
                   "h-8 w-8 mr-1 shrink-0",
                   isListening && "text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20"
                 )}
                 onClick={handleVoiceSearch}
                 title={t('common.voiceSearch', 'Sesli Arama')}
               >
                 {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
               </Button>
             )}
          </CommandInput>
          <CommandList>
            <CommandEmpty>{t('common.noResults', 'Sonuç bulunamadı.')}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Use label for filtering since users search by text
                  onSelect={() => {
                    onSelect(option.value === value ? null : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
