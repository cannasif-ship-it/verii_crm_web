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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Search } from 'lucide-react';

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormSchema) => void | Promise<void>;
  activity?: ActivityDto | null;
  isLoading?: boolean;
  initialDate?: string | null;
}

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
      const response = await activityTypeApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Id',
        sortDirection: 'asc',
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const activityTypes = activityTypesResponse || [];

  const { data: contactData } = useQuery({
    queryKey: ['contactOptions', watchedCustomerId],
    queryFn: async () => {
      const response = await contactApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Id',
        sortDirection: 'asc',
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
      form.reset({
        subject: activity.subject,
        description: activity.description || '',
        activityType: activity.activityType,
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
  }, [activity, form]);

  useEffect(() => {
    if (watchedStatus === 'Completed') {
      form.setValue('isCompleted', true);
    } else if (watchedStatus !== 'Completed' && form.getValues('isCompleted')) {
      form.setValue('isCompleted', false);
    }
  }, [watchedStatus, form]);

  useEffect(() => {
    if (!watchedCustomerId) {
      form.setValue('contactId', undefined);
    }
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity
              ? t('activityManagement.edit', 'Aktivite Düzenle')
              : t('activityManagement.create', 'Yeni Aktivite')}
          </DialogTitle>
          <DialogDescription>
            {activity
              ? t('activityManagement.editDescription', 'Aktivite bilgilerini düzenleyin')
              : t('activityManagement.createDescription', 'Yeni aktivite bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('activityManagement.subject', 'Konu')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('activityManagement.enterSubject', 'Konu Girin')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('activityManagement.description', 'Açıklama')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('activityManagement.enterDescription', 'Açıklama Girin (Opsiyonel)')}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.activityType', 'Aktivite Tipi')} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('activityManagement.selectActivityType', 'Aktivite Tipi Seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.status', 'Durum')} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('activityManagement.selectStatus', 'Durum Seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {t(`activityManagement.status${status.value.replace(' ', '')}`, status.label)}
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
              name="potentialCustomerId"
              render={({ field }) => {
                const watchedErpCode = form.watch('erpCustomerCode');
                const selectedCustomer = customerOptions.find((c) => c.id === field.value);
                const displayValue = selectedCustomer 
                  ? selectedCustomer.name 
                  : watchedErpCode 
                    ? t('activityManagement.erpLabel', { code: watchedErpCode }) 
                    : '';

                return (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.customer', 'Müşteri')}
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          readOnly
                          value={displayValue}
                          placeholder={t('activityManagement.selectCustomer', 'Müşteri seçin (Opsiyonel)')}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCustomerSelectDialogOpen(true)}
                      >
                        {t('activityManagement.selectCustomer', 'Müşteri Seç')}
                      </Button>
                      {(field.value || watchedErpCode) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            field.onChange(undefined);
                            form.setValue('erpCustomerCode', '');
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="activityDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('activityManagement.activityDate', 'Aktivite Tarihi')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productCode"
              render={({ field }) => {
                const watchedProductName = form.watch('productName');
                const displayValue = field.value && watchedProductName
                  ? t('activityManagement.productDisplay', { code: field.value, name: watchedProductName })
                  : field.value || watchedProductName || '';

                return (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.product', 'Stok/Ürün')}
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          readOnly
                          value={displayValue}
                          placeholder={t('activityManagement.selectProduct', 'Stok/Ürün seçin (Opsiyonel)')}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setProductSelectDialogOpen(true)}
                        title={t('activityManagement.selectProduct', 'Stok/Ürün Seç')}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      {(field.value || watchedProductName) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            field.onChange('');
                            form.setValue('productName', '');
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('activityManagement.contactId', 'İletişim')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                    value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                    disabled={!watchedCustomerId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchedCustomerId ? t('activityManagement.selectContact', 'İletişim Seçin (Opsiyonel)') : t('activityManagement.selectCustomerFirst', 'Önce müşteri seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {t('activityManagement.noContactSelected', 'İletişim seçilmedi')}
                      </SelectItem>
                      {contactOptions.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.priority', 'Öncelik')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? value : undefined)}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('activityManagement.selectPriority', 'Öncelik Seçin (Opsiyonel)')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('activityManagement.noPrioritySelected', 'Öncelik seçilmedi')}
                        </SelectItem>
                        {ACTIVITY_PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {t(`activityManagement.priority${priority.value}`, priority.label)}
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
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('activityManagement.assignedUserId', 'Atanan Kullanıcı')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) : undefined)}
                      value={field.value && field.value !== 0 ? field.value.toString() : 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('activityManagement.selectAssignedUser', 'Atanan Kullanıcı Seçin (Opsiyonel)')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('activityManagement.noUserSelected', 'Kullanıcı seçilmedi')}
                        </SelectItem>
                        {userOptions.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName || user.username}
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
              name="isCompleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('activityManagement.isCompleted', 'Tamamlandı')}
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
                {t('activityManagement.cancel', 'İptal')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('activityManagement.saving', 'Kaydediliyor...')
                  : t('activityManagement.save', 'Kaydet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <CustomerSelectDialog
          open={customerSelectDialogOpen}
          onOpenChange={setCustomerSelectDialogOpen}
          onSelect={(result: CustomerSelectionResult) => {
            if (result.customerId) {
              form.setValue('potentialCustomerId', result.customerId);
              form.setValue('erpCustomerCode', '');
            } else if (result.erpCustomerCode) {
              form.setValue('potentialCustomerId', undefined);
              form.setValue('erpCustomerCode', result.erpCustomerCode);
            }
          }}
        />

        <ProductSelectDialog
          open={productSelectDialogOpen}
          onOpenChange={setProductSelectDialogOpen}
          onSelect={(result: ProductSelectionResult) => {
            form.setValue('productCode', result.code);
            form.setValue('productName', result.name);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
