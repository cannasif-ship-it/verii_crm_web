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
import { Package } from 'lucide-react';

interface ApprovalFlowFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprovalFlowFormSchema) => void | Promise<void>;
  approvalFlow?: ApprovalFlowDto | null;
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
      <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white max-w-4xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 sm:rounded-2xl max-h-[90vh] h-auto flex flex-col gap-0 p-0 overflow-hidden transition-colors duration-300">
        
        <DialogHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5 bg-white/80 dark:bg-[#130822]/90 backdrop-blur-md shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
               <Package size={20} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {approvalFlow
                    ? t('approvalFlow.form.editTitle', 'Onay Akışı Düzenle')
                    : t('approvalFlow.form.addTitle', 'Yeni Onay Akışı Ekle')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  {approvalFlow
                    ? t('approvalFlow.form.editDescription', 'Onay akışı bilgilerini düzenleyin')
                    : t('approvalFlow.form.addDescription', 'Yeni onay akışı bilgilerini girin')}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('approvalFlow.form.documentType', 'Belge Tipi')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                    >
                      <FormControl>
                        <SelectTrigger className={INPUT_STYLE}>
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
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={LABEL_STYLE}>
                      {t('approvalFlow.form.description', 'Açıklama')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder={t('approvalFlow.form.descriptionPlaceholder', 'Açıklama girin (opsiyonel)')}
                        maxLength={200}
                        rows={3}
                        className={`${INPUT_STYLE} h-auto min-h-[100px] py-2`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px] mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0516] p-4">
                    <div className="space-y-0.5">
                      <FormLabel className={LABEL_STYLE}>
                        {t('approvalFlow.form.isActive', 'Aktif')}
                      </FormLabel>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-10 px-4 rounded-lg border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                >
                  {t('common.cancel', 'İptal')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-10 px-6 rounded-lg bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-medium shadow-lg shadow-pink-500/20 border-0"
                >
                  {isLoading
                    ? t('common.saving', 'Kaydediliyor...')
                    : t('common.save', 'Kaydet')}
                </Button>
              </div>
            </form>
          </Form>

          {approvalFlow && approvalFlow.id && (
            <>
              <div className="my-6 border-t border-slate-100 dark:border-white/5" />
              <ApprovalFlowStepList approvalFlowId={approvalFlow.id} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
