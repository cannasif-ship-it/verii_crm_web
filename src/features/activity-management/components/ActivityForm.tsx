import { type ReactElement, useEffect, useState } from 'react';
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

const INPUT_STYLE = `
  h-12 rounded-xl
  bg-slate-50 dark:bg-[#0f0a18] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  focus-visible:bg-white dark:focus-visible:bg-[#1a1025]
  focus-visible:border-pink-500 dark:focus-visible:border-pink-500/70
  focus-visible:ring-2 focus-visible:ring-pink-500/10 focus-visible:ring-offset-0
  transition-all duration-200 w-full
`;

const LABEL_STYLE = "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1 mb-2 flex items-center gap-2";

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
      status: 'Scheduled',
      isCompleted: false,
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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-5xl w-[95%] sm:w-full h-full max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1a1025]/50 flex flex-row items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-0.5 shadow-lg shadow-pink-500/20">
               <div className="h-full w-full bg-white dark:bg-[#130822] rounded-[14px] flex items-center justify-center">
                 <Calendar size={24} className="text-pink-600 dark:text-pink-500" />
               </div>
             </div>
             <div className="space-y-1">
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activity ? t('activityManagement.edit', 'Aktivite Düzenle') : t('activityManagement.create', 'Yeni Aktivite')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                  {activity ? t('activityManagement.editDescription', 'Aktivite bilgilerini düzenleyin') : t('activityManagement.createDescription', 'Yeni aktivite bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full">
            <X size={20} />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <Form {...form}>
            <form id="activity-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={LABEL_STYLE}><FileText size={14} className="text-pink-500" /> {t('activityManagement.subject', 'Konu')} <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input {...field} className={INPUT_STYLE} placeholder={t('activityManagement.enterSubject', 'Örn: Proje Toplantısı')} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="activityType" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><List size={14} className="text-pink-500" /> {t('activityManagement.activityType', 'Tip')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={activityTypes.map(type => ({ value: String(type.id), label: type.name }))}
                                    value={field.value ? String(field.value) : ''}
                                    onValueChange={field.onChange}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="status" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><CheckSquare size={14} className="text-pink-500" /> {t('activityManagement.status', 'Durum')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={ACTIVITY_STATUSES.map(status => ({ value: status.value, label: t(`activityManagement.status${status.value.replace(' ', '')}`, status.label) }))}
                                    value={field.value} onValueChange={field.onChange}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />
                      </div>

                      <FormField control={form.control} name="potentialCustomerId" render={({ field }) => {
                          const watchedErpCode = form.watch('erpCustomerCode');
                          const selectedCustomer = customerOptions.find((c) => c.id === field.value);
                          const displayValue = selectedCustomer ? selectedCustomer.name : watchedErpCode ? t('activityManagement.erpLabel', { code: watchedErpCode }) : '';

                          return (
                            <FormItem>
                              <FormLabel className={LABEL_STYLE}><Building2 size={14} className="text-pink-500" /> {t('activityManagement.customer', 'Müşteri')}</FormLabel>
                              <div className="flex w-full items-center gap-2">
                                <FormControl>
                                  <Input 
                                    readOnly 
                                    value={displayValue} 
                                    placeholder={t('activityManagement.selectCustomer', 'Müşteri seçin')} 
                                    className={`${INPUT_STYLE} flex-1`} 
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setCustomerSelectDialogOpen(true)} 
                                  className="h-12 w-12 shrink-0 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                  <Search size={18} />
                                </Button>
                                {(field.value || watchedErpCode) && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 shrink-0 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                    onClick={() => { field.onChange(undefined); form.setValue('erpCustomerCode', ''); }}
                                  >
                                    <X size={18} />
                                  </Button>
                                )}
                              </div>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField control={form.control} name="productCode" render={({ field }) => {
                          const watchedProductName = form.watch('productName');
                          const displayValue = field.value && watchedProductName ? `${field.value} - ${watchedProductName}` : field.value || watchedProductName || '';

                          return (
                            <FormItem>
                              <FormLabel className={LABEL_STYLE}><Box size={14} className="text-pink-500" /> {t('activityManagement.product', 'Stok/Ürün')}</FormLabel>
                              <div className="flex w-full items-center gap-2">
                                <FormControl>
                                  <Input 
                                    readOnly 
                                    value={displayValue} 
                                    placeholder={t('activityManagement.selectProduct', 'Stok/Ürün seçin')} 
                                    className={`${INPUT_STYLE} flex-1`} 
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setProductSelectDialogOpen(true)} 
                                  className="h-12 w-12 shrink-0 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                  <Search size={18} />
                                </Button>
                                {(field.value || watchedProductName) && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 shrink-0 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                    onClick={() => { field.onChange(''); form.setValue('productName', ''); }}
                                  >
                                    <X size={18} />
                                  </Button>
                                )}
                              </div>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          );
                        }}
                      />
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="activityDate" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><Calendar size={14} className="text-pink-500" /> {t('activityManagement.activityDate', 'Tarih')} <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} type="date" className={INPUT_STYLE} value={field.value || ''} /></FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="priority" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><AlertCircle size={14} className="text-pink-500" /> {t('activityManagement.priority', 'Öncelik')}</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={[{ value: 'none', label: t('activityManagement.noPrioritySelected', 'Seçilmedi') }, ...ACTIVITY_PRIORITIES.map(priority => ({ value: priority.value, label: t(`activityManagement.priority${priority.value}`, priority.label) }))]}
                                    value={field.value || 'none'} onValueChange={(value) => field.onChange(value && value !== 'none' ? value : undefined)}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="contactId" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><User size={14} className="text-pink-500" /> {t('activityManagement.contactId', 'İletişim')}</FormLabel>
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
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="assignedUserId" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_STYLE}><User size={14} className="text-pink-500" /> {t('activityManagement.assignedUser', 'Atanan Kullanıcı')}</FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={[{ value: 'none', label: t('activityManagement.noUserSelected', 'Seçilmedi') }, ...userOptions.map(user => ({ value: user.id.toString(), label: user.fullName }))]}
                                    value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                                    onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                                    placeholder={t('activityManagement.select', 'Seç')}
                                    className={INPUT_STYLE}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                          )} />
                      </div>

                      <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={LABEL_STYLE}><FileText size={14} className="text-pink-500" /> {t('activityManagement.description', 'Açıklama')}</FormLabel>
                            <FormControl><Textarea {...field} className={`${INPUT_STYLE} min-h-[100px] py-3`} placeholder={t('activityManagement.enterDescription', 'Aktivite detaylarını girin...')} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                      )} />
                      
                      <FormField control={form.control} name="isCompleted" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-semibold text-slate-900 dark:text-white">{t('activityManagement.completed', 'Tamamlandı')}</FormLabel>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{t('activityManagement.completedDescription', 'Aktiviteyi tamamlandı olarak işaretle')}</div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-pink-500"
                              />
                            </FormControl>
                          </FormItem>
                      )} />
                  </div>
              </div>

              <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-white/80 dark:bg-[#130822]/80 backdrop-blur-sm border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 px-6 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-slate-700 dark:text-slate-200">{t('common.cancel', 'Vazgeç')}</Button>
                <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-bold shadow-lg shadow-pink-500/20">{isLoading ? t('common.saving', 'Kaydediliyor...') : activity ? t('common.update', 'Güncelle') : t('common.save', 'Kaydet')}</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
      
      <CustomerSelectDialog
        open={customerSelectDialogOpen}
        onOpenChange={setCustomerSelectDialogOpen}
        onSelect={(customer: CustomerSelectionResult) => {
          form.setValue('potentialCustomerId', customer.customerId);
          form.setValue('erpCustomerCode', customer.erpCustomerCode);
          setCustomerSelectDialogOpen(false);
        }}
      />
      
      <ProductSelectDialog
        open={productSelectDialogOpen}
        onOpenChange={setProductSelectDialogOpen}
        onSelect={(product: ProductSelectionResult) => {
          form.setValue('productCode', product.code);
          form.setValue('productName', product.name);
          setProductSelectDialogOpen(false);
        }}
      />
    </Dialog>
  );
}