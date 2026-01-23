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
import { ShieldCheck } from 'lucide-react';

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

  const inputClass = "h-11 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus-visible:border-pink-500 focus-visible:ring-4 focus-visible:ring-pink-500/20 transition-all duration-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-0 bg-white dark:bg-[#130822] shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500" />
        
        <DialogHeader className="p-6 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {role
                  ? t('approvalRole.form.editTitle', 'Onay Rolü Düzenle')
                  : t('approvalRole.form.addTitle', 'Yeni Onay Rolü Ekle')}
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                {role
                  ? t('approvalRole.form.editDescription', 'Onay rolü bilgilerini düzenleyin')
                  : t('approvalRole.form.addDescription', 'Yeni onay rolü bilgilerini girin')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="approvalRoleGroupId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {t('approvalRole.form.approvalRoleGroupId', 'Onay Rol Grubu')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                      value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                    >
                      <FormControl>
                        <SelectTrigger className={inputClass}>
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {t('approvalRole.form.name', 'Rol Adı')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={inputClass}
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
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
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {t('common.cancel', 'İptal')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg shadow-pink-500/20 border-0"
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
