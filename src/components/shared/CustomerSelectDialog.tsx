import { type ReactElement, useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { useCustomerList } from '@/features/customer-management/hooks/useCustomerList';
import { cn } from '@/lib/utils';

export interface CustomerSelectionResult {
  customerId?: number;
  erpCustomerCode?: string;
}

interface CustomerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: CustomerSelectionResult) => void;
}

interface CustomerCardProps {
  type: 'erp' | 'crm';
  name: string;
  customerCode?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  onClick: () => void;
}

function CustomerCard({
  type,
  name,
  customerCode,
  phone,
  email,
  city,
  district,
  onClick,
}: CustomerCardProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] border-slate-200 dark:border-white/5',
        'bg-white/50 dark:bg-white/5 backdrop-blur-sm',
        'hover:border-pink-500/30 hover:bg-pink-50/30 dark:hover:bg-pink-500/5',
        'touch-manipulation'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
                  type === 'erp'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                )}
              >
                {type === 'erp'
                  ? t('customerSelectDialog.erp', 'ERP')
                  : t('customerSelectDialog.crm', 'CRM')}
              </span>
              {customerCode && (
                <span className="text-xs text-muted-foreground font-mono">
                  {customerCode}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base mb-2 truncate">{name}</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {phone && (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="truncate">{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="truncate">{email}</span>
                </div>
              )}
              {(city || district) && (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">
                    {[city, district].filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
              )}
            </div>
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

export function CustomerSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: CustomerSelectDialogProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('erp');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
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
        
        // Dil ayarını i18n'den al
        const langMap: Record<string, string> = {
          'tr': 'tr-TR',
          'en': 'en-US',
          'de': 'de-DE',
          'fr': 'fr-FR'
        };
        recognition.lang = langMap[i18n.language] || 'tr-TR';

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

  const { data: erpCustomers = [], isLoading: erpLoading } = useErpCustomers(null);
  const { data: crmCustomersData, isLoading: crmLoading } = useCustomerList({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'Id',
    sortDirection: 'asc',
  });

  const crmCustomers = crmCustomersData?.data || [];

  const filteredErpCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return erpCustomers;
    }
    const query = searchQuery.toLowerCase().trim();
    return erpCustomers.filter(
      (customer) =>
        (customer.cariIsim?.toLowerCase().includes(query) ||
          customer.cariKod?.toLowerCase().includes(query)) ??
        false
    );
  }, [erpCustomers, searchQuery]);

  const filteredCrmCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return crmCustomers;
    }
    const query = searchQuery.toLowerCase().trim();
    return crmCustomers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.customerCode?.toLowerCase().includes(query) ||
        false
    );
  }, [crmCustomers, searchQuery]);

  const allCustomers = useMemo(() => {
    const combined: Array<{
      type: 'erp' | 'crm';
      id?: number;
      erpCode?: string;
      name: string;
      customerCode?: string;
      phone?: string;
      email?: string;
      city?: string;
      district?: string;
    }> = [];

    filteredErpCustomers.forEach((erp) => {
      combined.push({
        type: 'erp',
        erpCode: erp.cariKod,
        name: erp.cariIsim || erp.cariKod,
        customerCode: erp.cariKod,
        phone: erp.cariTel,
        email: erp.email,
        city: erp.cariIl,
        district: erp.cariIlce,
      });
    });

    filteredCrmCustomers.forEach((crm) => {
      combined.push({
        type: 'crm',
        id: crm.id,
        name: crm.name,
        customerCode: crm.customerCode,
        phone: crm.phone,
        email: crm.email,
        city: crm.cityName,
        district: crm.districtName,
      });
    });

    return combined.sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  }, [filteredErpCustomers, filteredCrmCustomers, i18n.language]);

  const handleCustomerSelect = (customer: {
    type: 'erp' | 'crm';
    id?: number;
    erpCode?: string;
  }): void => {
    if (customer.type === 'erp' && customer.erpCode) {
      onSelect({
        customerId: undefined,
        erpCustomerCode: customer.erpCode,
      });
    } else if (customer.type === 'crm' && customer.id) {
      onSelect({
        customerId: customer.id,
        erpCustomerCode: undefined,
      });
    }
    onOpenChange(false);
  };

  const renderErpCustomers = (): ReactElement => {
    if (erpLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('customerSelectDialog.loading', 'Yükleniyor...')}
          </div>
        </div>
      );
    }

    if (filteredErpCustomers.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {searchQuery.trim()
              ? t('customerSelectDialog.noResults', 'Arama sonucu bulunamadı')
              : t('customerSelectDialog.noErpCustomers', 'ERP müşterisi bulunamadı')}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredErpCustomers.map((customer, index) => (
          <CustomerCard
            key={`erp-${customer.cariKod}-${customer.subeKodu}-${index}`}
            type="erp"
            name={customer.cariIsim || customer.cariKod}
            customerCode={customer.cariKod}
            phone={customer.cariTel}
            email={customer.email}
            city={customer.cariIl}
            district={customer.cariIlce}
            onClick={() => handleCustomerSelect({ type: 'erp', erpCode: customer.cariKod })}
          />
        ))}
      </div>
    );
  };

  const renderCrmCustomers = (): ReactElement => {
    if (crmLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('customerSelectDialog.loading', 'Yükleniyor...')}
          </div>
        </div>
      );
    }

    if (filteredCrmCustomers.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {searchQuery.trim()
              ? t('customerSelectDialog.noResults', 'Arama sonucu bulunamadı')
              : t('customerSelectDialog.noCrmCustomers', 'CRM müşterisi bulunamadı')}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCrmCustomers.map((customer) => (
          <CustomerCard
            key={`crm-${customer.id}`}
            type="crm"
            name={customer.name}
            customerCode={customer.customerCode}
            phone={customer.phone}
            email={customer.email}
            city={customer.cityName}
            district={customer.districtName}
            onClick={() => handleCustomerSelect({ type: 'crm', id: customer.id })}
          />
        ))}
      </div>
    );
  };

  const renderAllCustomers = (): ReactElement => {
    if (erpLoading || crmLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('customerSelectDialog.loading', 'Yükleniyor...')}
          </div>
        </div>
      );
    }

    if (allCustomers.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {t('customerSelectDialog.noCustomers', 'Müşteri bulunamadı')}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allCustomers.map((customer, index) => (
          <CustomerCard
            key={`${customer.type}-${customer.id || customer.erpCode}-${index}`}
            type={customer.type}
            name={customer.name}
            customerCode={customer.customerCode}
            phone={customer.phone}
            email={customer.email}
            city={customer.city}
            district={customer.district}
            onClick={() => handleCustomerSelect(customer)}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white/95 dark:bg-[#0c0516]/95 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-lg">
             <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
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
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
             </div>
            {t('customerSelectDialog.title', 'Müşteri Seç')}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t('customerSelectDialog.description', 'Müşteri seçmek için bir tab seçin ve listeden müşteriyi seçin')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex-shrink-0 bg-white/50 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5">
          <div className="relative flex gap-3">
            <div className="relative flex-1 group">
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input
                type="text"
                placeholder={t('customerSelectDialog.searchPlaceholder', 'İsim veya kod ile ara...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
              />
            </div>
            {recognitionRef.current && (
              <Button
                type="button"
                variant={isListening ? 'default' : 'outline'}
                size="icon"
                onClick={handleVoiceSearch}
                className={cn(
                  'shrink-0 h-11 w-11 rounded-xl transition-all',
                  isListening 
                    ? 'animate-pulse bg-red-500 hover:bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30' 
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                )}
                title={t('customerSelectDialog.voiceSearch', 'Sesli arama')}
              >
                {isListening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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
                    width="18"
                    height="18"
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

        <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="erp" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all">
                {t('customerSelectDialog.erpCustomers', 'ERP Müşterisi')}
              </TabsTrigger>
              <TabsTrigger value="crm" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all">
                {t('customerSelectDialog.crmCustomers', 'CRM Müşterileri')}
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all">
                {t('customerSelectDialog.allCustomers', 'Tümü')}
              </TabsTrigger>
            </TabsList>

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2"
            >
              <TabsContent value="erp" className="mt-0 space-y-3">
                {renderErpCustomers()}
              </TabsContent>

              <TabsContent value="crm" className="mt-0 space-y-3">
                {renderCrmCustomers()}
              </TabsContent>

              <TabsContent value="all" className="mt-0 space-y-3">
                {renderAllCustomers()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
