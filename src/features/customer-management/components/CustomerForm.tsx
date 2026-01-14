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
import { Switch } from '@/components/ui/switch';
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
import { customerFormSchema, type CustomerFormSchema } from '../types/customer-types';
import type { CustomerDto } from '../types/customer-types';
import { useCountryOptions } from '@/features/country-management/hooks/useCountryOptions';
import { useCityOptions } from '@/features/city-management/hooks/useCityOptions';
import { useDistrictOptions } from '@/features/district-management/hooks/useDistrictOptions';
import { useCustomerTypeOptions } from '@/features/customer-type-management/hooks/useCustomerTypeOptions';
import { useStokGroup } from '@/services/hooks/useStokGroup';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerFormSchema) => void | Promise<void>;
  customer?: CustomerDto | null;
  isLoading?: boolean;
}

export function CustomerForm({
  open,
  onOpenChange,
  onSubmit,
  customer,
  isLoading = false,
}: CustomerFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: countries, isLoading: countriesLoading } = useCountryOptions();
  const { data: cities, isLoading: citiesLoading } = useCityOptions();
  const { data: customerTypes, isLoading: customerTypesLoading } = useCustomerTypeOptions();
  const { data: stokGroups = [], isLoading: isLoadingGroups } = useStokGroup();

  const form = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerCode: '',
      name: '',
      taxNumber: '',
      taxOffice: '',
      tcknNumber: '',
      address: '',
      phone: '',
      phone2: '',
      email: '',
      website: '',
      notes: '',
      countryId: undefined,
      cityId: undefined,
      districtId: undefined,
      customerTypeId: undefined,
      salesRepCode: '',
      groupCode: '',
      creditLimit: undefined,
      branchCode: 0,
      businessUnitCode: 0,
      isCompleted: false,
    },
  });

  const selectedCountryId = form.watch('countryId');
  const selectedCityId = form.watch('cityId');

  const { data: districts, isLoading: districtsLoading } = useDistrictOptions(selectedCityId);

  useEffect(() => {
    if (customer) {
      form.reset({
        customerCode: customer.customerCode || '',
        name: customer.name,
        taxNumber: customer.taxNumber || '',
        taxOffice: customer.taxOffice || '',
        tcknNumber: customer.tcknNumber || '',
        address: customer.address || '',
        phone: customer.phone || '',
        phone2: customer.phone2 || '',
        email: customer.email || '',
        website: customer.website || '',
        notes: customer.notes || '',
        countryId: customer.countryId,
        cityId: customer.cityId,
        districtId: customer.districtId,
        customerTypeId: customer.customerTypeId,
        salesRepCode: customer.salesRepCode || '',
        groupCode: customer.groupCode || '',
        creditLimit: customer.creditLimit,
        branchCode: customer.branchCode,
        businessUnitCode: customer.businessUnitCode,
        isCompleted: false,
      });
    } else {
      form.reset({
        customerCode: '',
        name: '',
        taxNumber: '',
        taxOffice: '',
        address: '',
        phone: '',
        phone2: '',
        email: '',
        website: '',
        notes: '',
        countryId: undefined,
        cityId: undefined,
        districtId: undefined,
        customerTypeId: undefined,
        salesRepCode: '',
        groupCode: '',
        creditLimit: undefined,
        branchCode: 0,
        businessUnitCode: 0,
        isCompleted: false,
      });
    }
  }, [customer, form]);

  useEffect(() => {
    if (!selectedCountryId || selectedCountryId === 0) {
      form.setValue('cityId', undefined);
      form.setValue('districtId', undefined);
    }
  }, [selectedCountryId, form]);

  useEffect(() => {
    if (!selectedCityId || selectedCityId === 0) {
      form.setValue('districtId', undefined);
    }
  }, [selectedCityId, form]);

  const handleSubmit = async (data: CustomerFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  const filteredCities = cities?.filter((city) => city.countryId === selectedCountryId) || [];
  const filteredDistricts = districts || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer
              ? t('customerManagement.form.editCustomer', 'Müşteri Düzenle')
              : t('customerManagement.form.addCustomer', 'Yeni Müşteri Ekle')}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? t('customerManagement.form.editDescription', 'Müşteri bilgilerini düzenleyin')
              : t('customerManagement.form.addDescription', 'Yeni müşteri bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.customerCode', 'Müşteri Kodu')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.customerCodePlaceholder', 'Müşteri kodunu girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.name', 'Müşteri Adı')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.namePlaceholder', 'Müşteri adını girin')}
                        maxLength={250}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.taxNumber', 'Vergi Numarası')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.taxNumberPlaceholder', 'Vergi numarasını girin (opsiyonel)')}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.taxOffice', 'Vergi Dairesi')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.taxOfficePlaceholder', 'Vergi dairesini girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tcknNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('customerManagement.form.tcknNumber', 'TCKN Numarası')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('customerManagement.form.tcknNumberPlaceholder', 'TCKN numarasını girin (opsiyonel)')}
                      maxLength={20}
                    />
                  </FormControl>
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
                    {t('customerManagement.form.address', 'Adres')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('customerManagement.form.addressPlaceholder', 'Adresi girin (opsiyonel)')}
                      maxLength={500}
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.phone', 'Telefon')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.phonePlaceholder', 'Telefon numarasını girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.phone2', 'Telefon 2')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.phone2Placeholder', 'İkinci telefon numarasını girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.email', 'E-posta')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('customerManagement.form.emailPlaceholder', 'E-posta adresini girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.website', 'Web Sitesi')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.websitePlaceholder', 'Web sitesi adresini girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
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
                    {t('customerManagement.form.notes', 'Notlar')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('customerManagement.form.notesPlaceholder', 'Notlar girin (opsiyonel)')}
                      maxLength={250}
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
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.country', 'Ülke')} *
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
                          <SelectValue placeholder={t('customerManagement.form.selectCountry', 'Ülke seçin')} />
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
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.city', 'Şehir')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value && field.value > 0 ? field.value.toString() : undefined}
                      disabled={citiesLoading || !selectedCountryId || selectedCountryId === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('customerManagement.form.selectCity', 'Şehir seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCities.map((city) => (
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.district', 'İlçe')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value && field.value > 0 ? field.value.toString() : undefined}
                      disabled={districtsLoading || !selectedCityId || selectedCityId === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('customerManagement.form.selectDistrict', 'İlçe seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredDistricts.map((district) => (
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

              <FormField
                control={form.control}
                name="customerTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.customerType', 'Müşteri Tipi')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value && field.value > 0 ? field.value.toString() : undefined}
                      disabled={customerTypesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('customerManagement.form.selectCustomerType', 'Müşteri tipi seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customerTypes?.map((customerType) => (
                          <SelectItem key={customerType.id} value={customerType.id.toString()}>
                            {customerType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salesRepCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.salesRepCode', 'Satış Temsilcisi Kodu')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerManagement.form.salesRepCodePlaceholder', 'Satış temsilcisi kodunu girin (opsiyonel)')}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.groupCode', 'Grup Kodu')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === '__none__' ? '' : value);
                      }}
                      value={field.value || '__none__'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('customerManagement.form.selectGroupCode', 'Grup Seçin (Opsiyonel)')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingGroups ? (
                          <SelectItem value="__loading__" disabled>Yükleniyor...</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="__none__">{t('common.none', 'Yok')}</SelectItem>
                            {stokGroups.map((group) => {
                              const groupCode = group.grupKodu || `__group_${group.isletmeKodu}_${group.subeKodu}`;
                              const displayText = group.grupKodu && group.grupAdi 
                                ? `${group.grupKodu} - ${group.grupAdi}`
                                : group.grupAdi || group.grupKodu || groupCode;
                              return (
                                <SelectItem key={groupCode} value={groupCode}>
                                  {displayText}
                                </SelectItem>
                              );
                            })}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.creditLimit', 'Kredi Limiti')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder={t('customerManagement.form.creditLimitPlaceholder', 'Kredi limitini girin (opsiyonel)')}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.branchCode', 'Şube Kodu')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('customerManagement.form.branchCodePlaceholder', 'Şube kodunu girin')}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessUnitCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerManagement.form.businessUnitCode', 'İş Birimi Kodu')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('customerManagement.form.businessUnitCodePlaceholder', 'İş birimi kodunu girin')}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isCompleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('customerManagement.form.isCompleted', 'Tamamlandı')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
