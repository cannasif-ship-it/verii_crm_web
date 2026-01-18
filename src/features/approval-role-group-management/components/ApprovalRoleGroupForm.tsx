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
import { approvalRoleGroupFormSchema, type ApprovalRoleGroupFormSchema } from '../types/approval-role-group-types';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';

interface ApprovalRoleGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalRoleGroupFormSchema) => void | Promise<void>;
  group?: ApprovalRoleGroupDto | null;
  isLoading?: boolean;
}

export function ApprovalRoleGroupForm({
  open,
  onOpenChange,
  onSubmit,
  group,
  isLoading = false,
}: ApprovalRoleGroupFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<ApprovalRoleGroupFormSchema>({
    resolver: zodResolver(approvalRoleGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [group, form]);

  const handleSubmit = async (data: ApprovalRoleGroupFormSchema): Promise<void> => {
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
            {group
              ? t('approvalRoleGroup.form.editTitle', 'Onay Rol Grubu Düzenle')
              : t('approvalRoleGroup.form.addTitle', 'Yeni Onay Rol Grubu Ekle')}
          </DialogTitle>
          <DialogDescription>
            {group
              ? t('approvalRoleGroup.form.editDescription', 'Onay rol grubu bilgilerini düzenleyin')
              : t('approvalRoleGroup.form.addDescription', 'Yeni onay rol grubu bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalRoleGroup.form.name', 'Grup Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('approvalRoleGroup.form.namePlaceholder', 'Grup adını girin')}
                      maxLength={100}
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
