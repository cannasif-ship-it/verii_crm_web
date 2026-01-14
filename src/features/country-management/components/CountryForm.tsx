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
import { countryFormSchema, type CountryFormSchema } from '../types/country-types';
import type { CountryDto } from '../types/country-types';

interface CountryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CountryFormSchema) => void | Promise<void>;
  country?: CountryDto | null;
  isLoading?: boolean;
}

export function CountryForm({
  open,
  onOpenChange,
  onSubmit,
  country,
  isLoading = false,
}: CountryFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<CountryFormSchema>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: {
      name: '',
      code: '',
      erpCode: '',
    },
  });

  useEffect(() => {
    if (country) {
      form.reset({
        name: country.name,
        code: country.code,
        erpCode: country.erpCode || '',
      });
    } else {
      form.reset({
        name: '',
        code: '',
        erpCode: '',
      });
    }
  }, [country, form]);

  const handleSubmit = async (data: CountryFormSchema): Promise<void> => {
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
            {country
              ? t('countryManagement.form.editCountry', 'Ülke Düzenle')
              : t('countryManagement.form.addCountry', 'Yeni Ülke Ekle')}
          </DialogTitle>
          <DialogDescription>
            {country
              ? t('countryManagement.form.editDescription', 'Ülke bilgilerini düzenleyin')
              : t('countryManagement.form.addDescription', 'Yeni ülke bilgilerini girin')}
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
                    {t('countryManagement.form.name', 'Ülke Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('countryManagement.form.namePlaceholder', 'Ülke adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('countryManagement.form.code', 'Ülke Kodu')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('countryManagement.form.codePlaceholder', 'Ülke kodunu girin (örn: TR, US)')}
                      maxLength={5}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
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
                    {t('countryManagement.form.erpCode', 'ERP Kodu')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('countryManagement.form.erpCodePlaceholder', 'ERP kodunu girin (opsiyonel)')}
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
