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

interface CityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CityFormSchema) => void | Promise<void>;
  city?: CityDto | null;
  isLoading?: boolean;
}

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {city
              ? t('cityManagement.form.editCity', 'Şehir Düzenle')
              : t('cityManagement.form.addCity', 'Yeni Şehir Ekle')}
          </DialogTitle>
          <DialogDescription>
            {city
              ? t('cityManagement.form.editDescription', 'Şehir bilgilerini düzenleyin')
              : t('cityManagement.form.addDescription', 'Yeni şehir bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('cityManagement.form.name', 'Şehir Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('cityManagement.form.namePlaceholder', 'Şehir adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('cityManagement.form.country', 'Ülke')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    value={field.value && field.value > 0 ? field.value.toString() : undefined}
                    disabled={countriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="erpCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('cityManagement.form.erpCode', 'ERP Kodu')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('cityManagement.form.erpCodePlaceholder', 'ERP kodunu girin (opsiyonel)')}
                      maxLength={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t('common.cancel', 'İptal')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('common.saving', 'Kaydediliyor...')
                  : t('common.save', 'Kaydet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
