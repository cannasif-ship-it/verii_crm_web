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
import { titleFormSchema, type TitleFormSchema } from '../types/title-types';
import type { TitleDto } from '../types/title-types';

interface TitleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TitleFormSchema) => void | Promise<void>;
  title?: TitleDto | null;
  isLoading?: boolean;
}

export function TitleForm({
  open,
  onOpenChange,
  onSubmit,
  title,
  isLoading = false,
}: TitleFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<TitleFormSchema>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      titleName: '',
      code: '',
    },
  });

  useEffect(() => {
    if (title) {
      form.reset({
        titleName: title.titleName,
        code: title.code || '',
      });
    } else {
      form.reset({
        titleName: '',
        code: '',
      });
    }
  }, [title, form]);

  const handleSubmit = async (data: TitleFormSchema): Promise<void> => {
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
            {title
              ? t('titleManagement.form.editTitle', 'Ünvan Düzenle')
              : t('titleManagement.form.addTitle', 'Yeni Ünvan Ekle')}
          </DialogTitle>
          <DialogDescription>
            {title
              ? t('titleManagement.form.editDescription', 'Ünvan bilgilerini düzenleyin')
              : t('titleManagement.form.addDescription', 'Yeni ünvan bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('titleManagement.form.titleName', 'Ünvan Adı')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('titleManagement.form.titleNamePlaceholder', 'Ünvan adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('titleManagement.form.code', 'Kod')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={t('titleManagement.form.codePlaceholder', 'Kod girin (opsiyonel)')}
                      maxLength={10}
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
