import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Plus, Search, RefreshCw, X, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { ContactStats } from './ContactStats';
import { ContactTable } from './ContactTable';
import { ContactForm } from './ContactForm';
import { useCreateContact } from '../hooks/useCreateContact';
import { useUpdateContact } from '../hooks/useUpdateContact';
import { useContactList } from '../hooks/useContactList';
import type { ContactDto } from '../types/contact-types';
import type { ContactFormSchema } from '../types/contact-types';
import { 
  UserCircleIcon, 
  Mail01Icon, 
  SmartPhone01Icon, 
  Call02Icon, 
  Building03Icon, 
  Briefcase01Icon 
} from 'hugeicons-react';

interface ContactFilterState {
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  customerName: string;
  titleName: string;
}

export function ContactManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initialFilters: ContactFilterState = {
    fullName: '',
    email: '',
    phone: '',
    mobile: '',
    customerName: '',
    titleName: ''
  };

  const [draftFilters, setDraftFilters] = useState<ContactFilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ContactFilterState>(initialFilters);

  const queryClient = useQueryClient();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const { data: apiResponse, isLoading } = useContactList({ 
    pageNumber: 1, 
    pageSize: 10000 
  });

  const contacts = apiResponse?.data || (apiResponse as any)?.items || [];

  useEffect(() => {
    setPageTitle(t('contactManagement.menu', 'İletişim Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const filteredContacts = useMemo<ContactDto[]>(() => {
    if (!contacts) return [];

    let result: ContactDto[] = [...contacts];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((c) => 
        (c.fullName && c.fullName.toLowerCase().includes(lowerSearch)) ||
        (c.email && c.email.toLowerCase().includes(lowerSearch)) ||
        (c.phone && c.phone.includes(lowerSearch)) ||
        (c.customerName && c.customerName.toLowerCase().includes(lowerSearch))
      );
    }

    if (activeFilter === 'active') {
        result = result.filter(c => !c.isDeleted);
    } else if (activeFilter === 'inactive') {
        result = result.filter(c => c.isDeleted);
    }

    if (appliedFilters.fullName) {
      result = result.filter(c => c.fullName?.toLowerCase().includes(appliedFilters.fullName.toLowerCase()));
    }
    if (appliedFilters.email) {
      result = result.filter(c => c.email?.toLowerCase().includes(appliedFilters.email.toLowerCase()));
    }
    if (appliedFilters.phone) {
      result = result.filter(c => c.phone?.includes(appliedFilters.phone));
    }
    if (appliedFilters.mobile) {
      result = result.filter(c => c.mobile?.includes(appliedFilters.mobile));
    }
    if (appliedFilters.customerName) {
      result = result.filter(c => c.customerName?.toLowerCase().includes(appliedFilters.customerName.toLowerCase()));
    }
    if (appliedFilters.titleName) {
      result = result.filter(c => c.titleName?.toLowerCase().includes(appliedFilters.titleName.toLowerCase()));
    }

    return result;
  }, [contacts, searchTerm, activeFilter, appliedFilters]);

  const handleFilterChange = (key: keyof ContactFilterState, value: string) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyAdvancedFilters = () => {
    setAppliedFilters(draftFilters);
    setSearchTerm(''); 
  };

  const clearAdvancedFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const handleAddClick = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const clearSearch = () => setSearchTerm('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['contacts'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleEdit = (contact: ContactDto) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ContactFormSchema) => {
    const cleanData = {
      fullName: data.fullName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      mobile: data.mobile || undefined,
      notes: data.notes || undefined,
      customerId: data.customerId,
      titleId: data.titleId,
    };

    if (editingContact) {
      await updateContact.mutateAsync({
        id: editingContact.id,
        data: cleanData,
      });
    } else {
      await createContact.mutateAsync(cleanData);
    }
    setFormOpen(false);
    setEditingContact(null);
  };

  const inputStyle = "h-10 pl-10 w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-pink-500 dark:focus-visible:border-pink-500 transition-colors duration-200 text-sm";
  const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none";

  return (
    <div className="w-full space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            {t('contactManagement.menu', 'İletişim Yönetimi')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            {t('contactManagement.description', 'İletişimleri yönetin ve düzenleyin')}
          </p>
        </div>
        
        <Button 
          onClick={handleAddClick}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform border-0 hover:text-white"
        >
          <Plus size={18} className="mr-2" />
          {t('contactManagement.addButton', 'Yeni İletişim Ekle')}
        </Button>
      </div>

      <ContactStats />

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-5 flex flex-col gap-5 transition-all duration-300">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative group w-full sm:w-72 lg:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                  <Input
                    placeholder={t('common.search', 'Hızlı Ara...')}
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

                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 flex items-center justify-center bg-white/50 dark:bg-card/50 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-pink-500/30 hover:bg-pink-50/50 dark:hover:bg-pink-500/10 transition-all group shrink-0"
                    onClick={handleRefresh}
                  >
                    <RefreshCw 
                      size={18} 
                      className={`text-slate-500 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} 
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-10 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-white/10 ${showFilters ? 'border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-500/10' : 'bg-white/50 dark:bg-white/5'}`}
                  >
                    <Filter size={16} />
                    {t('common.filters', 'Detaylı Filtre')}
                  </Button>
                </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
               {['all', 'active', 'inactive'].map((filter) => (
                 <button
                   key={filter}
                   onClick={() => setActiveFilter(filter)}
                   className={`
                     flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                     ${activeFilter === filter 
                     ? 'bg-white dark:bg-[#1a1025] text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200 dark:border-white/10' 
                     : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                   `}
                 >
                   {filter === 'all' ? t('common.all', 'Tümü') : filter === 'active' ? t('status.active', 'Aktif') : t('status.inactive', 'Pasif')}
                 </button>
               ))}
            </div>
          </div>

          {showFilters && (
            <div className="bg-slate-50/80 dark:bg-[#130a1d]/50 rounded-xl border border-slate-200 dark:border-white/10 p-5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Ad Soyad</label>
                        <div className="relative">
                            <UserCircleIcon size={18} className={iconStyle} />
                            <Input 
                                placeholder="Ad Soyad..." 
                                value={draftFilters.fullName}
                                onChange={(e) => handleFilterChange('fullName', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">E-posta</label>
                        <div className="relative">
                            <Mail01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder="ornek@email.com" 
                                value={draftFilters.email}
                                onChange={(e) => handleFilterChange('email', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Telefon</label>
                        <div className="relative">
                            <Call02Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder="Telefon..." 
                                value={draftFilters.phone}
                                onChange={(e) => handleFilterChange('phone', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Mobil</label>
                        <div className="relative">
                            <SmartPhone01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder="Cep..." 
                                value={draftFilters.mobile}
                                onChange={(e) => handleFilterChange('mobile', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Müşteri</label>
                        <div className="relative">
                            <Building03Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder="Müşteri..." 
                                value={draftFilters.customerName}
                                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Ünvan</label>
                        <div className="relative">
                            <Briefcase01Icon size={18} className={iconStyle} />
                            <Input 
                                placeholder="Ünvan..." 
                                value={draftFilters.titleName}
                                onChange={(e) => handleFilterChange('titleName', e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={clearAdvancedFilters}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
                    >
                        <Trash2 size={14} className="mr-2" />
                        Temizle
                    </Button>
                    
                    <Button 
                        size="sm" 
                        onClick={applyAdvancedFilters}
                        className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white w-full sm:w-auto sm:min-w-[120px] shadow-md hover:shadow-lg transition-all border-0"
                    >
                        Filtrele
                    </Button>
                </div>
            </div>
          )}
      </div>

      <div className="bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 shadow-sm rounded-2xl p-0 sm:p-1 transition-all duration-300 overflow-hidden">
        <ContactTable
          contacts={filteredContacts}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </div>

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        contact={editingContact}
        isLoading={createContact.isPending || updateContact.isPending}
      />
    </div>
  );
}