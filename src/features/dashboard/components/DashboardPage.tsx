import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import i18n from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  MoreHorizontal,
  CalendarDays,
  Activity
} from 'lucide-react';

// --- Reusable Glass Card ---
type CardWrapperProps = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
};

function CardWrapper({ children, className = '', noPadding = false, onClick }: CardWrapperProps): ReactElement {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl 
        border border-white/60 dark:border-white/5 
        rounded-2xl shadow-sm transition-all duration-300
        hover:shadow-md hover:border-pink-500/20 hover:-translate-y-0.5
        ${className}
        ${noPadding ? 'p-0' : 'p-6'}
      `}
    >
      {children}
    </div>
  );
}

export function DashboardPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboardQuery();
  const [greeting, setGreeting] = useState('');

  // --- Dinamik Selamlama ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.morning', 'Günaydın'));
    else if (hour < 18) setGreeting(t('dashboard.afternoon', 'İyi Günler'));
    else setGreeting(t('dashboard.evening', 'İyi Akşamlar'));
  }, [t]);

  useEffect(() => {
    setPageTitle(t('dashboard.title', 'Dashboard'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  // --- Güvenli Kullanıcı Adı Çözümleme ---
  const getUserDisplayName = () => {
    if (!user) return t('dashboard.user', 'Kullanıcı');
    return (user as any).fullName?.split(' ')[0] || (user as any).username || (user as any).name || t('dashboard.user', 'Kullanıcı');
  };

  // --- Formatlayıcılar ---
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-pink-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.loading', 'Yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const activities = data?.activities || [];

  // --- İstatistik Verileri ---
  const stats = [
    {
      l: t('dashboard.stats.totalRevenue', 'Toplam Ciro'),
      v: kpis ? formatCurrency(kpis.monthlyRevenue) : '-',
      c: kpis ? `${kpis.monthlyRevenueChange}%` : '-',
      p: (kpis?.monthlyRevenueChange ?? 0) >= 0 ? 1 : 0,
      i: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      l: t('dashboard.stats.activeOpportunities', 'Aktif Fırsatlar'),
      v: kpis ? String(kpis.activeAgreements) : '-',
      c: kpis ? `${kpis.activeAgreementsChange}%` : '-',
      p: (kpis?.activeAgreementsChange ?? 0) >= 0 ? 1 : 0,
      i: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
      l: t('dashboard.stats.newLeads', 'Yeni Müşteriler'),
      v: kpis && 'newLeads' in kpis ? String(kpis.newLeads) : '0', 
      c: '-', 
      p: 1,
      i: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-500/10'
    },
    {
      l: t('dashboard.stats.pendingOrders', 'Bekleyen Sipariş'),
      v: kpis && 'pendingOrders' in kpis ? String(kpis.pendingOrders) : '0',
      c: '-', 
      p: 0,
      i: ShoppingCart,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10'
    },
  ];

  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // API'den gelen aktiviteleri map'le
  const deals = activities.slice(0, 5).map((activity) => ({
      c: activity.title,
      a: activity.amount ? formatCurrency(activity.amount) : '',
      s: t(`dashboard.activityType.${activity.type}`),
      d: activity.timeAgo,
  }));

  return (
    <div className="w-full space-y-6 pb-10 bg-transparent">
      
      {/* 1. Header Area (Hoşgeldin Mesajı ve Butonlar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors flex items-center gap-2">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
              {getUserDisplayName()}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors flex items-center gap-2">
            <CalendarDays size={14} />
            {formatDate()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <Button 
                variant="outline"
                size="sm"
                className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
            >
                <FileText size={14} className="mr-2" />
                {t('dashboard.reportDownload', 'Rapor')}
            </Button>
            <Button 
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-orange-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
                <Zap size={14} className="mr-2" />
                {t('dashboard.quickAction', 'Hızlı İşlem')}
            </Button>
        </div>
      </div>

      {/* 2. Stats Grid (KPI Kartları) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <CardWrapper key={i} className="p-5 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                <s.i size={20} />
              </div>
              {s.c !== '-' && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.p ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                  {s.p ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                  {s.c}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.l}</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{s.v}</p>
            </div>
          </CardWrapper>
        ))}
      </div>

      {/* 3. Main Content Grid (Grafik ve Liste) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <CardWrapper className="lg:col-span-2 flex flex-col h-[400px] p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <TrendingUp size={18} className="text-pink-500" />
                        {t('dashboard.salesAnalysis', 'Satış Analizi')}
                    </h3>
                    <p className="text-xs text-slate-500 ml-6">{t('dashboard.targetVsActual', 'Hedef ve Gerçekleşen')}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal size={16} /></Button>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
                {monthKeys.map((key, i) => {
                    // API'den aylık veri gelmediği için 0 veya mevcut data
                    const height = 0; 
                    
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="w-full h-full flex items-end justify-center relative">
                                <div className="absolute bottom-0 w-full h-full bg-slate-100 dark:bg-white/5 rounded-t-sm mx-1" />
                                <div
                                    style={{ height: `${height}%` }} 
                                    className="w-full mx-1 bg-gradient-to-t from-pink-600 to-orange-400 opacity-90 rounded-t-sm relative z-10 transition-all duration-300 group-hover:opacity-100"
                                />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 uppercase">
                                {t(`dashboard.monthsShort.${key}`).substring(0, 3)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </CardWrapper>

        {/* Latest Activities */}
        <CardWrapper className="h-[400px] flex flex-col p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/30 dark:bg-white/5">
                <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-orange-500" />
                    {t('dashboard.latestActivities', 'Son Aktiviteler')}
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-pink-600 h-7 px-2 hover:bg-pink-50 dark:hover:bg-pink-500/10">
                    {t('dashboard.viewAll', 'Tümü')}
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {deals.length > 0 ? (
                    deals.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                                    i % 2 === 0
                                        ? 'bg-pink-50 border-pink-100 text-pink-600 dark:bg-pink-500/10 dark:border-pink-500/20 dark:text-pink-400'
                                        : 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400'
                                }`}>
                                    {d.c.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{d.c}</h4>
                                    <p className="text-[10px] text-slate-400 truncate">{d.s}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-white">{d.a}</p>
                                <span className="text-[9px] text-slate-400">{d.d}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <Package size={32} className="opacity-20" />
                        <p className="text-xs">{t('dashboard.noActivities', 'Henüz aktivite yok')}</p>
                    </div>
                )}
            </div>
        </CardWrapper>
      </div>

      {/* 4. Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            { 
              t: t('dashboard.quickStats.pendingTasks', 'Bekleyen Görevler'), 
              d: t('dashboard.quickStats.checkTasks', 'Görev listesini kontrol et'), 
              i: Clock, 
              c: 'text-orange-500', 
              bg: 'bg-orange-50 dark:bg-orange-500/10' 
            },
            { 
              t: t('dashboard.quickStats.openQuotations', 'Açık Teklifler'), 
              d: t('dashboard.quickStats.reviewQuotations', 'Teklifleri incele'), 
              i: FileText, 
              c: 'text-pink-500', 
              bg: 'bg-pink-50 dark:bg-pink-500/10' 
            },
            { 
              t: t('dashboard.quickStats.criticalStock', 'Kritik Stok'), 
              d: t('dashboard.quickStats.stockStatus', 'Stok durumunu gör'), 
              i: Package, 
              c: 'text-purple-500', 
              bg: 'bg-purple-50 dark:bg-purple-500/10' 
            },
        ].map((x, k) => (
            <CardWrapper key={k} className="p-4 flex items-center gap-4 cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/30">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${x.bg} ${x.c}`}>
                    <x.i size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{x.t}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{x.d}</p>
                </div>
            </CardWrapper>
        ))}
      </div>

    </div>
  );
}