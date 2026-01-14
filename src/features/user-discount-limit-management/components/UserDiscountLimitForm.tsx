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
import { userDiscountLimitFormSchema, type UserDiscountLimitFormSchema } from '../types/user-discount-limit-types';
import type { UserDiscountLimitDto } from '../types/user-discount-limit-types';
import { useUserOptions } from '../hooks/useUserOptions';
import { useStokGroup } from '@/services/hooks/useStokGroup';
import { toast } from 'sonner';
import { userDiscountLimitApi } from '../api/user-discount-limit-api';

interface UserDiscountLimitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserDiscountLimitFormSchema) => void | Promise<void>;
  userDiscountLimit?: UserDiscountLimitDto | null;
  isLoading?: boolean;
}

export function UserDiscountLimitForm({
  open,
  onOpenChange,
  onSubmit,
  userDiscountLimit,
  isLoading = false,
}: UserDiscountLimitFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: users, isLoading: usersLoading } = useUserOptions();
  const { data: stokGroups = [], isLoading: isLoadingGroups } = useStokGroup();

  const form = useForm<UserDiscountLimitFormSchema>({
    resolver: zodResolver(userDiscountLimitFormSchema),
    defaultValues: {
      erpProductGroupCode: '',
      salespersonId: 0,
      maxDiscount1: 0,
      maxDiscount2: undefined,
      maxDiscount3: undefined,
    },
  });

  useEffect(() => {
    if (userDiscountLimit) {
      form.reset({
        erpProductGroupCode: userDiscountLimit.erpProductGroupCode,
        salespersonId: userDiscountLimit.salespersonId,
        maxDiscount1: userDiscountLimit.maxDiscount1,
        maxDiscount2: userDiscountLimit.maxDiscount2 || undefined,
        maxDiscount3: userDiscountLimit.maxDiscount3 || undefined,
      });
    } else {
      form.reset({
        erpProductGroupCode: '',
        salespersonId: 0,
        maxDiscount1: 0,
        maxDiscount2: undefined,
        maxDiscount3: undefined,
      });
    }
  }, [userDiscountLimit, form]);

  const handleSubmit = async (data: UserDiscountLimitFormSchema): Promise<void> => {
    if (!userDiscountLimit) {
      try {
        const existsResult = await userDiscountLimitApi.existsBySalespersonAndGroup(data.salespersonId, data.erpProductGroupCode);
        if (existsResult) {
          toast.error(t('userDiscountLimitManagement.alreadyExists', 'Bu satış temsilcisi ve ürün grubu kombinasyonu için zaten bir iskonto limiti mevcut'));
          return;
        }
      } catch (error) {
      }
    }
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
            {userDiscountLimit
              ? t('userDiscountLimitManagement.edit', 'İskonto Limiti Düzenle')
              : t('userDiscountLimitManagement.create', 'Yeni İskonto Limiti')}
          </DialogTitle>
          <DialogDescription>
            {userDiscountLimit
              ? t('userDiscountLimitManagement.editDescription', 'İskonto limiti bilgilerini düzenleyin')
              : t('userDiscountLimitManagement.createDescription', 'Yeni iskonto limiti bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="salespersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDiscountLimitManagement.salesperson', 'Satış Temsilcisi')} *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const numValue = Number(value);
                      field.onChange(numValue);
                    }}
                    value={field.value && field.value > 0 ? field.value.toString() : undefined}
                    disabled={usersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('userDiscountLimitManagement.selectSalesperson', 'Satış Temsilcisi Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
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
              name="erpProductGroupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDiscountLimitManagement.erpProductGroupCode', 'ERP Ürün Grubu Kodu')} *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('userDiscountLimitManagement.selectErpProductGroupCode', 'Grup Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                      <SelectContent>
                        {isLoadingGroups ? (
                          <SelectItem value="__loading__" disabled>Yükleniyor...</SelectItem>
                        ) : (
                          stokGroups.map((group) => {
                            const groupCode = group.grupKodu || `__group_${group.isletmeKodu}_${group.subeKodu}`;
                            const displayText = group.grupKodu && group.grupAdi 
                              ? `${group.grupKodu} - ${group.grupAdi}`
                              : group.grupAdi || group.grupKodu || groupCode;
                            return (
                              <SelectItem key={groupCode} value={groupCode}>
                                {displayText}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxDiscount1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDiscountLimitManagement.maxDiscount1', 'Maksimum İskonto 1')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ''}
                      placeholder={t('userDiscountLimitManagement.enterMaxDiscount1', 'Maksimum İskonto 1 Girin (0-100)')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxDiscount2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDiscountLimitManagement.maxDiscount2', 'Maksimum İskonto 2')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value || ''}
                      placeholder={t('userDiscountLimitManagement.enterMaxDiscount2', 'Maksimum İskonto 2 Girin (0-100, Opsiyonel)')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxDiscount3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDiscountLimitManagement.maxDiscount3', 'Maksimum İskonto 3')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value || ''}
                      placeholder={t('userDiscountLimitManagement.enterMaxDiscount3', 'Maksimum İskonto 3 Girin (0-100, Opsiyonel)')}
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
