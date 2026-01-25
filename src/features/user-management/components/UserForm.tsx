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
  userFormSchema,
  userUpdateFormSchema,
  type UserFormSchema,
  type UserUpdateFormSchema,
} from '../types/user-types';
import type { UserDto } from '../types/user-types';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormSchema | UserUpdateFormSchema) => void | Promise<void>;
  user?: UserDto | null;
  isLoading?: boolean;
}

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
}: UserFormProps): ReactElement {
  const { t } = useTranslation();

  const isEditMode = !!user;
  const form = useForm<UserFormSchema | UserUpdateFormSchema>({
    resolver: zodResolver(isEditMode ? userUpdateFormSchema : userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || '',
        isActive: user.isActive,
      });
    } else {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '',
        isActive: true,
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: UserFormSchema | UserUpdateFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user
              ? t('userManagement.form.editUser', 'Kullanıcı Düzenle')
              : t('userManagement.form.addUser', 'Yeni Kullanıcı Ekle')}
          </DialogTitle>
          <DialogDescription>
            {user
              ? t('userManagement.form.editDescription', 'Kullanıcı bilgilerini düzenleyin')
              : t('userManagement.form.addDescription', 'Yeni kullanıcı bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.username', 'Kullanıcı Adı')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('userManagement.form.usernamePlaceholder', 'Kullanıcı adını girin')}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.email', 'E-posta')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('userManagement.form.emailPlaceholder', 'E-posta adresini girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditMode && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.password', 'Şifre')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('userManagement.form.passwordPlaceholder', 'Şifre girin (min 8 karakter)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.firstName', 'Ad')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('userManagement.form.firstNamePlaceholder', 'Adı girin')}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.lastName', 'Soyad')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('userManagement.form.lastNamePlaceholder', 'Soyadı girin')}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.phoneNumber', 'Telefon')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('userManagement.form.phoneNumberPlaceholder', 'Telefon numarasını girin')}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.role', 'Rol')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('userManagement.form.rolePlaceholder', 'Rol girin')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      {t('userManagement.form.isActive', 'Aktif')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('userManagement.form.isActiveDescription', 'Kullanıcının aktif durumu')}
                    </div>
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
                {t('userManagement.form.cancel', 'İptal')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('userManagement.form.saving', 'Kaydediliyor...')
                  : t('userManagement.form.save', 'Kaydet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
