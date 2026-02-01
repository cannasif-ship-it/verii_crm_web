import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Package, Calculator, Trash2 } from 'lucide-react';

// Kendi oluşturduğumuz types dosyasından importlar
import { 
  productPricingFormSchema, 
  type ProductPricingFormSchema, 
  type ProductPricingGetDto,
  CURRENCIES,
  calculateFinalPrice, 
  calculateProfitMargin, 
  formatPrice 
} from '../types/product-pricing-types';

// Paylaşılan bileşenler (Eğer projenizde yoksa burayı yorum satırı yapın)
import { ProductSelectDialog } from '@/components/shared/ProductSelectDialog';

interface ProductPricingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductPricingFormSchema) => void | Promise<void>;
  onDelete?: (id: number) => void;
  productPricing?: ProductPricingGetDto | null;
  isLoading?: boolean;
}

export function ProductPricingForm({
  open, onOpenChange, onSubmit, onDelete, productPricing, isLoading
}: ProductPricingFormProps): ReactElement {
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const form = useForm<ProductPricingFormSchema>({
    resolver: zodResolver(productPricingFormSchema) as any,
    defaultValues: {
      erpProductCode: '', erpGroupCode: '', currency: 'TRY',
      listPrice: 0, costPrice: 0,
      discount1: 0, discount2: 0, discount3: 0
    }
  });

  // Düzenleme modunda verileri doldur
  useEffect(() => {
    if (productPricing) {
      form.reset({
        erpProductCode: productPricing.erpProductCode,
        erpGroupCode: productPricing.erpGroupCode || '',
        currency: productPricing.currency,
        listPrice: productPricing.listPrice,
        costPrice: productPricing.costPrice,
        discount1: productPricing.discount1 || 0,
        discount2: productPricing.discount2 || 0,
        discount3: productPricing.discount3 || 0,
      });
    } else {
      form.reset({ 
        erpProductCode: '', erpGroupCode: '', currency: 'TRY', 
        listPrice: 0, costPrice: 0, discount1: 0, discount2: 0, discount3: 0 
      });
    }
  }, [productPricing, form, open]);

  // Anlık Hesaplama
  const values = form.watch();
  const calculations = useMemo(() => {
    const final = calculateFinalPrice(values.listPrice, values.discount1, values.discount2, values.discount3);
    const profit = calculateProfitMargin(final, values.costPrice);
    return { final, profit };
  }, [values.listPrice, values.costPrice, values.discount1, values.discount2, values.discount3]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productPricing ? 'Fiyatlandırma Düzenle' : 'Yeni Fiyatlandırma'}</DialogTitle>
          <DialogDescription>Ürün fiyat ve maliyet bilgilerini giriniz.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SOL KOLON: Ürün Bilgileri */}
              <div className="space-y-4">
                <FormField control={form.control as any} name="erpProductCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Kodu *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} readOnly placeholder="Ürün seçiniz" />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={() => setProductDialogOpen(true)}>
                        <Package size={16} className="mr-2" /> Seç
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control as any} name="erpGroupCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grup Kodu</FormLabel>
                    <FormControl><Input {...field} readOnly className="bg-slate-50" /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control as any} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.value} - {c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* SAĞ KOLON: Fiyatlar */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control as any} name="listPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liste Fiyatı</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="costPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maliyet</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <FormField control={form.control as any} name="discount1" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">İsk. 1 (%)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="discount2" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">İsk. 2 (%)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="discount3" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">İsk. 3 (%)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                {/* HESAPLAMA ÖZETİ KARTI */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
                    <Calculator size={16} /> Hesaplama Özeti
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Son Fiyat:</span>
                    <span className="font-bold">{formatPrice(calculations.final, values.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kar Tutarı:</span>
                    <span className={calculations.profit.amount >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatPrice(calculations.profit.amount, values.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kar Marjı:</span>
                    <span className={calculations.profit.percentage >= 0 ? "text-green-600" : "text-red-600"}>
                      %{calculations.profit.percentage.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center w-full">
              <div>
                {productPricing && onDelete && (
                  <Button type="button" variant="destructive" onClick={() => onDelete(productPricing.id)}>
                    <Trash2 size={16} className="mr-2" /> Sil
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                <Button type="submit" disabled={isLoading}>Kaydet</Button>
              </div>
            </DialogFooter>

          </form>
        </Form>

        {/* Ürün Seçim Dialogu */}
        <ProductSelectDialog 
          open={productDialogOpen} 
          onOpenChange={setProductDialogOpen}
          onSelect={(product) => {
            form.setValue('erpProductCode', product.code);
            form.setValue('erpGroupCode', product.groupCode || '');
            setProductDialogOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
