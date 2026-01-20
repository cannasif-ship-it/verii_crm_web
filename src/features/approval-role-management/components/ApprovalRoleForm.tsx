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
import { approvalRoleFormSchema, type ApprovalRoleFormSchema } from '../types/approval-role-types';
import type { ApprovalRoleDto } from '../types/approval-role-types';
import { useApprovalRoleGroupOptions } from '../hooks/useApprovalRoleGroupOptions';

interface ApprovalRoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalRoleFormSchema) => void | Promise<void>;
  role?: ApprovalRoleDto | null;
  isLoading?: boolean;
}

export function ApprovalRoleForm({
  open,
  onOpenChange,
  onSubmit,
  role,
  isLoading = false,
}: ApprovalRoleFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: approvalRoleGroupOptions = [] } = useApprovalRoleGroupOptions();

  const form = useForm<ApprovalRoleFormSchema>({
    resolver: zodResolver(approvalRoleFormSchema),
    defaultValues: {
      approvalRoleGroupId: 0,
      name: '',
      maxAmount: 0,
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        approvalRoleGroupId: role.approvalRoleGroupId,
        name: role.name,
        maxAmount: role.maxAmount,
      });
    } else {
      form.reset({
        approvalRoleGroupId: 0,
        name: '',
        maxAmount: 0,
      });
    }
  }, [role, form]);

  const handleSubmit = async (data: ApprovalRoleFormSchema): Promise<void> => {
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
            {role
              ? t('approvalRole.form.editTitle', 'Onay Rolü Düzenle')
              : t('approvalRole.form.addTitle', 'Yeni Onay Rolü Ekle')}
          </DialogTitle>
          <DialogDescription>
            {role
              ? t('approvalRole.form.editDescription', 'Onay rolü bilgilerini düzenleyin')
              : t('approvalRole.form.addDescription', 'Yeni onay rolü bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="approvalRoleGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalRole.form.approvalRoleGroupId', 'Onay Rol Grubu')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                    value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('approvalRole.form.selectApprovalRoleGroup', 'Onay Rol Grubu Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('approvalRole.form.noApprovalRoleGroupSelected', 'Onay rol grubu seçilmedi')}
                      </SelectItem>
                      {approvalRoleGroupOptions.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalRole.form.name', 'Rol Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('approvalRole.form.namePlaceholder', 'Rol adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalRole.form.maxAmount', 'Maksimum Tutar')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      placeholder={t('approvalRole.form.maxAmountPlaceholder', 'Maksimum tutarı girin')}
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
