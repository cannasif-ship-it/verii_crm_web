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
import { MapPin } from 'lucide-react';

interface ShippingAddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShippingAddressFormSchema) => void | Promise<void>;
  shippingAddress?: ShippingAddressDto | null;
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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <MapPin size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {shippingAddress
                    ? t('shippingAddressManagement.edit', 'Sevk Adresi Düzenle')
                    : t('shippingAddressManagement.create', 'Yeni Sevk Adresi')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {shippingAddress
                    ? t('shippingAddressManagement.editDescription', 'Sevk adresi bilgilerini düzenleyin')
                    : t('shippingAddressManagement.createDescription', 'Yeni sevk adresi bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('shippingAddressManagement.customerId', 'Müşteri')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== '' ? parseInt(value) : undefined)}
                      value={field.value && field.value !== 0 ? field.value.toString() : ''}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_STYLE}>
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
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('shippingAddressManagement.address', 'Adres')} *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t('shippingAddressManagement.enterAddress', 'Adres Girin')}
                        rows={3}
                        className={`${INPUT_STYLE} h-auto min-h-[80px] py-2`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('shippingAddressManagement.postalCode', 'Posta Kodu')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder={t('shippingAddressManagement.enterPostalCode', 'Posta Kodu Girin')}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('shippingAddressManagement.phone', 'Telefon')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder={t('shippingAddressManagement.enterPhone', 'Telefon Girin')}
                          className={INPUT_STYLE}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('shippingAddressManagement.contactPerson', 'Yetkili Kişi')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={t('shippingAddressManagement.enterContactPerson', 'Yetkili Kişi Girin')}
                        className={INPUT_STYLE}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('shippingAddressManagement.countryId', 'Ülke')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                        value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
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
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('shippingAddressManagement.cityId', 'Şehir')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                        value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                        disabled={!watchedCountryId}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
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
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('shippingAddressManagement.districtId', 'İlçe')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                        value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                        disabled={!watchedCityId}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
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
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('shippingAddressManagement.notes', 'Notlar')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder={t('shippingAddressManagement.enterNotes', 'Notlar Girin')}
                        rows={3}
                        className={`${INPUT_STYLE} h-auto min-h-[80px] py-2`}
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
                  {t('common.cancel', 'İptal')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-10 px-6 rounded-lg bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-medium shadow-lg shadow-pink-500/20 border-0"
                >
                  {isLoading
                    ? t('common.saving', 'Kaydediliyor...')
                    : t('common.save', 'Kaydet')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
