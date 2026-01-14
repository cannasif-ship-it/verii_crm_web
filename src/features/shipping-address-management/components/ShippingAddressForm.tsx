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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { shippingAddressFormSchema, type ShippingAddressFormSchema } from '../types/shipping-address-types';
import type { ShippingAddressDto } from '../types/shipping-address-types';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useCountryOptions } from '@/features/country-management/hooks/useCountryOptions';
import { useCityOptions } from '@/features/city-management/hooks/useCityOptions';
import { useDistrictOptions } from '@/features/district-management/hooks/useDistrictOptions';

interface ShippingAddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShippingAddressFormSchema) => void | Promise<void>;
  shippingAddress?: ShippingAddressDto | null;
  isLoading?: boolean;
}

export function ShippingAddressForm({
  open,
  onOpenChange,
  onSubmit,
  shippingAddress,
  isLoading = false,
}: ShippingAddressFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: countryOptions = [] } = useCountryOptions();

  const form = useForm<ShippingAddressFormSchema>({
    resolver: zodResolver(shippingAddressFormSchema),
    defaultValues: {
      address: '',
      postalCode: '',
      contactPerson: '',
      phone: '',
      notes: '',
      customerId: 0,
      countryId: undefined,
      cityId: undefined,
      districtId: undefined,
    },
  });

  const watchedCountryId = form.watch('countryId');
  const watchedCityId = form.watch('cityId');

  const { data: cityOptions = [] } = useCityOptions();
  const { data: districtOptions = [] } = useDistrictOptions(watchedCityId ?? undefined);

  useEffect(() => {
    if (shippingAddress) {
      form.reset({
        address: shippingAddress.address,
        postalCode: shippingAddress.postalCode || '',
        contactPerson: shippingAddress.contactPerson || '',
        phone: shippingAddress.phone || '',
        notes: shippingAddress.notes || '',
        customerId: shippingAddress.customerId,
        countryId: shippingAddress.countryId || undefined,
        cityId: shippingAddress.cityId || undefined,
        districtId: shippingAddress.districtId || undefined,
      });
    } else {
      form.reset({
        address: '',
        postalCode: '',
        contactPerson: '',
        phone: '',
        notes: '',
        customerId: 0,
        countryId: undefined,
        cityId: undefined,
        districtId: undefined,
      });
    }
  }, [shippingAddress, form]);

  useEffect(() => {
    if (!watchedCountryId) {
      form.setValue('cityId', undefined);
      form.setValue('districtId', undefined);
    }
  }, [watchedCountryId, form]);

  useEffect(() => {
    if (!watchedCityId) {
      form.setValue('districtId', undefined);
    }
  }, [watchedCityId, form]);

  const handleSubmit = async (data: ShippingAddressFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shippingAddress
              ? t('shippingAddressManagement.edit', 'Sevk Adresi Düzenle')
              : t('shippingAddressManagement.create', 'Yeni Sevk Adresi')}
          </DialogTitle>
          <DialogDescription>
            {shippingAddress
              ? t('shippingAddressManagement.editDescription', 'Sevk adresi bilgilerini düzenleyin')
              : t('shippingAddressManagement.createDescription', 'Yeni sevk adresi bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('shippingAddressManagement.customerId', 'Müşteri')} *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '' ? parseInt(value) : undefined)}
                    value={field.value && field.value !== 0 ? field.value.toString() : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('shippingAddressManagement.selectCustomer', 'Müşteri Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customerOptions.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('shippingAddressManagement.address', 'Adres')} *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('shippingAddressManagement.enterAddress', 'Adres Girin')}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('shippingAddressManagement.postalCode', 'Posta Kodu')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('shippingAddressManagement.enterPostalCode', 'Posta Kodu Girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('shippingAddressManagement.phone', 'Telefon')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('shippingAddressManagement.enterPhone', 'Telefon Girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('shippingAddressManagement.contactPerson', 'Yetkili Kişi')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={t('shippingAddressManagement.enterContactPerson', 'Yetkili Kişi Girin')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('shippingAddressManagement.countryId', 'Ülke')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                      value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('shippingAddressManagement.selectCountry', 'Ülke Seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('shippingAddressManagement.noCountrySelected', 'Ülke seçilmedi')}
                        </SelectItem>
                        {countryOptions.map((country) => (
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
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('shippingAddressManagement.cityId', 'Şehir')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                      value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                      disabled={!watchedCountryId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchedCountryId ? t('shippingAddressManagement.selectCity', 'Şehir Seçin') : t('shippingAddressManagement.selectCountryFirst', 'Önce ülke seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('shippingAddressManagement.noCitySelected', 'Şehir seçilmedi')}
                        </SelectItem>
                        {cityOptions.map((city) => (
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
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('shippingAddressManagement.districtId', 'İlçe')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                      value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                      disabled={!watchedCityId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchedCityId ? t('shippingAddressManagement.selectDistrict', 'İlçe Seçin') : t('shippingAddressManagement.selectCityFirst', 'Önce şehir seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('shippingAddressManagement.noDistrictSelected', 'İlçe seçilmedi')}
                        </SelectItem>
                        {districtOptions.map((district) => (
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('shippingAddressManagement.notes', 'Notlar')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder={t('shippingAddressManagement.enterNotes', 'Notlar Girin')}
                      rows={3}
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
