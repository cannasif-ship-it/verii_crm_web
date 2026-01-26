import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cityFormSchema, type CityFormSchema } from '../types/city-types';
import type { CityDto } from '../types/city-types';
import { useCountryOptions } from '@/features/country-management/hooks/useCountryOptions';
import { Map } from 'lucide-react';

interface CityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CityFormSchema) => void | Promise<void>;
  city?: CityDto | null;
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

export function CityForm({
  open,
  onOpenChange,
  onSubmit,
  city,
  isLoading = false,
}: CityFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: countries, isLoading: countriesLoading } = useCountryOptions();

  const form = useForm<CityFormSchema>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: '',
      erpCode: '',
      countryId: 0,
    },
  });

  useEffect(() => {
    if (city) {
      form.reset({
        name: city.name,
        erpCode: city.erpCode || '',
        countryId: city.countryId,
      });
    } else {
      form.reset({
        name: '',
        erpCode: '',
        countryId: 0,
      });
    }
  }, [city, form]);

  const handleSubmit = async (data: CityFormSchema): Promise<void> => {
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
               <Map size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {city
                    ? t('cityManagement.form.editCity', 'Edit City')
                    : t('cityManagement.form.addCity', 'Add New City')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {city
                    ? t('cityManagement.form.editDescription', 'Edit city details')
                    : t('cityManagement.form.addDescription', 'Enter new city details')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('cityManagement.form.name', 'Şehir Adı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('cityManagement.form.namePlaceholder', 'Şehir adını girin')}
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
                name="countryId"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('cityManagement.form.country', 'Ülke')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value && field.value > 0 ? field.value.toString() : undefined}
                      disabled={countriesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_STYLE}>
                          <SelectValue placeholder={t('cityManagement.form.selectCountry', 'Ülke seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="erpCode"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('cityManagement.form.erpCode', 'ERP Code')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('cityManagement.form.erpCodePlaceholder', 'ERP kodunu girin (opsiyonel)')}
                        maxLength={10}
                        className={INPUT_STYLE}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  {t('cityManagement.form.cancel', 'İptal')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-10 px-6 rounded-lg bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-medium shadow-lg shadow-pink-500/20 border-0"
                >
                  {isLoading
                    ? t('cityManagement.form.saving', 'Kaydediliyor...')
                    : t('cityManagement.form.save', 'Kaydet')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
