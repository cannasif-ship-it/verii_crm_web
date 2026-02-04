import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  smtpSettingsFormSchema,
  type SmtpSettingsFormSchema,
  type SmtpSettingsDto,
} from '../types/smtpSettings';

interface MailSettingsFormProps {
  data: SmtpSettingsDto | undefined;
  isLoading: boolean;
  onSubmit: (data: SmtpSettingsFormSchema) => void | Promise<void>;
  isSubmitting: boolean;
}

export function MailSettingsForm({
  data,
  isLoading,
  onSubmit,
  isSubmitting,
}: MailSettingsFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<SmtpSettingsFormSchema>({
    resolver: zodResolver(smtpSettingsFormSchema),
    defaultValues: {
      host: '',
      port: 587,
      enableSsl: true,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      timeout: 30,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        host: data.host,
        port: data.port,
        enableSsl: data.enableSsl,
        username: data.username,
        password: '',
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        timeout: data.timeout,
      });
    }
  }, [data, form]);

  const handleSubmit = (values: SmtpSettingsFormSchema): void => {
    onSubmit(values);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">{t('common.loading', 'Yükleniyor...')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('mailSettings.PageTitle', 'Mail Ayarları')}</CardTitle>
            <CardDescription>
              {t('mailSettings.PageDescription', 'SMTP sunucu ayarlarını yapılandırın')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.Host', 'Host')}</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="smtp.gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.Port', 'Port')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={65535}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableSsl"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('mailSettings.Fields.EnableSsl', 'SSL Kullan')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.Username', 'Kullanıcı Adı')}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.Password', 'Şifre')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('mailSettings.Fields.PasswordPlaceholder', 'Değiştirmek için yeni şifre girin')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.FromEmail', 'Gönderen E-posta')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.FromName', 'Gönderen Adı')}</FormLabel>
                  <FormControl>
                    <Input type="text" readOnly disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mailSettings.Fields.Timeout', 'Zaman Aşımı (sn)')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={300}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving', 'Kaydediliyor...') : t('mailSettings.Save', 'Kaydet')}
        </Button>
      </form>
    </Form>
  );
}
