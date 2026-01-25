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
import { ShieldCheck } from 'lucide-react';

interface ApprovalUserRoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalUserRoleFormSchema) => void | Promise<void>;
  userRole?: ApprovalUserRoleDto | null;
  isLoading?: boolean;
}

// --- MODERN TASARIM SABİTLERİ ---
const INPUT_STYLE = `
  h-11 rounded-lg
  bg-slate-50 dark:bg-[#0c0516] 
  border border-slate-200 dark:border-white/10 
  text-slate-900 dark:text-white text-sm
  placeholder:text-slate-400 dark:placeholder:text-slate-600 
  
  focus-visible:ring-0 focus-visible:ring-offset-0 
  
  /* LIGHT MODE FOCUS */
  focus:bg-white 
  focus:border-pink-500 
  focus:shadow-[0_0_0_3px_rgba(236,72,153,0.15)] 

  /* DARK MODE FOCUS */
  dark:focus:bg-[#0c0516] 
  dark:focus:border-pink-500/60 
  dark:focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)]

  transition-all duration-200
`;

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block";

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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-lg shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <ShieldCheck size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {userRole
                    ? t('approvalUserRole.form.editTitle', 'Onay Kullanıcı Rolü Düzenle')
                    : t('approvalUserRole.form.addTitle', 'Yeni Onay Kullanıcı Rolü Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {userRole
                    ? t('approvalUserRole.form.editDescription', 'Onay kullanıcı rolü bilgilerini düzenleyin')
                    : t('approvalUserRole.form.addDescription', 'Yeni onay kullanıcı rolü bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('approvalUserRole.form.userId', 'Kullanıcı')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                      value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_STYLE}>
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
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalRoleId"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('approvalUserRole.form.approvalRoleId', 'Onay Rolü')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== '0' ? parseInt(value) : 0)}
                      value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_STYLE}>
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
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  {t('approvalUserRole.form.cancel', 'İptal')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-10 px-6 rounded-lg bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-medium shadow-lg shadow-pink-500/20 border-0"
                >
                  {isLoading
                    ? t('approvalUserRole.form.saving', 'Kaydediliyor...')
                    : t('approvalUserRole.form.save', 'Kaydet')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
