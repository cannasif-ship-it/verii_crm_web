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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { approvalFlowFormSchema, type ApprovalFlowFormSchema } from '../types/approval-flow-types';
import type { ApprovalFlowDto } from '../types/approval-flow-types';
import { DocumentTypeEnum } from '../types/approval-flow-types';
import { ApprovalFlowStepList } from './ApprovalFlowStepList';

interface ApprovalFlowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalFlowFormSchema) => void | Promise<void>;
  approvalFlow?: ApprovalFlowDto | null;
  isLoading?: boolean;
}

export function ApprovalFlowForm({
  open,
  onOpenChange,
  onSubmit,
  approvalFlow,
  isLoading = false,
}: ApprovalFlowFormProps): ReactElement {
  const { t } = useTranslation();

  const form = useForm<ApprovalFlowFormSchema>({
    resolver: zodResolver(approvalFlowFormSchema),
    defaultValues: {
      documentType: 0,
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (approvalFlow) {
      form.reset({
        documentType: approvalFlow.documentType,
        description: approvalFlow.description || '',
        isActive: approvalFlow.isActive,
      });
    } else {
      form.reset({
        documentType: 0,
        description: '',
        isActive: true,
      });
    }
  }, [approvalFlow, form]);

  const handleSubmit = async (data: ApprovalFlowFormSchema): Promise<void> => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  const getDocumentTypeLabel = (type: DocumentTypeEnum): string => {
    switch (type) {
      case DocumentTypeEnum.Offer:
        return t('approvalFlow.documentType.offer', 'Teklif');
      case DocumentTypeEnum.Request:
        return t('approvalFlow.documentType.request', 'Talep');
      case DocumentTypeEnum.Order:
        return t('approvalFlow.documentType.order', 'Sipariş');
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={approvalFlow ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : ''}>
        <DialogHeader>
          <DialogTitle>
            {approvalFlow
              ? t('approvalFlow.form.editTitle', 'Onay Akışı Düzenle')
              : t('approvalFlow.form.addTitle', 'Yeni Onay Akışı Ekle')}
          </DialogTitle>
          <DialogDescription>
            {approvalFlow
              ? t('approvalFlow.form.editDescription', 'Onay akışı bilgilerini düzenleyin')
              : t('approvalFlow.form.addDescription', 'Yeni onay akışı bilgilerini girin')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('approvalFlow.form.documentType', 'Belge Tipi')} *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('approvalFlow.form.selectDocumentType', 'Belge tipi seçin')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">
                        {t('approvalFlow.form.noDocumentTypeSelected', 'Belge tipi seçilmedi')}
                      </SelectItem>
                      {[
                        DocumentTypeEnum.Offer,
                        DocumentTypeEnum.Request,
                        DocumentTypeEnum.Order,
                      ].map((type) => (
                        <SelectItem key={type} value={type.toString()}>
                          {getDocumentTypeLabel(type)}
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
                    {t('approvalFlow.form.description', 'Açıklama')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder={t('approvalFlow.form.descriptionPlaceholder', 'Açıklama girin (opsiyonel)')}
                      maxLength={200}
                      rows={3}
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
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      {t('approvalFlow.form.isActive', 'Aktif')}
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {t('approvalFlow.form.isActiveDescription', 'Onay akışının aktif durumu')}
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

        {approvalFlow && approvalFlow.id && (
          <>
            <Separator className="my-4" />
            <ApprovalFlowStepList approvalFlowId={approvalFlow.id} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
