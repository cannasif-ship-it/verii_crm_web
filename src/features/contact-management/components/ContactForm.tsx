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
// İkonlar
import { 
  UserPlus, 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  Smartphone, 
  FileText 
} from 'lucide-react';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContactFormSchema) => void | Promise<void>;
  contact?: ContactDto | null;
  isLoading?: boolean;
}

// --- TASARIM SABİTLERİ (CustomerForm ile Birebir Aynı) ---
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

const LABEL_STYLE = "text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold ml-1 mb-1.5 block flex items-center gap-1.5";

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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-full flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        
        {/* HEADER: Sabit */}
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             {/* İkon: UserPlus */}
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <UserPlus size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {contact
                    ? t('contactManagement.form.editContact', 'İletişim Düzenle')
                    : t('contactManagement.form.addContact', 'Yeni İletişim Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {contact
                    ? t('contactManagement.form.editDescription', 'İletişim bilgilerini güncelleyin')
                    : t('contactManagement.form.addDescription', 'Yeni iletişim kişisi oluşturun')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        {/* BODY: Kaydırılabilir */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form id="contact-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              
              {/* Grup: Temel Bilgiler (Ad Soyad) */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      <User size={12} className="text-pink-500" />
                      {t('contactManagement.form.fullName', 'Ad Soyad')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={INPUT_STYLE}
                        placeholder={t('contactManagement.form.fullNamePlaceholder', 'Ad soyad girin')}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              {/* Grup: Bağlı Olduğu Yer ve Unvan */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        <Building2 size={12} className="text-pink-500" />
                        {t('contactManagement.form.customer', 'Müşteri')} *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() || ''}
                        disabled={customersLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('contactManagement.form.selectCustomer', 'Müşteri seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 py-2">
                              {customer.name}
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
                  name="titleId"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        <Briefcase size={12} className="text-pink-500" />
                        {t('contactManagement.form.title', 'Ünvan')} *
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() || ''}
                        disabled={titlesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_STYLE}>
                            <SelectValue placeholder={t('contactManagement.form.selectTitle', 'Ünvan seçin')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#1a1025] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white shadow-xl max-h-60">
                          {titles?.map((title) => (
                            <SelectItem key={title.id} value={title.id.toString()} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 py-2">
                              {title.titleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grup: İletişim Bilgileri (Email & Phone) */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        <Mail size={12} className="text-pink-500" />
                        {t('contactManagement.form.email', 'E-posta')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className={INPUT_STYLE}
                          placeholder={t('contactManagement.form.emailPlaceholder', 'E-posta adresini girin (opsiyonel)')}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        <Phone size={12} className="text-pink-500" />
                        {t('contactManagement.form.phone', 'Telefon')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('contactManagement.form.phonePlaceholder', 'Telefon numarasını girin (opsiyonel)')}
                          maxLength={20}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grup: Mobil (Tek Satır veya Yarım) */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className={LABEL_STYLE}>
                        <Smartphone size={12} className="text-pink-500" />
                        {t('contactManagement.form.mobile', 'Mobil')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={INPUT_STYLE}
                          placeholder={t('contactManagement.form.mobilePlaceholder', 'Mobil telefon numarasını girin (opsiyonel)')}
                          maxLength={20}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px] mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grup: Notlar */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      <FileText size={12} className="text-pink-500" />
                      {t('contactManagement.form.notes', 'Notlar')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className={`${INPUT_STYLE} h-auto min-h-[100px] py-3`}
                        placeholder={t('contactManagement.form.notesPlaceholder', 'Notlar girin (opsiyonel)')}
                        maxLength={250}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </div>

        {/* FOOTER: Sabit */}
        <DialogFooter className="border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          >
            {t('contactManagement.cancel', 'İptal')}
          </Button>
          <Button 
            type="submit" 
            form="contact-form" // Form ID'si ile ilişkilendirildi
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold border-0 hover:shadow-lg hover:shadow-pink-500/20 transition-all transform active:scale-95 px-8"
          >
            {isLoading
              ? t('contactManagement.saving', 'Kaydediliyor...')
              : t('contactManagement.save', 'Kaydet')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}