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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  userFormSchema,
  userUpdateFormSchema,
  type UserFormSchema,
  type UserUpdateFormSchema,
} from '../types/user-types';
import type { UserDto } from '../types/user-types';
import { useUserAuthorityOptionsQuery } from '../hooks/useUserAuthorityOptionsQuery';
import type { RoleOption } from '../hooks/useUserAuthorityOptionsQuery';
import { useUserPermissionGroupsForForm } from '../hooks/useUserPermissionGroupsForForm';
import { UserFormPermissionGroupSelect } from './UserFormPermissionGroupSelect';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormSchema | UserUpdateFormSchema) => void | Promise<void>;
  user?: UserDto | null;
  isLoading?: boolean;
}

const EMPTY_NUMBER_ARRAY: number[] = [];
const EMPTY_ROLE_OPTIONS: RoleOption[] = [];

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
}: UserFormProps): ReactElement {
  const { t } = useTranslation('user-management');
  const isEditMode = !!user;
  const roleOptionsQuery = useUserAuthorityOptionsQuery();
  const roleOptions = roleOptionsQuery.data ?? EMPTY_ROLE_OPTIONS;
  const userPermissionGroupsQuery = useUserPermissionGroupsForForm(
    user?.id ?? null
  );
  const userGroupIds = userPermissionGroupsQuery.data ?? EMPTY_NUMBER_ARRAY;

  const form = useForm<UserFormSchema | UserUpdateFormSchema>({
    resolver: zodResolver(isEditMode ? userUpdateFormSchema : userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roleId: 0,
      isActive: true,
      permissionGroupIds: [],
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (user) {
      const matchedRole = roleOptions.find((r) => r.label === user.role);
      form.reset({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        roleId: user.roleId ?? matchedRole?.value ?? 0,
        isActive: user.isActive,
        permissionGroupIds: userGroupIds,
      });
      return;
    }

    form.reset({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roleId: 0,
      isActive: true,
      permissionGroupIds: [],
    });
  }, [
    open,
    user?.id,
    user?.username,
    user?.email,
    user?.firstName,
    user?.lastName,
    user?.phoneNumber,
    user?.isActive,
    user?.role,
    user?.roleId,
    roleOptions,
    userGroupIds,
    form,
  ]);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    if (userPermissionGroupsQuery.isLoading || userPermissionGroupsQuery.data == null) {
      return;
    }

    const current = form.getValues('permissionGroupIds') ?? [];
    const next = userPermissionGroupsQuery.data;
    const same =
      current.length === next.length &&
      current.every((value, index) => value === next[index]);

    if (!same) {
      form.setValue('permissionGroupIds', next, { shouldDirty: false, shouldTouch: false });
    }
  }, [open, user?.id, userPermissionGroupsQuery.isLoading, userPermissionGroupsQuery.data, form]);

  useEffect(() => {
    if (!open || !user || roleOptions.length === 0) {
      return;
    }

    const currentRole = form.getValues('roleId');
    if (currentRole && currentRole > 0) {
      return;
    }

    const matchedRole = roleOptions.find((r) => r.label === user.role);
    if (matchedRole) {
      form.setValue('roleId', matchedRole.value, { shouldDirty: false, shouldTouch: false });
    }
  }, [open, user?.id, user?.role, roleOptions, form]);

  const handleSubmit = async (data: UserFormSchema | UserUpdateFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        roleId: 0,
        isActive: true,
        permissionGroupIds: [],
      });
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
                        disabled={isEditMode}
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
                        placeholder={t('userManagement.form.passwordPlaceholder', 'Boş bırakılırsa geçici şifre oluşturulur')}
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
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userManagement.form.role', 'Rol')}
                      {!isEditMode && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(v ? parseInt(v, 10) : 0)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('userManagement.form.rolePlaceholder', 'Rol seçin')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
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
              name="permissionGroupIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userManagement.form.permissionGroups', 'İzin Grupları')}
                  </FormLabel>
                  <FormControl>
                    <UserFormPermissionGroupSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>
                    {t('userManagement.form.isActive', 'Aktif')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
