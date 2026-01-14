import { type ReactElement, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useStockDetail } from '../hooks/useStockDetail';
import { StockBasicInfo } from './StockBasicInfo';
import { StockDetailForm } from './StockDetailForm';
import { StockImageUpload } from './StockImageUpload';
import { StockImageList } from './StockImageList';
import { StockRelationForm } from './StockRelationForm';
import { StockRelationList } from './StockRelationList';

export function StockDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const stockId = id ? parseInt(id, 10) : 0;

  const { data: stock, isLoading } = useStockDetail(stockId);

  useEffect(() => {
    if (stock) {
      setPageTitle(t('stock.detail.title', 'Stok Detayı: {{name}}', { name: stock.stockName }));
    } else {
      setPageTitle(t('stock.detail.title', 'Stok Detayı'));
    }
    return () => {
      setPageTitle(null);
    };
  }, [stock, t, setPageTitle]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.loading', 'Yükleniyor...')}
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">
          {t('common.notFound', 'Stok bulunamadı')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/stocks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Geri')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t('stock.detail.title', 'Stok Detayı')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {stock.stockName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">
            {t('stock.detail.basicInfo', 'Temel Bilgiler')}
          </TabsTrigger>
          <TabsTrigger value="images">
            {t('stock.detail.images', 'Görseller')}
          </TabsTrigger>
          <TabsTrigger value="relations">
            {t('stock.detail.relations', 'Bağlı Stoklar')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('stock.detail.basicInfo', 'Temel Bilgiler')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StockBasicInfo stock={stock} />
              <div className="pt-4 border-t">
                <StockDetailForm stockId={stockId} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('stock.detail.images', 'Görseller')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StockImageUpload stockId={stockId} />
              <StockImageList stockId={stockId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('stock.detail.relations', 'Bağlı Stoklar')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StockRelationForm stockId={stockId} />
              <StockRelationList stockId={stockId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
