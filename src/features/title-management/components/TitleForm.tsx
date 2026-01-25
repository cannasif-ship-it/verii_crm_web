import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { titleFormSchema, type TitleFormSchema } from '../types/title-types';
import type { TitleDto } from '../types/title-types';
import { Users } from 'lucide-react';

interface TitleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TitleFormSchema) => void | Promise<void>;
  title?: TitleDto | null;
  isLoading?: boolean;
}

// --- MODERN TASARIM SABİTLERİ ---
const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  /* LIGHT MODE FOCUS */
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  /* DARK MODE FOCUS */
  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block";

export function TitleForm({
  open,
  onOpenChange,
  onSubmit,
  title,
  isLoading = false,
}: TitleFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<TitleFormSchema>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      titleName: '',
      code: '',
    },
  });

  useEffect(() => {
    if (title) {
      form.reset({
        titleName: title.titleName,
        code: title.code || '',
      });
    } else {
      form.reset({
        titleName: '',
        code: '',
      });
    }
  }, [title, form]);

  const handleSubmit = async (data: TitleFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-lg shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <Users size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {title
                    ? t('titleManagement.form.editTitle', 'Ünvan Düzenle')
                    : t('titleManagement.form.addTitle', 'Yeni Ünvan Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {title
                    ? t('titleManagement.form.editDescription', 'Ünvan bilgilerini düzenleyin')
                    : t('titleManagement.form.addDescription', 'Yeni ünvan bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="titleName"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('titleManagement.form.titleName', 'Ünvan Adı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('titleManagement.form.titleNamePlaceholder', 'Ünvan adını girin')}
                        maxLength={100}
                        className={INPUT_STYLE}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('titleManagement.form.code', 'Kod')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('titleManagement.form.codePlaceholder', 'Kod girin (opsiyonel)')}
                        maxLength={10}
                        className={INPUT_STYLE}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-white/5 px-6 py-5 bg-slate-50/50 dark:bg-[#130822] sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 h-11 px-6 rounded-lg"
            >
              {t('titleManagement.form.cancel', 'İptal')}
            </Button>
            <Button 
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-pink-500/20 h-11 px-8 rounded-lg font-bold tracking-wide transition-all hover:scale-105"
            >
              {isLoading
                ? t('titleManagement.saving', 'Kaydediliyor...')
                : t('titleManagement.save', 'Kaydet')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
