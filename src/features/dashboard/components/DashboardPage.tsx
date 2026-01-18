import { type ReactElement, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import i18n from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, Users, ShoppingCart, ArrowUpRight, ArrowDownRight, Clock, FileText, Package } from 'lucide-react';

type GlassContainerProps = {
  children: ReactNode;
};

function GlassContainer({ children }: GlassContainerProps): ReactElement {
  return (
    <div className="bg-[#1a1025]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-[0_0_40px_rgba(15,23,42,0.8)]">
      {children}
    </div>
  );
}

export function DashboardPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { data, isLoading } = useDashboardQuery();

  useEffect(() => {
    setPageTitle(t('dashboard.title', 'Dashboard'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (): string => {
    const now = new Date();
    const locale = i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'en' ? 'en-US' : i18n.language === 'de' ? 'de-DE' : 'fr-FR';
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    return now.toLocaleDateString(locale, options);
  };

  const formatTime = (): string => {
    const now = new Date();
    const locale = i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'en' ? 'en-US' : i18n.language === 'de' ? 'de-DE' : 'fr-FR';
    return now.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActivityIcon = (type: string): ReactElement => {
    switch (type) {
      case 'sale':
        return (
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
            className="text-orange-500"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        );
      case 'customer':
        return (
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
            className="text-blue-500"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'task':
        return (
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
            className="text-green-500"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'meeting':
        return (
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
            className="text-purple-500"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      default:
        return <div className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const activities = data?.activities || [];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#050816] via-[#120323] to-[#020617] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-24 w-[420px] h-[420px] rounded-full bg-pink-500/10 blur-xl" />
        <div className="absolute -bottom-52 -left-32 w-[460px] h-[460px] rounded-full bg-orange-500/5 blur-lg" />
      </div>
      <div className="relative px-4 py-6">
        <GlassContainer>
          <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center shadow-[0_0_18px_rgba(236,72,153,0.6)]">
                <span className="text-xs font-semibold text-white">VR</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-orange-300">
                  {t('dashboard.title')}
                </h1>
                <p className="text-sm text-slate-400/80">
                  {formatDate()} • {formatTime()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex gap-2 items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10">
                Rapor AI
              </Button>
              <Button className="flex gap-2 items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-sm text-white shadow-lg hover:scale-105 transition">
                Hızlı İşlemler
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Toplam Gelir',
                value: '₺845,200',
                change: '+12.5%',
                positive: true,
                Icon: Wallet,
              },
              {
                label: 'Aktif Fırsatlar',
                value: '142',
                change: '+8.2%',
                positive: true,
                Icon: Users,
              },
              {
                label: 'Yeni Potansiyeller',
                value: '38',
                change: '-2.4%',
                positive: false,
                Icon: Users,
              },
              {
                label: 'Bekleyen Siparişler',
                value: '12',
                change: '+5.0%',
                positive: true,
                Icon: ShoppingCart,
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-[#150f1e] border border-white/5 rounded-2xl flex flex-col justify-between h-[160px]"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                    <item.Icon size={20} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border ${
                      item.positive
                        ? 'border-green-400/60 bg-green-500/5 text-green-300'
                        : 'border-red-400/60 bg-red-500/5 text-red-300'
                    }`}
                  >
                    {item.positive ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {item.change}
                  </span>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {item.value}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <Card className="col-span-4 bg-[#150f1e] border border-white/5 rounded-2xl flex flex-col h-[380px] lg:h-[420px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-2">
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
                    className="text-pink-500"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M7 14l4-4 4 4 4-8" />
                  </svg>
                  <CardTitle className="text-lg font-bold text-white">
                    {t('dashboard.monthlySalesAnalysis', 'Aylık Satış Analizi')}
                  </CardTitle>
                </div>
                <div className="flex gap-4 text-xs font-medium text-slate-400">
                  <span>
                    <span className="w-2 h-2 rounded-full bg-pink-600 inline-block mr-2" />
                    Hedef
                  </span>
                  <span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block mr-2" />
                    Gerçekleşen
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-end gap-3 px-2 pb-6">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 60].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-3 h-full justify-end cursor-pointer"
                    >
                      <div className="w-full relative flex items-end justify-center h-full">
                        <div
                          style={{ height: `${height}%` }}
                          className="w-full bg-gradient-to-t from-pink-600 via-orange-500 to-yellow-500 opacity-90 rounded-t-sm transition"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][index]}
                      </span>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3 bg-[#150f1e] border border-white/5 rounded-2xl flex flex-col h-[380px] lg:h-[420px]">
              <CardHeader className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
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
                    className="text-yellow-400"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <CardTitle className="text-white">
                    {t('dashboard.latestActivities')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      {t('dashboard.noActivities')}
                    </p>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1425] border border-white/[0.02] hover:bg-white/[0.03] transition"
                      >
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-white">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-slate-400">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            {activity.timeAgo}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Bekleyen Görevler',
                description: 'Bugün için 5 toplantın var',
                Icon: Clock,
                iconColor: 'text-orange-400',
              },
              {
                title: 'Açık Teklifler',
                description: '8 teklif onay bekliyor',
                Icon: FileText,
                iconColor: 'text-pink-400',
              },
              {
                title: 'Kritik Stok',
                description: '3 ürün kritik seviyede',
                Icon: Package,
                iconColor: 'text-yellow-400',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-[#150f1e] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-[#1a1425] border border-white/5 flex items-center justify-center mb-4">
                  <item.Icon className={item.iconColor} size={32} />
                </div>
                <h4 className="font-bold text-lg text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
}
