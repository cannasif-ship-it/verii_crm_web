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
import { approvalRoleGroupFormSchema, type ApprovalRoleGroupFormSchema } from '../types/approval-role-group-types';
import type { ApprovalRoleGroupDto } from '../types/approval-role-group-types';
import { ShieldCheck } from 'lucide-react';

const INPUT_STYLE = "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200";
const LABEL_STYLE = "text-zinc-700 dark:text-zinc-300 font-medium";

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
    }
  };

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
                {group
                  ? t('approvalRoleGroup.form.editTitle', 'Onay Rol Grubu Düzenle')
                  : t('approvalRoleGroup.form.addTitle', 'Yeni Onay Rol Grubu Ekle')}
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                {group
                  ? t('approvalRoleGroup.form.editDescription', 'Onay rol grubu bilgilerini düzenleyin')
                  : t('approvalRoleGroup.form.addDescription', 'Yeni onay rol grubu bilgilerini girin')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={LABEL_STYLE}>
                      {t('approvalRoleGroup.form.name', 'Grup Adı')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('approvalRoleGroup.form.namePlaceholder', 'Grup adını girin')}
                        maxLength={100}
                        className={INPUT_STYLE}
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
