import { type ReactElement, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { ErpCustomerTable, getColumnsConfig } from './ErpCustomerTable';
import { useErpCustomers } from '@/services/hooks/useErpCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, X, Filter, Trash2, ChevronDown, Menu, FileSpreadsheet, FileText, Presentation, Check, SlidersHorizontal, CheckSquare } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Building03Icon, 
  Tag01Icon, 
  UserCircleIcon, 
  MapsLocation01Icon, 
  Location01Icon, 
  Invoice01Icon 
} from 'hugeicons-react';
import { useQueryClient } from '@tanstack/react-query';
import type { CariDto } from '@/services/erp-types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PptxGenJS from 'pptxgenjs';


interface FilterState {
  cariKod: string;
  cariIsim: string;
  subeKodu: string;
  cariIl: string;
  cariIlce: string;
  vergiNumarasi: string;
}

export function ErpCustomerManagementPage(): ReactElement {
  const { t } = useTranslation('erp-customer-management');
  const { setPageTitle } = useUIStore();
  const { data: customers, isLoading } = useErpCustomers(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);

  const allColumns = getColumnsConfig(t);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(col => col.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };



  const initialFilters: FilterState = {
    cariKod: '',
    cariIsim: '',
    subeKodu: '',
    cariIl: '',
    cariIlce: '',
    vergiNumarasi: ''
  };

  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setPageTitle(t('menu'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);


  const filteredCustomers = useMemo<CariDto[]>(() => {
    if (!customers) return [];

    let result: CariDto[] = [...customers];


    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((c: CariDto) => 
        (c.cariIsim && c.cariIsim.toLowerCase().includes(lowerSearch)) ||
        (c.cariKod && c.cariKod.toLowerCase().includes(lowerSearch))
      );
    }


    if (appliedFilters.cariKod) {
      result = result.filter((c: CariDto) => c.cariKod?.toLowerCase().startsWith(appliedFilters.cariKod.toLowerCase()));
    }
    if (appliedFilters.cariIsim) {
      result = result.filter((c: CariDto) => c.cariIsim?.toLowerCase().includes(appliedFilters.cariIsim.toLowerCase()));
    }
    if (appliedFilters.subeKodu) {
      result = result.filter((c: CariDto) => c.subeKodu?.toString().includes(appliedFilters.subeKodu));
    }
    if (appliedFilters.cariIl) {
      result = result.filter((c: CariDto) => c.cariIl?.toLowerCase().includes(appliedFilters.cariIl.toLowerCase()));
    }
    if (appliedFilters.cariIlce) {
      result = result.filter((c: CariDto) => c.cariIlce?.toLowerCase().includes(appliedFilters.cariIlce.toLowerCase()));
    }
    if (appliedFilters.vergiNumarasi) {
      result = result.filter((c: CariDto) => c.vergiNumarasi?.includes(appliedFilters.vergiNumarasi));
    }

    return result;
  }, [customers, searchTerm, appliedFilters]);

  const clearSearch = () => setSearchTerm('');

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyAdvancedFilters = () => setAppliedFilters(draftFilters);

  const clearAdvancedFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['erpCustomers'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredCustomers.map(customer => {
        const row: Record<string, string | number | boolean | null | undefined> = {};
        visibleColumns.forEach(key => {
            const col = allColumns.find(c => c.key === key);
            if (col) {
                // @ts-ignore - Accessing dynamic property
                const value = customer[key];
                row[col.label] = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
                  ? value
                  : value ?? '';
            }
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "erp_customers.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = allColumns
        .filter(col => visibleColumns.includes(col.key))
        .map(col => col.label);

    const tableRows = filteredCustomers.map(customer => {
        return allColumns
            .filter(col => visibleColumns.includes(col.key))
            // @ts-ignore - Accessing dynamic property
            .map(col => customer[col.key] || '');
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
    });

    doc.save("erp_customers.pdf");
  };

  type PptxTableRow = Array<{ text: string }>;

  const handleExportPowerPoint = () => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    
    // Add Title
    slide.addText("ERP Customer Report", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true });

    // Prepare Table Data
    const headers = allColumns
        .filter(col => visibleColumns.includes(col.key))
        .map(col => col.label);

    const rows = filteredCustomers.map(customer => {
        return allColumns
            .filter(col => visibleColumns.includes(col.key))
            // @ts-ignore - Accessing dynamic property
            .map(col => String(customer[col.key] || ''));
    });

    const tableData: PptxTableRow[] = [
      headers.map(text => ({ text })),
      ...rows.map(row => row.map(text => ({ text }))),
    ];

    slide.addTable(tableData, { x: 0.5, y: 1.5, w: '90%' });

    pptx.writeFile({ fileName: "erp_customers.pptx" });
  };

// styles removed

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex-none flex flex-col gap-1 pt-1 px-0 sm:px-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          {t('menu')}
        </h1>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-0 overflow-hidden transition-all duration-300">
          
          <div className="flex-none p-4 border-b border-white/5 flex flex-col gap-4">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            
            {/* Left Side: Search + Refresh */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative group w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    <Input
                        placeholder={t('placeholders.quickSearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-white/50 dark:bg-card/50 border-slate-200 dark:border-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 dark:focus-visible:border-pink-500 rounded-xl transition-all w-full"
                    />
                    {searchTerm && (
                        <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                        <X size={14} className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div 
                    className="h-10 w-10 flex items-center justify-center bg-white/50 dark:bg-card/50 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/50 dark:hover:bg-pink-500/10 transition-all group shrink-0"
                    onClick={handleRefresh}
                >
                    <RefreshCw 
                        size={18} 
                        className={`text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
                    />
                </div>
            </div>
            
            {/* Right Side: Filter + Columns + Hamburger */}
            <div className="flex items-center gap-2 justify-end flex-1 w-full lg:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button 
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white"
                        >
                            <span className="font-medium text-sm">{pageSize}</span>
                            <ChevronDown size={16} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-20 bg-[#151025] border border-white/10 shadow-2xl rounded-xl overflow-hidden p-1">
                        {[10, 20, 50].map((size) => (
                            <DropdownMenuItem 
                                key={size} 
                                onClick={() => setPageSize(size)}
                                className={`flex items-center justify-center text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${pageSize === size ? 'bg-pink-500/10 text-pink-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {size}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Popover open={showFilters} onOpenChange={setShowFilters}>
                    <PopoverTrigger asChild>
                        <button 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${showFilters ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Filter size={16} />
                            <span className="font-medium text-sm">{t('actions.detailedFilter')}</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="w-96 p-0 bg-[#151025] border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#151025]">
                          <h3 className="text-sm font-semibold text-gray-200">{t('actions.detailedFilter')}</h3>
                          <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-3 overflow-y-auto custom-scrollbar max-h-[400px]">
                            <div className="grid grid-cols-2 gap-3">
                                
                                {/* Branch Code */}
                                <div className="col-span-2">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                            <Building03Icon size={14} />
                                        </div>
                                        <Input 
                                            placeholder={t('filterLabels.branchCode')} 
                                            value={draftFilters.subeKodu}
                                            onChange={(e) => handleFilterChange('subeKodu', e.target.value)}
                                            className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                        />
                                    </div>
                                </div>

                                {/* Customer Code */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                        <Tag01Icon size={14} />
                                    </div>
                                    <Input 
                                        placeholder={t('filterLabels.customerCode')} 
                                        value={draftFilters.cariKod}
                                        onChange={(e) => handleFilterChange('cariKod', e.target.value)}
                                        className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                    />
                                </div>

                                {/* Customer Name */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                        <UserCircleIcon size={14} />
                                    </div>
                                    <Input 
                                        placeholder={t('filterLabels.customerName')} 
                                        value={draftFilters.cariIsim}
                                        onChange={(e) => handleFilterChange('cariIsim', e.target.value)}
                                        className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                    />
                                </div>

                                {/* City */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                        <MapsLocation01Icon size={14} />
                                    </div>
                                    <Input 
                                        placeholder={t('filterLabels.city')} 
                                        value={draftFilters.cariIl}
                                        onChange={(e) => handleFilterChange('cariIl', e.target.value)}
                                        className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                    />
                                </div>

                                {/* District */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                        <Location01Icon size={14} />
                                    </div>
                                    <Input 
                                        placeholder={t('filterLabels.district')} 
                                        value={draftFilters.cariIlce}
                                        onChange={(e) => handleFilterChange('cariIlce', e.target.value)}
                                        className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                    />
                                </div>

                                {/* Tax Number - Col Span 2 */}
                                <div className="col-span-2">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                            <Invoice01Icon size={14} />
                                        </div>
                                        <Input 
                                            placeholder={t('filterLabels.taxNumber')} 
                                            value={draftFilters.vergiNumarasi}
                                            onChange={(e) => handleFilterChange('vergiNumarasi', e.target.value)}
                                            className="w-full bg-[#0b0818] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all h-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/5 bg-[#0b0818]/50 flex justify-between items-center gap-3">
                            <button 
                                onClick={clearAdvancedFilters}
                                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-400 transition-colors px-2 py-2"
                            >
                                <Trash2 size={14} />
                                <span>{t('actions.clear')}</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    applyAdvancedFilters();
                                    setShowFilters(false);
                                }}
                                className="flex-1 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-pink-900/20 transition-all active:scale-95"
                            >
                                SONUÇLARI LİSTELE
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover open={showColumns} onOpenChange={setShowColumns}>
                    <PopoverTrigger asChild>
                        <button 
                            onClick={() => setShowColumns(!showColumns)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${showColumns ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'}`}
                        >
                            <SlidersHorizontal size={16} />
                            <span className="font-medium text-sm">{t('table.editColumns')}</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="w-80 p-0 bg-[#151025] border border-white/10 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#151025]">
                            <h3 className="text-sm font-semibold text-gray-200">{t('table.visibleColumns')}</h3>
                            <button onClick={() => setShowColumns(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Checkbox List (Scrollable + Grid) */}
                        <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar bg-[#151025]">
                            <div className="grid grid-cols-2 gap-2">
                                {allColumns.map((col) => (
                                    <label 
                                        key={col.key} 
                                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border border-transparent ${visibleColumns.includes(col.key) ? 'bg-pink-500/10 border-pink-500/20' : 'hover:bg-white/5'}`}
                                        onClick={(e) => { e.stopPropagation(); toggleColumn(col.key); }}
                                    >
                                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${visibleColumns.includes(col.key) ? 'bg-pink-500 border-pink-500' : 'bg-transparent border-gray-600'}`}>
                                            {visibleColumns.includes(col.key) && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className={`text-xs font-medium ${visibleColumns.includes(col.key) ? 'text-white' : 'text-gray-400'} truncate`}>
                                            {col.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/5 bg-[#0b0818]/50 flex justify-between items-center gap-3">
                            <button 
                                onClick={() => setVisibleColumns(allColumns.map(c => c.key))}
                                className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-white transition-colors px-1"
                            >
                                <CheckSquare size={14} />
                                <span>{t('common.selectAll', 'Tümünü Seç')}</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowColumns(false)}
                                className="bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white text-xs font-bold py-2 px-6 rounded-lg shadow-lg shadow-pink-900/20 transition-all active:scale-95"
                            >
                                {t('common.ok', 'TAMAM')}
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 w-10 p-0 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-pink-50 dark:hover:bg-white/10 hover:border-pink-500/30 rounded-xl">
                            <Menu size={18} className="text-slate-500 dark:text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-[#151025] border border-white/10 shadow-2xl shadow-black/50 overflow-visible p-0 z-50">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {t('common.actions', 'İşlemler')}
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-1"></div>

                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {t('common.export', 'Dışa Aktar')}
                            </div>
                            <button onClick={handleExportExcel} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors text-left">
                                <FileSpreadsheet size={16} className="text-emerald-500" />
                                <span>{t('common.exportExcel', 'Excel İndir')}</span>
                            </button>
                            <button onClick={handleExportPDF} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors text-left">
                                <FileText size={16} className="text-red-400" />
                                <span>{t('common.exportPDF', 'PDF İndir')}</span>
                            </button>
                            <button onClick={handleExportPowerPoint} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 transition-colors text-left">
                                <Presentation size={16} className="text-orange-400" />
                                <span>{t('common.exportPPT', 'PowerPoint İndir')}</span>
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

{/* Old filters removed */}
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <ErpCustomerTable customers={filteredCustomers} isLoading={isLoading} visibleColumns={visibleColumns} pageSize={pageSize} />
          </div>
      </div>
    </div>
  );
}
