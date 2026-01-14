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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contactFormSchema, type ContactFormSchema } from '../types/contact-types';
import type { ContactDto } from '../types/contact-types';
import { useCustomerOptions } from '@/features/customer-management/hooks/useCustomerOptions';
import { useTitleOptions } from '@/features/title-management/hooks/useTitleOptions';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContactFormSchema) => void | Promise<void>;
  contact?: ContactDto | null;
  isLoading?: boolean;
}

export function ContactForm({
  open,
  onOpenChange,
  onSubmit,
  contact,
  isLoading = false,
}: ContactFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: customers, isLoading: customersLoading } = useCustomerOptions();
  const { data: titles, isLoading: titlesLoading } = useTitleOptions();

  const form = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
      customerId: 0,
      titleId: 0,
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        fullName: contact.fullName,
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        notes: contact.notes || '',
        customerId: contact.customerId,
        titleId: contact.titleId,
      });
    } else {
      form.reset({
        fullName: '',
        email: '',
        phone: '',
        mobile: '',
        notes: '',
        customerId: 0,
        titleId: 0,
      });
    }
  }, [contact, form]);

  const handleSubmit = async (data: ContactFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact
              ? t('contactManagement.form.editContact', 'İletişim Düzenle')
              : t('contactManagement.form.addContact', 'Yeni İletişim Ekle')}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? t('contactManagement.form.editDescription', 'İletişim bilgilerini düzenleyin')
              : t('contactManagement.form.addDescription', 'Yeni iletişim bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('contactManagement.form.customer', 'Müşteri')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ''}
                      disabled={customersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('contactManagement.form.selectCustomer', 'Müşteri seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
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
                name="titleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('contactManagement.form.title', 'Ünvan')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ''}
                      disabled={titlesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('contactManagement.form.selectTitle', 'Ünvan seçin')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {titles?.map((title) => (
                          <SelectItem key={title.id} value={title.id.toString()}>
                            {title.titleName}
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('contactManagement.form.fullName', 'Ad Soyad')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('contactManagement.form.fullNamePlaceholder', 'Ad soyad girin')}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('contactManagement.form.email', 'E-posta')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('contactManagement.form.emailPlaceholder', 'E-posta adresini girin (opsiyonel)')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('contactManagement.form.phone', 'Telefon')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('contactManagement.form.phonePlaceholder', 'Telefon numarasını girin (opsiyonel)')}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('contactManagement.form.mobile', 'Mobil')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('contactManagement.form.mobilePlaceholder', 'Mobil telefon numarasını girin (opsiyonel)')}
                      maxLength={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('contactManagement.form.notes', 'Notlar')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('contactManagement.form.notesPlaceholder', 'Notlar girin (opsiyonel)')}
                      maxLength={250}
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
