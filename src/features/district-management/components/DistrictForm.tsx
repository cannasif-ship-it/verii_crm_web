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
import { districtFormSchema, type DistrictFormSchema } from '../types/district-types';
import type { DistrictDto } from '../types/district-types';
import { useCityOptions } from '@/features/city-management/hooks/useCityOptions';

interface DistrictFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DistrictFormSchema) => void | Promise<void>;
  district?: DistrictDto | null;
  isLoading?: boolean;
}

export function DistrictForm({
  open,
  onOpenChange,
  onSubmit,
  district,
  isLoading = false,
}: DistrictFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: cities, isLoading: citiesLoading } = useCityOptions();

  const form = useForm<DistrictFormSchema>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      name: '',
      erpCode: '',
      cityId: 0,
    },
  });

  useEffect(() => {
    if (district) {
      form.reset({
        name: district.name,
        erpCode: district.erpCode || '',
        cityId: district.cityId,
      });
    } else {
      form.reset({
        name: '',
        erpCode: '',
        cityId: 0,
      });
    }
  }, [district, form]);

  const handleSubmit = async (data: DistrictFormSchema): Promise<void> => {
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
            {district
              ? t('districtManagement.form.editDistrict', 'İlçe Düzenle')
              : t('districtManagement.form.addDistrict', 'Yeni İlçe Ekle')}
          </DialogTitle>
          <DialogDescription>
            {district
              ? t('districtManagement.form.editDescription', 'İlçe bilgilerini düzenleyin')
              : t('districtManagement.form.addDescription', 'Yeni ilçe bilgilerini girin')}
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
                    {t('districtManagement.form.name', 'İlçe Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('districtManagement.form.namePlaceholder', 'İlçe adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('districtManagement.form.city', 'Şehir')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString() || ''}
                    disabled={citiesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('districtManagement.form.selectCity', 'Şehir seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
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
                    {t('districtManagement.form.erpCode', 'ERP Kodu')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('districtManagement.form.erpCodePlaceholder', 'ERP kodunu girin (opsiyonel)')}
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
