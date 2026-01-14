import { type ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useStockRelationCreate } from '../hooks/useStockRelationCreate';
import { useStockList } from '../hooks/useStockList';
import { stockRelationSchema, type StockRelationFormSchema } from '../types/schemas';

interface StockRelationFormProps {
  stockId: number;
}

export function StockRelationForm({ stockId }: StockRelationFormProps): ReactElement {
  const { t } = useTranslation();
  const createRelation = useStockRelationCreate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: stocksData } = useStockList({
    pageNumber: 1,
    pageSize: 100,
    sortBy: 'StockName',
    sortDirection: 'asc',
  });

  const stocks = stocksData?.data || [];

  const form = useForm<StockRelationFormSchema>({
    resolver: zodResolver(stockRelationSchema),
    defaultValues: {
      stockId,
      relatedStockId: 0,
      quantity: 1,
      description: '',
      isMandatory: false,
    },
  });

  const handleSubmit = async (data: StockRelationFormSchema): Promise<void> => {
    await createRelation.mutateAsync({
      stockId: data.stockId,
      relatedStockId: data.relatedStockId,
      quantity: data.quantity,
      description: data.description,
      isMandatory: data.isMandatory,
    });
    form.reset({
      stockId,
      relatedStockId: 0,
      quantity: 1,
      description: '',
      isMandatory: false,
    });
    setSearchTerm('');
  };

  const filteredStocks = stocks.filter((stock: any) =>
    stock.id !== stockId &&
    (stock.stockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     stock.erpStockCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="relatedStockId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('stock.relations.relatedStock', 'Bağlı Stok')} *
              </FormLabel>
              <Select
                value={field.value ? field.value.toString() : ''}
                onValueChange={(value) => {
                  field.onChange(parseInt(value, 10));
                  setSearchTerm('');
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('stock.relations.selectStock', 'Stok seçin')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder={t('stock.relations.search', 'Ara...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredStocks.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {t('common.noData', 'Veri yok')}
                    </div>
                  ) : (
                    filteredStocks.slice(0, 50).map((stock: any) => (
                      <SelectItem
                        key={stock.id}
                        value={stock.id.toString()}
                      >
                        {stock.stockName} ({stock.erpStockCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('stock.relations.quantity', 'Miktar')} *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                {t('stock.relations.description', 'Açıklama')}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder={t('stock.relations.descriptionPlaceholder', 'Açıklama giriniz (opsiyonel)')}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isMandatory"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {t('stock.relations.isMandatory', 'Zorunlu')}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createRelation.isPending}
          className="w-full"
        >
          {createRelation.isPending
            ? t('common.loading', 'Yükleniyor...')
            : t('stock.relations.add', 'Bağlı Stok Ekle')}
        </Button>
      </form>
    </Form>
  );
}
