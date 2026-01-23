import { type ReactElement, useEffect, useState, useRef } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { userDetailFormSchema, type UserDetailFormSchema, Gender, GENDER_OPTIONS } from '../types/user-detail-types';
import { useUserDetailByUserId } from '../hooks/useUserDetailByUserId';
import { useCreateUserDetail } from '../hooks/useCreateUserDetail';
import { useUpdateUserDetail } from '../hooks/useUpdateUserDetail';
import { useUploadProfilePicture } from '../hooks/useUploadProfilePicture';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/image-url';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { changePasswordSchema, type ChangePasswordRequest } from '@/features/auth/types/auth';
import { ViewIcon, ViewOffIcon } from 'hugeicons-react';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({
  open,
  onOpenChange,
}: UserDetailDialogProps): ReactElement {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const userId = user?.id || 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: userDetail, isLoading: isLoadingDetail, refetch: refetchUserDetail } = useUserDetailByUserId(userId);
  const createUserDetail = useCreateUserDetail();
  const updateUserDetail = useUpdateUserDetail();
  const uploadProfilePicture = useUploadProfilePicture();
  const changePassword = useChangePassword();

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const changePasswordForm = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const form = useForm<UserDetailFormSchema>({
    resolver: zodResolver(userDetailFormSchema),
    defaultValues: {
      profilePictureUrl: '',
      height: undefined,
      weight: undefined,
      description: '',
      gender: undefined,
    },
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('currentPassword') || url.searchParams.has('newPassword')) {
      url.searchParams.delete('currentPassword');
      url.searchParams.delete('newPassword');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    if (userDetail) {
      form.reset({
        profilePictureUrl: userDetail.profilePictureUrl || '',
        height: userDetail.height || undefined,
        weight: userDetail.weight || undefined,
        description: userDetail.description || '',
        gender: userDetail.gender || undefined,
      });
      if (userDetail.profilePictureUrl) {
        const imageUrl = getImageUrl(userDetail.profilePictureUrl);
        setPreviewUrl(imageUrl);
      } else {
        setPreviewUrl(null);
      }
    } else {
      form.reset({
        profilePictureUrl: '',
        height: undefined,
        weight: undefined,
        description: '',
        gender: undefined,
      });
      setPreviewUrl(null);
    }
  }, [userDetail, form]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('userDetailManagement.fileSizeError', 'Dosya boyutu 5MB\'dan büyük olamaz'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('userDetailManagement.fileTypeError', 'Sadece resim dosyaları yüklenebilir'));
      return;
    }

    const tempPreviewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        resolve(result);
      };
      reader.readAsDataURL(file);
    });

    try {
      const result = await uploadProfilePicture.mutateAsync({ userId, file });
      const refetchedData = await refetchUserDetail();
      if (result?.profilePictureUrl) {
        setPreviewUrl(getImageUrl(result.profilePictureUrl));
        form.setValue('profilePictureUrl', result.profilePictureUrl);
      } else if (refetchedData.data?.profilePictureUrl) {
        setPreviewUrl(getImageUrl(refetchedData.data.profilePictureUrl));
        form.setValue('profilePictureUrl', refetchedData.data.profilePictureUrl);
      } else if (tempPreviewUrl) {
        setPreviewUrl(tempPreviewUrl);
      }
    } catch (error) {
      console.error('File upload error:', error);
      if (tempPreviewUrl) {
        setPreviewUrl(tempPreviewUrl);
      }
    }
  };

  const handleSubmit = async (data: UserDetailFormSchema): Promise<void> => {
    if (userDetail) {
      await updateUserDetail.mutateAsync({
        id: userDetail.id,
        data: {
          profilePictureUrl: data.profilePictureUrl || undefined,
          height: data.height || undefined,
          weight: data.weight || undefined,
          description: data.description || undefined,
          gender: data.gender || undefined,
        },
      });
    } else {
      await createUserDetail.mutateAsync({
        userId,
        profilePictureUrl: data.profilePictureUrl || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        description: data.description || undefined,
        gender: data.gender || undefined,
      });
    }
    onOpenChange(false);
  };

  const handleChangePasswordSubmit = async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await changePassword.mutateAsync(data);
      changePasswordForm.reset();
      const url = new URL(window.location.href);
      if (url.searchParams.has('currentPassword') || url.searchParams.has('newPassword')) {
        url.searchParams.delete('currentPassword');
        url.searchParams.delete('newPassword');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  if (isLoadingDetail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('common.loading', 'Yükleniyor...')}
            </DialogTitle>
            <DialogDescription>
              {t('common.loadingDescription', 'Veriler yükleniyor, lütfen bekleyin')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              {t('common.loading', 'Yükleniyor...')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('userDetailManagement.title', 'Kullanıcı Detayları')}
          </DialogTitle>
          <DialogDescription>
            {t('userDetailManagement.description', 'Profil bilgilerinizi düzenleyin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={t('userDetailManagement.profilePicture', 'Profil Resmi')}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    onError={() => {
                      console.error('Image load error:', previewUrl);
                      setPreviewUrl(null);
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary">
                    <span className="text-4xl font-medium text-primary">
                      {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProfilePicture.isPending}
              >
                {uploadProfilePicture.isPending
                  ? t('userDetailManagement.uploading', 'Yükleniyor...')
                  : t('userDetailManagement.changeProfilePicture', 'Profil Resmini Değiştir')}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userDetailManagement.height', 'Boy (cm)')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="300"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                        placeholder={t('userDetailManagement.enterHeight', 'Boy Girin (cm)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('userDetailManagement.weight', 'Kilo (kg)')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="500"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                        placeholder={t('userDetailManagement.enterWeight', 'Kilo Girin (kg)')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDetailManagement.gender', 'Cinsiyet')}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value) as Gender : undefined)}
                    value={field.value !== undefined && field.value !== null ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('userDetailManagement.selectGender', 'Cinsiyet Seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {t('userDetailManagement.noGenderSelected', 'Belirtilmemiş')}
                      </SelectItem>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {t(`userDetailManagement.gender${option.label}`, option.label)}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('userDetailManagement.description', 'Açıklama')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder={t('userDetailManagement.enterDescription', 'Açıklama Girin')}
                      rows={4}
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
                disabled={createUserDetail.isPending || updateUserDetail.isPending}
              >
                {t('common.cancel', 'İptal')}
              </Button>
              <Button type="submit" disabled={createUserDetail.isPending || updateUserDetail.isPending}>
                {createUserDetail.isPending || updateUserDetail.isPending
                  ? t('common.saving', 'Kaydediliyor...')
                  : t('common.save', 'Kaydet')}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="change-password">
            <AccordionTrigger>
              {t('userDetailManagement.changePassword', 'Şifre Değiştir')}
            </AccordionTrigger>
            <AccordionContent>
              <Form {...changePasswordForm}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    changePasswordForm.handleSubmit(handleChangePasswordSubmit)(e);
                  }} 
                  className="space-y-4"
                >
                  <FormField
                    control={changePasswordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('userDetailManagement.currentPassword', 'Mevcut Şifre')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={isCurrentPasswordVisible ? 'text' : 'password'}
                              placeholder={t('userDetailManagement.enterCurrentPassword', 'Mevcut şifrenizi girin')}
                            />
                            <button
                              type="button"
                              onClick={() => setIsCurrentPasswordVisible((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {isCurrentPasswordVisible ? (
                                <ViewOffIcon size={18} />
                              ) : (
                                <ViewIcon size={18} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={changePasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('userDetailManagement.newPassword', 'Yeni Şifre')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={isNewPasswordVisible ? 'text' : 'password'}
                              placeholder={t('userDetailManagement.enterNewPassword', 'Yeni şifrenizi girin (min 6 karakter)')}
                              maxLength={100}
                            />
                            <button
                              type="button"
                              onClick={() => setIsNewPasswordVisible((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {isNewPasswordVisible ? (
                                <ViewOffIcon size={18} />
                              ) : (
                                <ViewIcon size={18} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={changePassword.isPending}
                    className="w-full"
                  >
                    {changePassword.isPending
                      ? t('userDetailManagement.changingPassword', 'Değiştiriliyor...')
                      : t('userDetailManagement.changePasswordButton', 'Şifreyi Değiştir')}
                  </Button>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
