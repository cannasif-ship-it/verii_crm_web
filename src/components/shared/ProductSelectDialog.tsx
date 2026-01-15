import { type ReactElement, useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useStockList } from '@/features/stock/hooks/useStockList';
import { useStockListWithImages } from '@/features/stock/hooks/useStockListWithImages';
import { getImageUrl } from '@/features/stock/utils/image-url';
import { stockApi } from '@/features/stock/api/stock-api';
import { RelatedStocksSelectionDialog } from './RelatedStocksSelectionDialog';
import { cn } from '@/lib/utils';
import type { StockGetDto, StockGetWithMainImageDto, StockRelationDto } from '@/features/stock/types';

export interface ProductSelectionResult {
  id?: number;
  code: string;
  name: string;
  vatRate?: number;
  groupCode?: string;
  relatedStockIds?: number[];
}

interface ProductSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: ProductSelectionResult) => void | Promise<void>;
  disableRelatedStocks?: boolean;
}

interface StockCardProps {
  stock: StockGetDto;
  onClick: () => void;
  onRelatedStockSelect?: (stock: StockGetDto) => void;
}

interface StockWithImageCardProps {
  stock: StockGetWithMainImageDto;
  onClick: () => void;
  onRelatedStockSelect?: (stock: StockGetDto) => void;
}

function StockCard({
  stock,
  onClick,
  onRelatedStockSelect,
}: StockCardProps): ReactElement {
  const { t } = useTranslation();
  const hasRelatedStocks = stock.parentRelations && stock.parentRelations.length > 0;

  const handleRelatedStockClick = async (e: React.MouseEvent, relatedStock: StockRelationDto): Promise<void> => {
    e.stopPropagation();
    if (onRelatedStockSelect) {
      try {
        const relatedStockData = await stockApi.getById(relatedStock.relatedStockId);
        if (relatedStockData) {
          onRelatedStockSelect(relatedStockData);
        }
      } catch (error) {
        console.error('Related stock bilgisi alınamadı:', error);
      }
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98]',
        'touch-manipulation'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {t('productSelectDialog.stock', 'STOK')}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stock.erpStockCode}
              </span>
            </div>
            <h3 className="font-semibold text-base mb-2 truncate">{stock.stockName}</h3>
            {(stock.grupKodu || stock.grupAdi) && (
              <div className="text-sm text-muted-foreground mb-1">
                {t('productSelectDialog.group', 'Grup')}: {stock.grupKodu && (
                  <span className="font-mono">{stock.grupKodu}</span>
                )}
                {stock.grupKodu && stock.grupAdi && ' - '}
                {stock.grupAdi && <span>{stock.grupAdi}</span>}
              </div>
            )}
            {stock.unit && (
              <div className="text-sm text-muted-foreground">
                {t('productSelectDialog.unit', 'Birim')}: {stock.unit}
              </div>
            )}
            {hasRelatedStocks && (
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {t('productSelectDialog.relatedStocks', 'Bağlı Stoklar')} ({stock.parentRelations?.length || 0})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {t('productSelectDialog.relatedStocks', 'Bağlı Stoklar')}
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {stock.parentRelations?.map((relation) => (
                          <div
                            key={relation.id}
                            className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                            onClick={(e) => handleRelatedStockClick(e, relation)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-sm truncate">
                                  {relation.relatedStockName || t('productSelectDialog.unknownStock', 'Bilinmeyen Stok')}
                                </div>
                                {relation.relatedStockCode && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    ({relation.relatedStockCode})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t('productSelectDialog.quantity', 'Miktar')}: {relation.quantity}
                                {relation.isMandatory && (
                                  <span className="ml-2 text-orange-600 dark:text-orange-400">
                                    ({t('productSelectDialog.mandatory', 'Zorunlu')})
                                  </span>
                                )}
                              </div>
                              {relation.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {relation.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className="shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockWithImageCard({
  stock,
  onClick,
  onRelatedStockSelect,
}: StockWithImageCardProps): ReactElement {
  const { t } = useTranslation();
  const imageUrl = stock.mainImage ? getImageUrl(stock.mainImage.filePath) : null;
  const hasRelatedStocks = stock.parentRelations && stock.parentRelations.length > 0;

  const handleRelatedStockClick = async (e: React.MouseEvent, relatedStock: StockRelationDto): Promise<void> => {
    e.stopPropagation();
    if (onRelatedStockSelect) {
      try {
        const relatedStockData = await stockApi.getById(relatedStock.relatedStockId);
        if (relatedStockData) {
          onRelatedStockSelect(relatedStockData);
        }
      } catch (error) {
        console.error('Related stock bilgisi alınamadı:', error);
      }
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98]',
        'touch-manipulation overflow-hidden'
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {imageUrl && (
          <div className="relative w-full h-48 bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={stock.mainImage?.altText || stock.stockName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {t('productSelectDialog.stock', 'STOK')}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {stock.erpStockCode}
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2 truncate">{stock.stockName}</h3>
              {(stock.grupKodu || stock.grupAdi) && (
                <div className="text-sm text-muted-foreground mb-1">
                  {t('productSelectDialog.group', 'Grup')}: {stock.grupKodu && (
                    <span className="font-mono">{stock.grupKodu}</span>
                  )}
                  {stock.grupKodu && stock.grupAdi && ' - '}
                  {stock.grupAdi && <span>{stock.grupAdi}</span>}
                </div>
              )}
              {stock.unit && (
                <div className="text-sm text-muted-foreground">
                  {t('productSelectDialog.unit', 'Birim')}: {stock.unit}
                </div>
              )}
              {hasRelatedStocks && (
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {t('productSelectDialog.relatedStocks', 'Bağlı Stoklar')} ({stock.parentRelations?.length || 0})
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          {t('productSelectDialog.relatedStocks', 'Bağlı Stoklar')}
                        </h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {stock.parentRelations?.map((relation) => (
                            <div
                              key={relation.id}
                              className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                              onClick={(e) => handleRelatedStockClick(e, relation)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-sm truncate">
                                    {relation.relatedStockName || t('productSelectDialog.unknownStock', 'Bilinmeyen Stok')}
                                  </div>
                                  {relation.relatedStockCode && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                      ({relation.relatedStockCode})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {t('productSelectDialog.quantity', 'Miktar')}: {relation.quantity}
                                  {relation.isMandatory && (
                                    <span className="ml-2 text-orange-600 dark:text-orange-400">
                                      ({t('productSelectDialog.mandatory', 'Zorunlu')})
                                    </span>
                                  )}
                                </div>
                                {relation.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {relation.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductSelectDialog({
  open,
  onOpenChange,
  onSelect,
  disableRelatedStocks = false,
}: ProductSelectDialogProps): ReactElement {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stocks');
  const [isListening, setIsListening] = useState(false);
  const [relatedStocksDialogOpen, setRelatedStocksDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockGetDto | StockGetWithMainImageDto | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'tr-TR';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleVoiceSearch = (): void => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [open]);

  const stockFilters = useMemo(() => {
    if (!searchQuery.trim()) {
      return {};
    }
    return {
      filters: [
        {
          column: 'stockName',
          operator: 'contains',
          value: searchQuery.trim(),
        },
        {
          column: 'erpStockCode',
          operator: 'contains',
          value: searchQuery.trim(),
        },
      ],
    };
  }, [searchQuery]);

  const { data: stocksData, isLoading: stocksLoading } = useStockList({
    pageNumber: 1,
    pageSize: 100,
    ...stockFilters,
  });

  const { data: stocksWithImagesData, isLoading: stocksWithImagesLoading } = useStockListWithImages({
    pageNumber: 1,
    pageSize: 100,
    ...stockFilters,
  });

  const stocks = stocksData?.data || [];
  const stocksWithImages = stocksWithImagesData?.data || [];

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) {
      return stocks;
    }
    const query = searchQuery.toLowerCase().trim();
    return stocks.filter(
      (stock) =>
        stock.stockName?.toLowerCase().includes(query) ||
        stock.erpStockCode?.toLowerCase().includes(query)
    );
  }, [stocks, searchQuery]);

  const filteredStocksWithImages = useMemo(() => {
    if (!searchQuery.trim()) {
      return stocksWithImages;
    }
    const query = searchQuery.toLowerCase().trim();
    return stocksWithImages.filter(
      (stock) =>
        stock.stockName?.toLowerCase().includes(query) ||
        stock.erpStockCode?.toLowerCase().includes(query)
    );
  }, [stocksWithImages, searchQuery]);

  const handleStockSelect = async (stock: StockGetDto | StockGetWithMainImageDto): Promise<void> => {
    const hasRelatedStocks = stock.parentRelations && stock.parentRelations.length > 0;
    
    if (hasRelatedStocks && !disableRelatedStocks) {
      setSelectedStock(stock);
      onOpenChange(false);
      setRelatedStocksDialogOpen(true);
    } else {
      try {
        await onSelect({
          id: stock.id,
          code: stock.erpStockCode,
          name: stock.stockName,
          groupCode: stock.grupKodu,
        });
        onOpenChange(false);
      } catch (error) {
        console.error('❌ [ProductSelectDialog] onSelect hatası:', error);
        throw error;
      }
    }
  };

  const handleRelatedStocksConfirm = async (selectedStockIds: number[]): Promise<void> => {
    if (!selectedStock) {
      return;
    }

    try {
      await onSelect({
        id: selectedStock.id,
        code: selectedStock.erpStockCode,
        name: selectedStock.stockName,
        groupCode: selectedStock.grupKodu,
        relatedStockIds: selectedStockIds,
      });
      setRelatedStocksDialogOpen(false);
      setSelectedStock(null);
    } catch (error) {
      console.error('❌ [ProductSelectDialog] onSelect hatası:', error);
      setRelatedStocksDialogOpen(false);
      setSelectedStock(null);
      throw error;
    }
  };

  const handleRelatedStocksDialogClose = (open: boolean): void => {
    setRelatedStocksDialogOpen(open);
    if (!open) {
      setSelectedStock(null);
    }
  };

  const renderStocks = (): ReactElement => {
    if (stocksLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('common.loading', 'Yükleniyor...')}
          </div>
        </div>
      );
    }

    if (filteredStocks.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {searchQuery.trim()
              ? t('productSelectDialog.noResults', 'Arama sonucu bulunamadı')
              : t('productSelectDialog.noProducts', 'Stok bulunamadı')}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.id}
            stock={stock}
            onClick={() => handleStockSelect(stock)}
            onRelatedStockSelect={handleStockSelect}
          />
        ))}
      </div>
    );
  };

  const renderStocksWithImages = (): ReactElement => {
    if (stocksWithImagesLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('common.loading', 'Yükleniyor...')}
          </div>
        </div>
      );
    }

    if (filteredStocksWithImages.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {searchQuery.trim()
              ? t('productSelectDialog.noResults', 'Arama sonucu bulunamadı')
              : t('productSelectDialog.noProducts', 'Görselli stok bulunamadı')}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStocksWithImages.map((stock) => (
          <StockWithImageCard
            key={stock.id}
            stock={stock}
            onClick={() => handleStockSelect(stock)}
            onRelatedStockSelect={handleStockSelect}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {t('productSelectDialog.title', 'Stok Seç')}
          </DialogTitle>
          <DialogDescription>
            {t('productSelectDialog.description', 'Teklif satırına eklenecek stoku seçin')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 flex-shrink-0">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input
                type="text"
                placeholder={t('productSelectDialog.searchPlaceholder', 'Stok kodu veya adı ile ara...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {recognitionRef.current && (
              <Button
                type="button"
                variant={isListening ? 'default' : 'outline'}
                size="icon"
                onClick={handleVoiceSearch}
                className={cn(
                  'shrink-0',
                  isListening && 'animate-pulse bg-red-500 hover:bg-red-600'
                )}
                title={t('productSelectDialog.voiceSearch', 'Sesli arama')}
              >
                {isListening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="23" />
                    <line x1="8" x2="16" y1="23" y2="23" />
                  </svg>
                )}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 px-6">
          <TabsList className="grid w-fit grid-cols-2 bg-muted mb-4">
            <TabsTrigger value="stocks">
              {t('productSelectDialog.stocks', 'Stoklar')}
            </TabsTrigger>
            <TabsTrigger value="stocksWithImages">
              {t('productSelectDialog.stocksWithImages', 'Görselli Stoklar')}
            </TabsTrigger>
          </TabsList>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-6"
          >
            <TabsContent value="stocks" className="mt-0">
              {renderStocks()}
            </TabsContent>
            <TabsContent value="stocksWithImages" className="mt-0">
              {renderStocksWithImages()}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      {selectedStock && selectedStock.parentRelations && (
        <RelatedStocksSelectionDialog
          open={relatedStocksDialogOpen}
          onOpenChange={handleRelatedStocksDialogClose}
          relatedStocks={selectedStock.parentRelations}
          onConfirm={handleRelatedStocksConfirm}
        />
      )}
    </Dialog>
  );
}
