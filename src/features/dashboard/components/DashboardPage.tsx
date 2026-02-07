import { type ReactElement, type ReactNode, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import i18n from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
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
  Activity,
  Download,
  RefreshCcw,
  BarChart3
} from 'lucide-react';

type CardWrapperProps = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  interactive?: boolean;
};

function CardWrapper({ children, className = '', noPadding = false, onClick, interactive = false }: CardWrapperProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-white/70 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-2xl shadow-sm",
        "transition-all duration-300 ease-out transform-gpu backface-hidden will-change-transform",
        interactive && [
            "cursor-pointer group",
            "hover:border-pink-500/50 dark:hover:border-pink-500/50",
            "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]",
            "active:scale-[0.99]",
        ],
        noPadding ? 'p-0' : 'p-6',
        className
      )}
    >
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

export function DashboardPage(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  
  const { data, isLoading, refetch } = useDashboardQuery(); 
  
  const [greeting, setGreeting] = useState('');
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const chartMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chartMenuRef.current && !chartMenuRef.current.contains(event.target as Node)) {
        setChartMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const getUserDisplayName = (): string => {
    if (!user) return t('dashboard.user', 'Kullanıcı');
    return user.name || user.email || t('dashboard.user', 'Kullanıcı');
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    const val = amount || 0;
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

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
  const activities = Array.isArray(data?.activities) ? data.activities : [];

  const stats = [
    {
      l: t('dashboard.stats.totalRevenue', 'Toplam Ciro'),
      v: formatCurrency(kpis?.monthlyRevenue),
      c: kpis?.monthlyRevenueChange ? `${kpis.monthlyRevenueChange}%` : '0%',
      p: (kpis?.monthlyRevenueChange ?? 0) >= 0 ? 1 : 0,
      i: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      l: t('dashboard.stats.activeOpportunities', 'Aktif Fırsatlar'),
      v: kpis?.activeAgreements ? String(kpis.activeAgreements) : '0',
      c: kpis?.activeAgreementsChange ? `${kpis.activeAgreementsChange}%` : '0%',
      p: (kpis?.activeAgreementsChange ?? 0) >= 0 ? 1 : 0,
      i: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
    },
    {
      l: t('dashboard.stats.newLeads', 'Yeni Müşteriler'),
      v: kpis && 'newLeads' in kpis ? String(kpis.newLeads) : '0', 
      c: '0%', 
      p: 1,
      i: Users,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-500/10',
    },
    {
      l: t('dashboard.stats.pendingOrders', 'Bekleyen Sipariş'),
      v: kpis && 'pendingOrders' in kpis ? String(kpis.pendingOrders) : '0',
      c: '0%', 
      p: 0,
      i: ShoppingCart,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
  ];

  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const deals = activities.slice(0, 5).map((activity) => {
    const title = typeof activity.title === 'string' ? activity.title : '';
    const subject = typeof activity.subject === 'string' ? activity.subject : '';
    const konu = typeof activity.konu === 'string' ? activity.konu : '';
    const description = typeof activity.description === 'string' ? activity.description : '';
    const type = typeof activity.type === 'string' ? activity.type : '';
    const timeAgo = typeof activity.timeAgo === 'string' ? activity.timeAgo : '';
    const createdAt = typeof activity.createdAt === 'string' ? activity.createdAt : '';
    const amount = typeof activity.amount === 'number' ? activity.amount : null;
    return {
      c: title || subject || konu || description || t('dashboard.unnamedActivity', 'İsimsiz Aktivite'),
      a: amount !== null ? formatCurrency(amount) : '',
      s: t(`dashboard.activityType.${type}`) || type || t('dashboard.activityType.general', 'Genel'),
      d: timeAgo || (createdAt ? new Date(createdAt).toLocaleDateString(i18n.language) : t('dashboard.noDate', 'Tarih yok')),
    };
  });

  const handleDownloadReport = () => {
  };

  const handleQuickAction = () => {
    navigate('/demands/create');
  };

  const hasChartData = false; 
  const chartData = Array(12).fill(0);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      
      {/* Header - Fixed */}
      <div className="flex-none flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors flex flex-col items-start sm:flex-row sm:items-center sm:gap-x-2">
            <span>{greeting},</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-orange-500">
              {getUserDisplayName()}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors flex items-center gap-2">
            <CalendarDays size={14} />
            {formatDate()}
          </p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Button 
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shrink-0 hover:bg-white dark:hover:bg-white/10 hover:border-pink-200 dark:hover:border-pink-500/30 transition-all duration-300"
            >
                <Download size={14} className="mr-2" />
                {t('dashboard.reportDownload', 'Rapor İndir')}
            </Button>
            <Button 
                size="sm"
                onClick={handleQuickAction}
                className="bg-linear-to-r from-pink-600 to-orange-600 text-white border-0 shadow-md hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all duration-300 shrink-0"
            >
                <Zap size={14} className="mr-2" />
                {t('dashboard.quickAction', 'Hızlı İşlem')}
            </Button>
        </div>
      </div>

      {/* KPI Cards - Fixed Height */}
      <div className="flex-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-[140px] shrink-0">
        {stats.map((s, i) => (
          <CardWrapper 
            key={i} 
            interactive={false} 
            className="flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color} shadow-sm`}>
                <s.i size={22} />
              </div>
              {s.c !== '0%' && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.p ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                  {s.p ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                  {s.c}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.l}</h3>
              <p 
                className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1 tracking-tight truncate" 
                title={s.v}
              >
                {s.v}
              </p>
            </div>
          </CardWrapper>
        ))}
      </div>

      {/* Middle Section - Flex 1 to Fill Remaining Space */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
        
        {/* Left: Sales Analysis (8 cols) */}
        <CardWrapper className="col-span-12 lg:col-span-8 flex flex-col h-full p-0 overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center z-30 relative shrink-0">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <TrendingUp size={18} className="text-pink-500" />
                        {t('dashboard.salesAnalysis', 'Satış Analizi')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{t('dashboard.targetVsActual', 'Hedef ve Gerçekleşen')}</p>
                </div>
                
                <div className="relative" ref={chartMenuRef}>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        onClick={() => setChartMenuOpen(!chartMenuOpen)}
                    >
                        <MoreHorizontal size={16} />
                    </Button>
                    {chartMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1a1025] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 py-1">
                            <button 
                                onClick={() => { refetch(); setChartMenuOpen(false); }} 
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"
                            >
                                <RefreshCcw size={14} /> Yenile
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 w-full relative min-h-0">
                
                {!hasChartData && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-[#0c0516]/60 backdrop-blur-sm pt-12 gap-6">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-full shadow-sm border border-slate-100 dark:border-white/5">
                            <BarChart3 size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Henüz satış verisi oluşmadı</p>
                    </div>
                )}

                <div className="w-full h-full overflow-hidden px-6 pb-4 pt-4">
                    <div className="flex items-end justify-between gap-3 w-full h-full">
                        {monthKeys.map((key, i) => {
                            const height = hasChartData ? chartData[i] : 0; 
                            
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                    <div className="w-full h-full flex items-end justify-center relative">
                                        <div className="absolute bottom-0 w-full h-full bg-slate-100 dark:bg-white/5 rounded-t-sm mx-1" />
                                        <div
                                            style={{ height: `${height}%` }} 
                                            className="w-full mx-1 bg-linear-to-t from-pink-600 to-orange-400 opacity-90 rounded-t-sm relative z-10"
                                        />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                                        {t(`dashboard.monthsShort.${key}`).substring(0, 3)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </CardWrapper>

        {/* Right: Latest Activities (4 cols) */}
        <CardWrapper className="col-span-12 lg:col-span-4 h-full flex flex-col p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/30 dark:bg-white/5 shrink-0">
                <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-orange-500" />
                    {t('dashboard.latestActivities', 'Son Aktiviteler')}
                </h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/activity-management')} 
                    className="text-xs text-pink-600 h-7 px-2 hover:bg-pink-50 dark:hover:bg-pink-500/10"
                >
                    {t('dashboard.viewAll', 'Tümü')}
                </Button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {deals.length > 0 ? (
                    <div className="p-4 space-y-3">
                        {deals.map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${
                                        i % 2 === 0
                                            ? 'bg-pink-50 border-pink-100 text-pink-600 dark:bg-pink-500/10 dark:border-pink-500/20 dark:text-pink-400'
                                            : 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400'
                                    }`}>
                                        {d.c ? d.c.substring(0, 2).toUpperCase() : '??'}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{d.c}</h4>
                                        <p className="text-[10px] text-slate-400 truncate">{d.s}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{d.a || '-'}</p>
                                    <span className="text-[9px] text-slate-400">{d.d}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-8 pt-20">
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-full">
                            <Package size={32} className="opacity-40" />
                        </div>
                        <p className="text-xs">{t('dashboard.noActivities', 'Henüz aktivite yok')}</p>
                    </div>
                )}
            </div>
        </CardWrapper>
      </div>

      {/* Bottom Section - Fixed Height */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4 h-[140px] shrink-0">
        {[
            { 
              t: t('dashboard.quickStats.pendingTasks', 'Bekleyen Görevler'), 
              d: t('dashboard.quickStats.checkTasks', 'Görev listesini kontrol et'), 
              i: Clock, 
              c: 'text-orange-500', 
              bg: 'bg-orange-50 dark:bg-orange-500/10',
              link: '/daily-tasks'
            },
            { 
              t: t('dashboard.quickStats.openQuotations', 'Açık Teklifler'), 
              d: t('dashboard.quickStats.reviewQuotations', 'Teklifleri incele'), 
              i: FileText, 
              c: 'text-pink-500', 
              bg: 'bg-pink-50 dark:bg-pink-500/10',
              link: '/quotations'
            },
            { 
              t: t('dashboard.quickStats.criticalStock', 'Kritik Stok'), 
              d: t('dashboard.quickStats.stockStatus', 'Stok durumunu gör'), 
              i: Package, 
              c: 'text-purple-500', 
              bg: 'bg-purple-50 dark:bg-purple-500/10',
              link: '/stocks'
            },
        ].map((x, k) => (
            <CardWrapper 
                key={k} 
                onClick={() => navigate(x.link)}
                interactive={true}
                className="p-5 flex items-center gap-8 group h-full"
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${x.bg} ${x.c} transition-transform group-hover:scale-110 shrink-0`}>
                    <x.i size={24} />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-semibold text-lg">{x.t}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{x.d}</p>
                </div>
            </CardWrapper>
        ))}
      </div>

    </div>
  );
}
