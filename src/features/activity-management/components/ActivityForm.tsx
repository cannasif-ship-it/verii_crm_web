import { type ReactElement, useEffect, useState } from 'react';
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
import { Combobox } from '@/components/ui/combobox';
import { activityFormSchema, type ActivityFormSchema } from '../types/activity-types';
import type { ActivityDto } from '../types/activity-types';
import { ACTIVITY_STATUSES, ACTIVITY_PRIORITIES } from '../utils/activity-constants';
import { activityTypeApi } from '@/features/activity-type/api/activity-type-api';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useUserOptions } from '@/features/user-discount-limit-management/hooks/useUserOptions';
import { useQuery } from '@tanstack/react-query';
import { contactApi } from '@/features/contact-management/api/contact-api';
import type { PagedFilter } from '@/types/api';
import { CustomerSelectDialog, type CustomerSelectionResult } from '@/components/shared';
import { ProductSelectDialog, type ProductSelectionResult } from '@/components/shared/ProductSelectDialog';
import { 
  Search, 
  Calendar, 
  FileText, 
  List, 
  CheckSquare, 
  Building2, 
  Box, 
  User, 
  AlertCircle, 
  Briefcase, 
  X 
} from 'lucide-react';

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormSchema) => void | Promise<void>;
  activity?: ActivityDto | null;
  isLoading?: boolean;
  initialDate?: string | null;
}

// STİL: Standart yükseklik ve kenarlıklar
const BASE_INPUT = "h-10 rounded-lg bg-slate-50 dark:bg-[#0c0516] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-0 focus:border-pink-500 transition-all";
const INPUT_STYLE = `${BASE_INPUT} w-full`;
const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 flex items-center gap-1.5";

export function ActivityForm({
  open,
  onOpenChange,
  onSubmit,
  activity,
  isLoading = false,
  initialDate,
}: ActivityFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customerOptions = [] } = useCustomerOptions();
  const { data: userOptions = [] } = useUserOptions();
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [productSelectDialogOpen, setProductSelectDialogOpen] = useState(false);

  const form = useForm<ActivityFormSchema>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      activityType: '',
      potentialCustomerId: undefined,
      erpCustomerCode: '',
      productCode: '',
      productName: '',
      status: 'Scheduled',
      isCompleted: false,
      priority: undefined,
      contactId: undefined,
      assignedUserId: undefined,
      activityDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedStatus = form.watch('status');
  const watchedCustomerId = form.watch('potentialCustomerId');

  const { data: activityTypesResponse } = useQuery({
    queryKey: ['activityTypes'],
    queryFn: async () => {
      const response = await activityTypeApi.getList({ pageNumber: 1, pageSize: 1000, sortBy: 'Id', sortDirection: 'asc' });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const activityTypes = activityTypesResponse || [];

  const { data: contactData } = useQuery({
    queryKey: ['contactOptions', watchedCustomerId],
    queryFn: async () => {
      const response = await contactApi.getList({
        pageNumber: 1, pageSize: 1000, sortBy: 'Id', sortDirection: 'asc',
        filters: watchedCustomerId ? [{ column: 'CustomerId', operator: 'eq', value: watchedCustomerId.toString() }] as PagedFilter[] : undefined,
      });
      return response.data || [];
    },
    enabled: !!watchedCustomerId,
    staleTime: 5 * 60 * 1000,
  });
  const contactOptions = contactData || [];

  useEffect(() => {
    if (open && !activity && initialDate) {
      form.setValue('activityDate', initialDate);
    }
  }, [open, initialDate, activity, form]);

  useEffect(() => {
    if (activity) {
      // @ts-ignore
      form.reset({
        subject: activity.subject,
        description: activity.description || '',
        activityType: activity.activityType ? String(activity.activityType) : '',
        potentialCustomerId: activity.potentialCustomerId || undefined,
        erpCustomerCode: activity.erpCustomerCode || '',
        productCode: activity.productCode || '',
        productName: activity.productName || '',
        status: activity.status,
        isCompleted: activity.isCompleted,
        priority: activity.priority || undefined,
        contactId: activity.contactId || undefined,
        assignedUserId: activity.assignedUserId || undefined,
        activityDate: activity.activityDate ? new Date(activity.activityDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      // @ts-ignore
      form.reset({
        subject: '',
        description: '',
        activityType: '',
        potentialCustomerId: undefined,
        erpCustomerCode: '',
        productCode: '',
        productName: '',
        status: 'Scheduled',
        isCompleted: false,
        priority: undefined,
        contactId: undefined,
        assignedUserId: undefined,
        activityDate: initialDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [activity, form, initialDate]);

  useEffect(() => {
    if (watchedStatus === 'Completed') form.setValue('isCompleted', true);
    else if (watchedStatus !== 'Completed' && form.getValues('isCompleted')) form.setValue('isCompleted', false);
  }, [watchedStatus, form]);

  useEffect(() => {
    if (!watchedCustomerId) form.setValue('contactId', undefined);
  }, [watchedCustomerId, form]);

  const handleSubmit = async (data: ActivityFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-5xl max-h-[95vh] h-full flex flex-col gap-0 p-0 overflow-hidden sm:rounded-2xl">
        
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center gap-3 space-y-0">
           <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
             <Calendar size={20} />
           </div>
           <div>
              <DialogTitle className="text-lg font-bold">{activity ? t('activityManagement.edit', 'Aktivite Düzenle') : t('activityManagement.create', 'Yeni Aktivite')}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{activity ? t('activityManagement.editDescription', 'Aktivite bilgilerini düzenleyin') : t('activityManagement.createDescription', 'Yeni aktivite bilgilerini girin')}</DialogDescription>
           </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="activity-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SOL KOLON */}
                  <div className="space-y-5">
                      <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormLabel className={LABEL_STYLE}><FileText size={12} className="text-pink-500" /> {t('activityManagement.subject', 'Konu')} *</FormLabel>
                            <FormControl><Input {...field} className={INPUT_STYLE} placeholder={t('activityManagement.enterSubject', 'Konu Girin')} /></FormControl>
                            <FormMessage className="text-red-500 text-[10px]" />
                          </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="activityType" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><List size={12} className="text-pink-500" /> {t('activityManagement.activityType', 'Tip')} *</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={activityTypes.map(type => ({ value: String(type.id), label: type.name }))}
                                    value={field.value ? String(field.value) : ''}
                                    onValueChange={field.onChange}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="status" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><CheckSquare size={12} className="text-pink-500" /> {t('activityManagement.status', 'Durum')} *</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={ACTIVITY_STATUSES.map(status => ({ value: status.value, label: t(`activityManagement.status${status.value.replace(' ', '')}`, status.label) }))}
                                    value={field.value} onValueChange={field.onChange}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />
                      </div>

                      {/* MÜŞTERİ SEÇİMİ - DÜZELTME: min-w-0 ve flex-1 */}
                      <FormField control={form.control} name="potentialCustomerId" render={({ field }) => {
                          const watchedErpCode = form.watch('erpCustomerCode');
                          const selectedCustomer = customerOptions.find((c) => c.id === field.value);
                          const displayValue = selectedCustomer ? selectedCustomer.name : watchedErpCode ? t('activityManagement.erpLabel', { code: watchedErpCode }) : '';

                          return (
                            <FormItem className="space-y-0 w-full">
                              <FormLabel className={LABEL_STYLE}><Building2 size={12} className="text-pink-500" /> {t('activityManagement.customer', 'Müşteri')}</FormLabel>
                              <div className="flex w-full items-center gap-2">
                                <FormControl>
                                  <Input 
                                    readOnly 
                                    value={displayValue} 
                                    placeholder={t('activityManagement.selectCustomer', 'Müşteri seçin')} 
                                    className={`${BASE_INPUT} flex-1 min-w-0`} 
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setCustomerSelectDialogOpen(true)} 
                                  className="h-10 shrink-0 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 px-4"
                                >
                                  <Search size={16} className="mr-2" /> Seç
                                </Button>
                                {(field.value || watchedErpCode) && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                    onClick={() => { field.onChange(undefined); form.setValue('erpCustomerCode', ''); }}
                                  >
                                    <X size={16} />
                                  </Button>
                                )}
                              </div>
                              <FormMessage className="text-red-500 text-[10px]" />
                            </FormItem>
                          );
                        }}
                      />

                      {/* ÜRÜN SEÇİMİ - DÜZELTME: min-w-0 ve flex-1 */}
                      <FormField control={form.control} name="productCode" render={({ field }) => {
                          const watchedProductName = form.watch('productName');
                          const displayValue = field.value && watchedProductName ? `${field.value} - ${watchedProductName}` : field.value || watchedProductName || '';

                          return (
                            <FormItem className="space-y-0 w-full">
                              <FormLabel className={LABEL_STYLE}><Box size={12} className="text-pink-500" /> {t('activityManagement.product', 'Stok/Ürün')}</FormLabel>
                              <div className="flex w-full items-center gap-2">
                                <FormControl>
                                  <Input 
                                    readOnly 
                                    value={displayValue} 
                                    placeholder={t('activityManagement.selectProduct', 'Stok/Ürün seçin')} 
                                    className={`${BASE_INPUT} flex-1 min-w-0`} 
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-10 w-10 shrink-0 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5" 
                                  onClick={() => setProductSelectDialogOpen(true)}
                                >
                                  <Search size={16} />
                                </Button>
                                {(field.value || watchedProductName) && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                    onClick={() => { field.onChange(''); form.setValue('productName', ''); }}
                                  >
                                    <X size={16} />
                                  </Button>
                                )}
                              </div>
                              <FormMessage className="text-red-500 text-[10px]" />
                            </FormItem>
                          );
                        }}
                      />
                  </div>

                  {/* SAĞ KOLON */}
                  <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="activityDate" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><Calendar size={12} className="text-pink-500" /> {t('activityManagement.activityDate', 'Tarih')} *</FormLabel>
                                <FormControl><Input {...field} type="date" className={INPUT_STYLE} value={field.value || ''} /></FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="priority" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><AlertCircle size={12} className="text-pink-500" /> {t('activityManagement.priority', 'Öncelik')}</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={[{ value: 'none', label: t('activityManagement.noPrioritySelected', 'Seçilmedi') }, ...ACTIVITY_PRIORITIES.map(priority => ({ value: priority.value, label: t(`activityManagement.priority${priority.value}`, priority.label) }))]}
                                    value={field.value || 'none'} onValueChange={(value) => field.onChange(value && value !== 'none' ? value : undefined)}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="contactId" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><User size={12} className="text-pink-500" /> {t('activityManagement.contactId', 'İletişim')}</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={[{ value: 'none', label: t('activityManagement.noContactSelected', 'Seçilmedi') }, ...contactOptions.map(contact => ({ value: contact.id.toString(), label: contact.fullName }))]}
                                    value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                                    onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                                    placeholder={watchedCustomerId ? t('activityManagement.select', 'Seç') : t('activityManagement.selectCustomerFirst', 'Önce Müşteri')}
                                    disabled={!watchedCustomerId}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="assignedUserId" render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormLabel className={LABEL_STYLE}><Briefcase size={12} className="text-pink-500" /> {t('activityManagement.assignedUserId', 'Kullanıcı')}</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={[{ value: 'none', label: t('activityManagement.noUserSelected', 'Seçilmedi') }, ...userOptions.map(user => ({ value: user.id.toString(), label: user.fullName || user.username }))]}
                                    value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                                    onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-[10px]" />
                              </FormItem>
                          )} />
                      </div>

                      <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormLabel className={LABEL_STYLE}><FileText size={12} className="text-pink-500" /> {t('activityManagement.description', 'Açıklama')}</FormLabel>
                            <FormControl>
                              <Textarea {...field} className={`${INPUT_STYLE} h-auto min-h-[88px] py-3`} placeholder={t('activityManagement.enterDescription', 'Açıklama Girin (Opsiyonel)')} rows={3} />
                            </FormControl>
                            <FormMessage className="text-red-500 text-[10px]" />
                          </FormItem>
                      )} />
                  </div>
              </div>

              <FormField control={form.control} name="isCompleted" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0516] p-4 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">{t('activityManagement.isCompleted', 'Tamamlandı')}</FormLabel>
                      <DialogDescription className="text-[10px]">{t('activityManagement.isCompletedDesc', 'Bu aktivite tamamlandı olarak işaretlensin mi?')}</DialogDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-pink-600" /></FormControl>
                  </FormItem>
              )} />

            </form>
          </Form>
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-white/10 px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">{t('activityManagement.cancel', 'İptal')}</Button>
          <Button type="submit" form="activity-form" disabled={isLoading} className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 px-8">{isLoading ? t('activityManagement.saving', 'Kaydediliyor...') : t('activityManagement.save', 'Kaydet')}</Button>
        </DialogFooter>

        {/* DIALOGLAR */}
        <CustomerSelectDialog
          open={customerSelectDialogOpen} onOpenChange={setCustomerSelectDialogOpen}
          onSelect={(result: CustomerSelectionResult) => {
            if (result.customerId) { form.setValue('potentialCustomerId', result.customerId); form.setValue('erpCustomerCode', ''); }
            else if (result.erpCustomerCode) { form.setValue('potentialCustomerId', undefined); form.setValue('erpCustomerCode', result.erpCustomerCode); }
          }}
        />
        <ProductSelectDialog
          open={productSelectDialogOpen} onOpenChange={setProductSelectDialogOpen}
          onSelect={(result: ProductSelectionResult) => { form.setValue('productCode', result.code); form.setValue('productName', result.name); }}
        />
      </DialogContent>
    </Dialog>
  );
}