import { type ReactElement, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import i18n from '@/lib/i18n';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

type CardWrapperProps = {
  children: ReactNode;
  className?: string;
};

function CardWrapper({ children, className = '' }: CardWrapperProps): ReactElement {
  return (
    <div
      className={`bg-card/80 dark:bg-[#1a1025]/60 backdrop-blur-xl border border-border dark:border-white/5 p-6 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { data, isLoading } = useDashboardQuery();

  const languages = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'fr', label: 'FR' },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) ?? languages[0];

  const handleLanguageToggle = (): void => {
    const currentIndex = languages.findIndex((lang) => lang.code === i18n.language);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const activities = data?.activities || [];

  const stats = [
    {
      l: t('dashboard.stats.totalRevenue'),
      v: kpis ? formatCurrency(kpis.monthlyRevenue) : '₺845,200',
      c: `${kpis?.monthlyRevenueChange ?? 12.5}%`,
      p: (kpis?.monthlyRevenueChange ?? 12.5) >= 0 ? 1 : 0,
      i: Wallet,
    },
    {
      l: t('dashboard.stats.activeOpportunities'),
      v: kpis ? String(kpis.activeAgreements ?? 142) : '142',
      c: `${kpis?.activeAgreementsChange ?? 8.2}%`,
      p: (kpis?.activeAgreementsChange ?? 8.2) >= 0 ? 1 : 0,
      i: Users,
    },
    {
      l: t('dashboard.stats.newLeads'),
      v: '38',
      c: '-2.4%',
      p: 0,
      i: Users,
    },
    {
      l: t('dashboard.stats.pendingOrders'),
      v: '12',
      c: '+5.0%',
      p: 1,
      i: ShoppingCart,
    },
  ];

  const defaultDeals = [
    {
      c: 'TechSolutions A.Ş.',
      a: '₺125,000',
      s: t('dashboard.deals.status.orderReceived'),
      d: t('dashboard.deals.time.twoHoursAgo'),
    },
    {
      c: 'Global Lojistik',
      a: '₺45,000',
      s: t('dashboard.deals.status.quotationSent'),
      d: t('dashboard.deals.time.fiveHoursAgo'),
    },
    {
      c: 'Mega Yapı Market',
      a: '₺280,000',
      s: t('dashboard.deals.status.negotiating'),
      d: t('dashboard.deals.time.oneDayAgo'),
    },
    {
      c: 'StartUp Studio',
      a: '₺15,000',
      s: t('dashboard.deals.status.cancelled'),
      d: t('dashboard.deals.time.twoDaysAgo'),
    },
    {
      c: 'Atlas Enerji',
      a: '₺950,000',
      s: t('dashboard.deals.status.invoiced'),
      d: t('dashboard.deals.time.threeDaysAgo'),
    },
  ];

  const monthKeys = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  const deals =
    activities.length === 0
      ? defaultDeals
      : activities.slice(0, 5).map((activity) => ({
          c: activity.title,
          a: activity.amount ? formatCurrency(activity.amount) : '',
          s: t(`dashboard.activityType.${activity.type}`),
          d: activity.timeAgo,
        }));

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-background dark:bg-gradient-to-br dark:from-[#050816] dark:via-[#120323] dark:to-[#020617] px-4 py-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 hidden dark:block">
        <div className="absolute bottom-[-12%] left-[-12%] h-[440px] w-[440px] rounded-full bg-orange-500 blur-[120px] opacity-10" />
        <div className="absolute top-[3.5rem] right-0 h-[360px] w-[360px] rounded-full bg-orange-500 blur-[120px] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">
            {t('dashboard.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {formatDate()} • {formatTime()}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            className="h-9 px-3 rounded-full bg-secondary border border-border text-xs font-medium text-foreground hover:bg-accent dark:bg-[#1a1025] dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            onClick={handleLanguageToggle}
          >
            {currentLanguage.label}
          </Button>
          <Button className="flex gap-2 items-center px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-accent dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
            <FileText size={16} />
            {t('dashboard.reportDownload')}
          </Button>
          <Button className="flex gap-2 items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg text-sm text-white shadow-lg hover:scale-105 transition">
            <ArrowUpRight size={16} />
            {t('dashboard.quickAction')}
          </Button>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <CardWrapper key={i} className="group hover:border-white/10 transition hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-muted/60 dark:bg-white/5">
                <s.i className="text-muted-foreground" size={24} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  s.p
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {s.p ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.c}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">{s.l}</h3>
            <p className="text-2xl font-bold text-foreground">{s.v}</p>
          </CardWrapper>
        ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <CardWrapper className="lg:col-span-2 flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold flex gap-2 text-foreground">
              <TrendingUp className="text-pink-500" size={20} />
              {t('dashboard.salesAnalysis')}
            </h3>
            <div className="flex gap-2 text-xs text-muted-foreground">
              {t('dashboard.targetVsActual')}
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
              >
                <div className="w-full relative flex items-end justify-center">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-pink-600 via-orange-500 to-yellow-500 opacity-80 rounded-t-sm relative shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                  {t(`dashboard.monthsShort.${monthKeys[i]}`)}
                </span>
              </div>
            ))}
          </div>
        </CardWrapper>

        <CardWrapper className="h-[420px] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">{t('dashboard.latestActivities')}</h3>
            <button className="text-xs text-pink-400">{t('dashboard.viewAll', 'Tümünü Gör')}</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {deals.map((d, i) => (
              <div
                key={i}
                className="flex justify-between p-3 rounded-xl border bg-card/80 hover:bg-muted transition-colors dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${
                      i % 2 === 0
                        ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                        : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                    }`}
                  >
                    {d.c.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{d.c}</h4>
                    <p className="text-[11px] text-muted-foreground">{d.s}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{d.a}</p>
                  <span className="text-[10px] text-muted-foreground">{d.d}</span>
                </div>
              </div>
            ))}
          </div>
        </CardWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[
          {
            t: t('dashboard.quickStats.pendingTasks'),
            d: t('dashboard.quickStats.pendingTasksDescription'),
            i: Clock,
            c: 'text-orange-400',
          },
          {
            t: t('dashboard.quickStats.openQuotations'),
            d: t('dashboard.quickStats.openQuotationsDescription'),
            i: FileText,
            c: 'text-pink-400',
          },
          {
            t: t('dashboard.quickStats.criticalStock'),
            d: t('dashboard.quickStats.criticalStockDescription'),
            i: Package,
            c: 'text-yellow-400',
          },
        ].map((x, k) => (
          <CardWrapper
            key={k}
            className="flex flex-col items-center text-center hover:border-white/10 transition"
          >
            <div className="w-14 h-14 rounded-full bg-muted/60 dark:bg-white/5 flex items-center justify-center mb-4">
              <x.i className={x.c} size={28} />
            </div>
            <h4 className="font-semibold text-foreground">{x.t}</h4>
            <p className="text-xs text-muted-foreground mt-1">{x.d}</p>
          </CardWrapper>
        ))}
        </div>
      </div>
    </div>
  );
}
