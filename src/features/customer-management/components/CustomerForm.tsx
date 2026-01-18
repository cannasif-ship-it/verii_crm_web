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

// --- GÜNCELLENMİŞ PEMBE EFEKTLİ INPUT STİLİ ---
const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  /* LIGHT MODE FOCUS: Belirgin Pembe Border ve Glow */
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  /* DARK MODE FOCUS: Neon Pembe Border ve Glow */
  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block";

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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-full flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        
        {/* HEADER: Sabit */}
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {customer
                    ? t('customerManagement.form.editCustomer', 'Müşteri Düzenle')
                    : t('customerManagement.form.addCustomer', 'Yeni Müşteri Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {customer
                    ? t('customerManagement.form.editDescription', 'Müşteri bilgilerini düzenleyin')
                    : t('customerManagement.form.addDescription', 'Yeni müşteri bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        {/* BODY: Kaydırılabilir */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="customer-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              
              {/* Grup: Temel Bilgiler */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.customerCode', 'Müşteri Kodu')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.customerCodePlaceholder', 'Müşteri kodunu girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.name', 'Müşteri Adı')} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.namePlaceholder', 'Müşteri adını girin')}
                          maxLength={250}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grup: Vergi */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.taxNumber', 'Vergi Numarası')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.taxNumberPlaceholder', 'Vergi numarasını girin (opsiyonel)')}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxOffice"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.taxOffice', 'Vergi Dairesi')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.taxOfficePlaceholder', 'Vergi dairesini girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tcknNumber"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('customerManagement.form.tcknNumber', 'TCKN Numarası')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={INPUT_STYLE}
                        placeholder={t('customerManagement.form.tcknNumberPlaceholder', 'TCKN numarasını girin (opsiyonel)')}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('customerManagement.form.address', 'Adres')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={`${INPUT_STYLE} h-auto min-h-[80px] py-2`}
                        placeholder={t('customerManagement.form.addressPlaceholder', 'Adresi girin (opsiyonel)')}
                        maxLength={500}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.phone', 'Telefon')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.phonePlaceholder', 'Telefon numarasını girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone2"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.phone2', 'Telefon 2')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.phone2Placeholder', 'İkinci telefon numarasını girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.email', 'E-posta')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.emailPlaceholder', 'E-posta adresini girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.website', 'Web Sitesi')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.websitePlaceholder', 'Web sitesi adresini girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
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
                      {t('customerManagement.form.notes', 'Notlar')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={`${INPUT_STYLE} h-auto min-h-[80px] py-2`}
                        placeholder={t('customerManagement.form.notesPlaceholder', 'Notlar girin (opsiyonel)')}
                        maxLength={250}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('customerManagement.form.selectCountry', 'Ülke seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {countries?.map((country) => (
                            <SelectItem key={country.id} value={country.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 py-2">
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
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('customerManagement.form.selectCity', 'Şehir seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {filteredCities.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 py-2">
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('customerManagement.form.selectDistrict', 'İlçe seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {filteredDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 py-2">
                              {district.name}
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
                  name="customerTypeId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
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
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('customerManagement.form.selectCustomerType', 'Müşteri tipi seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {customerTypes?.map((customerType) => (
                            <SelectItem key={customerType.id} value={customerType.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 py-2">
                              {customerType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="salesRepCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.salesRepCode', 'Satış Temsilcisi Kodu')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.salesRepCodePlaceholder', 'Satış temsilcisi kodunu girin (opsiyonel)')}
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.groupCode', 'Grup Kodu')}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value === '__none__' ? '' : value);
                        }}
                        value={field.value || '__none__'}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('customerManagement.form.selectGroupCode', 'Grup Seçin (Opsiyonel)')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
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
                                  <SelectItem key={groupCode} value={groupCode} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 py-2">
                                    {displayText}
                                  </SelectItem>
                                );
                              })}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.creditLimit', 'Kredi Limiti')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.creditLimitPlaceholder', 'Kredi limitini girin (opsiyonel)')}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branchCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.branchCode', 'Şube Kodu')} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.branchCodePlaceholder', 'Şube kodunu girin')}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessUnitCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        {t('customerManagement.form.businessUnitCode', 'İş Birimi Kodu')} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className={INPUT_STYLE}
                          placeholder={t('customerManagement.form.businessUnitCodePlaceholder', 'İş birimi kodunu girin')}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0516] p-4 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('customerManagement.form.isCompleted', 'Tamamlandı')}
                      </FormLabel>
                      <DialogDescription className="text-[10px] text-slate-500 dark:text-slate-500">
                        Bu müşterinin tüm bilgileri eksiksiz dolduruldu mu?
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* FOOTER: Sabit ve Stilize */}
        <DialogFooter className="border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            {t('common.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit" 
            form="customer-form" // Form ID'si ile ilişkilendirildi
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-8"
          >
            {isLoading
              ? t('common.saving', 'Kaydediliyor...')
              : t('common.save', 'Kaydet')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}