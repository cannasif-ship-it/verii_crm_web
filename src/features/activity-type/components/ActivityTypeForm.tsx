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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { activityTypeFormSchema, type ActivityTypeFormSchema } from '../types/activity-type-types';
import type { ActivityTypeDto } from '../types/activity-type-types';
// İkonlar
import { ListTodo, Type, FileText } from 'lucide-react';

interface ActivityTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityTypeFormSchema) => void | Promise<void>;
  activityType?: ActivityTypeDto | null;
  isLoading?: boolean;
}

// --- TASARIM SABİTLERİ ---
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

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block flex items-center gap-1.5";

export function ActivityTypeForm({
  open,
  onOpenChange,
  onSubmit,
  activityType,
  isLoading = false,
}: ActivityTypeFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<ActivityTypeFormSchema>({
    resolver: zodResolver(activityTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (activityType) {
      form.reset({
        name: activityType.name,
        description: activityType.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [activityType, form]);

  const handleSubmit = async (data: ActivityTypeFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-full flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        
        {/* HEADER: Sabit */}
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             {/* İkon: ListTodo */}
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <ListTodo size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {activityType
                    ? t('activityType.form.editTitle', 'Aktivite Tipi Düzenle')
                    : t('activityType.form.addTitle', 'Yeni Aktivite Tipi Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {activityType
                    ? t('activityType.form.editDescription', 'Aktivite tipi bilgilerini düzenleyin')
                    : t('activityType.form.addDescription', 'Yeni aktivite tipi bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        {/* BODY: Kaydırılabilir Form Alanı */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="activity-type-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      <Type size={12} className="text-pink-500" />
                      {t('activityType.form.name', 'Aktivite Tipi Adı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={INPUT_STYLE}
                        placeholder={t('activityType.form.namePlaceholder', 'Aktivite tipi adını girin')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      <FileText size={12} className="text-pink-500" />
                      {t('activityType.form.description', 'Açıklama')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        className={`${INPUT_STYLE} h-auto min-h-[120px] py-3`}
                        placeholder={t('activityType.form.descriptionPlaceholder', 'Açıklama girin (opsiyonel)')}
                        maxLength={500}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </div>

        {/* FOOTER: Sabit */}
        <DialogFooter className="border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            {t('activityType.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit" 
            form="activity-type-form" // Form ID'si ile bağlantı
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-8"
          >
            {isLoading
              ? t('activityType.saving', 'Kaydediliyor...')
              : t('activityType.save', 'Kaydet')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}