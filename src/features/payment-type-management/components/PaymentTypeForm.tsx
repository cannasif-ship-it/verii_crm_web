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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { paymentTypeFormSchema, type PaymentTypeFormSchema } from '../types/payment-type-types';
import type { PaymentTypeDto } from '../types/payment-type-types';

interface PaymentTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentTypeFormSchema) => void | Promise<void>;
  paymentType?: PaymentTypeDto | null;
  isLoading?: boolean;
}

export function PaymentTypeForm({
  open,
  onOpenChange,
  onSubmit,
  paymentType,
  isLoading = false,
}: PaymentTypeFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<PaymentTypeFormSchema>({
    resolver: zodResolver(paymentTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (paymentType) {
      form.reset({
        name: paymentType.name,
        description: paymentType.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [paymentType, form]);

  const handleSubmit = async (data: PaymentTypeFormSchema): Promise<void> => {
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
            {paymentType
              ? t('paymentTypeManagement.edit', 'Ödeme Tipi Düzenle')
              : t('paymentTypeManagement.create', 'Yeni Ödeme Tipi')}
          </DialogTitle>
          <DialogDescription>
            {paymentType
              ? t('paymentTypeManagement.editDescription', 'Ödeme tipi bilgilerini düzenleyin')
              : t('paymentTypeManagement.createDescription', 'Yeni ödeme tipi bilgilerini girin')}
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
                    {t('paymentTypeManagement.name', 'Ad')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('paymentTypeManagement.namePlaceholder', 'Ödeme tipi adını girin')}
                      maxLength={100}
                    />
                  </FormControl>
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
                    {t('paymentTypeManagement.description', 'Açıklama')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('paymentTypeManagement.descriptionPlaceholder', 'Açıklama girin (opsiyonel)')}
                      maxLength={500}
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
