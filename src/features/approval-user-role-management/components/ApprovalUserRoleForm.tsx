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
import { approvalUserRoleFormSchema, type ApprovalUserRoleFormSchema } from '../types/approval-user-role-types';
import type { ApprovalUserRoleDto } from '../types/approval-user-role-types';
import { useUserOptions } from '@/features/user-discount-limit-management/hooks/useUserOptions';
import { useApprovalRoleOptions } from '@/features/approval-role-management/hooks/useApprovalRoleOptions';

interface ApprovalUserRoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalUserRoleFormSchema) => void | Promise<void>;
  userRole?: ApprovalUserRoleDto | null;
  isLoading?: boolean;
}

export function ApprovalUserRoleForm({
  open,
  onOpenChange,
  onSubmit,
  userRole,
  isLoading = false,
}: ApprovalUserRoleFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: userOptions = [] } = useUserOptions();
  const { data: approvalRoleOptions = [] } = useApprovalRoleOptions();

  const form = useForm<ApprovalUserRoleFormSchema>({
    resolver: zodResolver(approvalUserRoleFormSchema),
    defaultValues: {
      userId: 0,
      approvalRoleId: 0,
    },
  });

  useEffect(() => {
    if (userRole) {
      form.reset({
        userId: userRole.userId,
        approvalRoleId: userRole.approvalRoleId,
      });
    } else {
      form.reset({
        userId: 0,
        approvalRoleId: 0,
      });
    }
  }, [userRole, form]);

  const handleSubmit = async (data: ApprovalUserRoleFormSchema): Promise<void> => {
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
            {userRole
              ? t('approvalUserRole.form.editTitle', 'Onay Kullanıcı Rolü Düzenle')
              : t('approvalUserRole.form.addTitle', 'Yeni Onay Kullanıcı Rolü Ekle')}
          </DialogTitle>
          <DialogDescription>
            {userRole
              ? t('approvalUserRole.form.editDescription', 'Onay kullanıcı rolü bilgilerini düzenleyin')
              : t('approvalUserRole.form.addDescription', 'Yeni onay kullanıcı rolü bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalUserRole.form.userId', 'Kullanıcı')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                    value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('approvalUserRole.form.selectUser', 'Kullanıcı Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('approvalUserRole.form.noUserSelected', 'Kullanıcı seçilmedi')}
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

            <FormField
              control={form.control}
              name="approvalRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalUserRole.form.approvalRoleId', 'Onay Rolü')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                    value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('approvalUserRole.form.selectApprovalRole', 'Onay Rolü Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('approvalUserRole.form.noApprovalRoleSelected', 'Onay rolü seçilmedi')}
                      </SelectItem>
                      {approvalRoleOptions.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name} {role.approvalRoleGroupName ? `(${role.approvalRoleGroupName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
