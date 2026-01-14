import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useStockDetailQuery } from '../hooks/useStockDetailQuery';
import { useStockDetailCreate } from '../hooks/useStockDetailCreate';
import { useStockDetailUpdate } from '../hooks/useStockDetailUpdate';
import { stockDetailSchema, type StockDetailFormSchema } from '../types/schemas';

interface StockDetailFormProps {
  stockId: number;
}

export function StockDetailForm({ stockId }: StockDetailFormProps): ReactElement {
  const { t } = useTranslation();
  const { data: stockDetail, isLoading } = useStockDetailQuery(stockId);
  const createDetail = useStockDetailCreate();
  const updateDetail = useStockDetailUpdate();

  const form = useForm<StockDetailFormSchema>({
    resolver: zodResolver(stockDetailSchema),
    defaultValues: {
      stockId,
      htmlDescription: '',
    },
  });

  useEffect(() => {
    if (stockDetail) {
      form.reset({
        stockId,
        htmlDescription: stockDetail.htmlDescription || '',
      });
    } else {
      form.reset({
        stockId,
        htmlDescription: '',
      });
    }
  }, [stockDetail, stockId, form]);

  const handleSubmit = async (data: StockDetailFormSchema): Promise<void> => {
    if (stockDetail) {
      await updateDetail.mutateAsync({
        id: stockDetail.id,
        data: {
          stockId: data.stockId,
          htmlDescription: data.htmlDescription,
        },
      });
    } else {
      await createDetail.mutateAsync({
        stockId: data.stockId,
        htmlDescription: data.htmlDescription,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground">
        {t('common.loading', 'Yükleniyor...')}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="htmlDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('stock.detail.htmlDescription', 'HTML Açıklama')}
              </FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('stock.detail.htmlDescriptionPlaceholder', 'HTML açıklama giriniz')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createDetail.isPending || updateDetail.isPending}
          >
            {createDetail.isPending || updateDetail.isPending
              ? t('common.loading', 'Yükleniyor...')
              : t('stock.detail.save', 'Kaydet')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
