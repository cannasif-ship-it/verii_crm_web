import { type ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCw, User, MapPin, FileText, ClipboardList, ShoppingCart, Activity, Clock } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomer360Overview } from '../hooks/useCustomer360Overview';
import { useCustomer360AnalyticsSummary } from '../hooks/useCustomer360AnalyticsSummary';
import { useCustomer360AnalyticsCharts } from '../hooks/useCustomer360AnalyticsCharts';
import type {
  Customer360SimpleItemDto,
  Customer360TimelineItemDto,
  Customer360DistributionDto,
  Customer360AmountComparisonDto,
} from '../types/customer360.types';

function SectionSkeleton(): ReactElement {
  return (
    <Card className="rounded-xl border border-slate-200 dark:border-white/10">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon: Icon,
  items,
  emptyKey,
  renderItem,
}: {
  title: string;
  icon: React.ElementType;
  items: unknown[];
  emptyKey: string;
  renderItem: (item: unknown) => ReactElement;
}): ReactElement {
  const { t } = useTranslation();
  return (
    <Card className="rounded-xl border border-slate-200 dark:border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!items?.length ? (
          <p className="text-sm text-muted-foreground py-2">{t(emptyKey)}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={(item as { id?: number; itemId?: number }).id ?? (item as { itemId?: number }).itemId ?? i}>
                {renderItem(item)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleItemRow({ item }: { item: Customer360SimpleItemDto }): ReactElement {
  const { i18n } = useTranslation();
  const label = [item.title, item.subtitle].filter(Boolean).join(' · ') || `#${item.id}`;
  const date = item.date ? new Date(item.date).toLocaleDateString(i18n.language) : null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="truncate">{label}</span>
      {date && <span className="text-muted-foreground shrink-0">{date}</span>}
    </div>
  );
}

function translateStatus(t: (key: string) => string, status: string): string {
  const key = `customer360.status.${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

function TimelineRow({ item }: { item: Customer360TimelineItemDto }): ReactElement {
  const { t, i18n } = useTranslation();
  const date = new Date(item.date).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' });
  const statusLabel = item.status ? translateStatus(t, item.status) : null;
  return (
    <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="shrink-0 text-muted-foreground text-xs w-36">{date}</div>
      <div className="min-w-0">
        <div className="font-medium text-sm">{item.title || item.type || '-'}</div>
        {statusLabel && (
          <div className="text-muted-foreground text-xs mt-0.5">{statusLabel}</div>
        )}
      </div>
    </div>
  );
}

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b'];

function AnalyticsChartsSection({
  distribution,
  monthlyTrend,
  amountComparison,
  currencyFormatter,
  t,
  noDataKey,
}: {
  distribution: Customer360DistributionDto;
  monthlyTrend: { month: string; demandCount: number; quotationCount: number; orderCount: number }[];
  amountComparison: Customer360AmountComparisonDto;
  currencyFormatter: Intl.NumberFormat;
  t: (key: string) => string;
  noDataKey: string;
}): ReactElement {
  const pieData = [
    { name: t('customer360.analyticsCharts.demand'), value: distribution.demandCount },
    { name: t('customer360.analyticsCharts.quotation'), value: distribution.quotationCount },
    { name: t('customer360.analyticsCharts.order'), value: distribution.orderCount },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: t('customer360.analyticsCharts.last12MonthsOrderAmount'), value: amountComparison.last12MonthsOrderAmount },
    { name: t('customer360.analyticsCharts.openQuotationAmount'), value: amountComparison.openQuotationAmount },
    { name: t('customer360.analyticsCharts.openOrderAmount'), value: amountComparison.openOrderAmount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      <Card className="rounded-xl border border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-base">{t('customer360.analyticsCharts.distributionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t(noDataKey)}</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => [value ?? 0, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 dark:border-white/10 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">{t('customer360.analyticsCharts.monthlyTrendTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!monthlyTrend?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t(noDataKey)}</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="demandCount" name={t('customer360.analyticsCharts.demand')} stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="quotationCount" name={t('customer360.analyticsCharts.quotation')} stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="orderCount" name={t('customer360.analyticsCharts.order')} stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-slate-200 dark:border-white/10 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">{t('customer360.analyticsCharts.amountComparisonTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.every((d) => d.value === 0) ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t(noDataKey)}</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => currencyFormatter.format(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number | undefined) => [currencyFormatter.format(value ?? 0), '']} />
                  <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function Customer360Page(): ReactElement {
  const { customerId } = useParams<{ customerId: string }>();
  const { t, i18n } = useTranslation();
  const id = Number(customerId ?? 0);
  const { data, isLoading, isError, error, refetch } = useCustomer360Overview(id);
  const { data: analytics, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useCustomer360AnalyticsSummary(id);
  const {
    data: chartsData,
    isLoading: isChartsLoading,
    isError: isChartsError,
  } = useCustomer360AnalyticsCharts(id, 12);

  if (id <= 0) {
    return (
      <div className="container py-8">
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-8 text-center">
          <p className="text-muted-foreground">{t('customer360.notFound')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    const is404 =
      (error as { response?: { status?: number } })?.response?.status === 404 ||
      /not found|bulunamadı/i.test((error as Error)?.message ?? '');
    return (
      <div className="container py-8">
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-8 text-center space-y-4">
          <p className="text-muted-foreground">
            {is404 ? t('customer360.notFound') : t('customer360.error')}
          </p>
          {!is404 && (
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('customer360.retry')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-8">
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-8 text-center">
          <p className="text-muted-foreground">{t('customer360.notFound')}</p>
        </div>
      </div>
    );
  }

  const profile = data.profile ?? { id: 0, name: '', customerCode: null };
  const kpi = data.kpis ?? {
    totalDemands: 0,
    totalQuotations: 0,
    totalOrders: 0,
    openQuotations: 0,
    openOrders: 0,
  };
  const timelineSorted = [...(data.timeline ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const analyticsSummary = analytics ?? {
    last12MonthsOrderAmount: 0,
    openQuotationAmount: 0,
    openOrderAmount: 0,
    activityCount: 0,
    lastActivityDate: null,
  };
  const currencyFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="container py-6 space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('customer360.title')}</h1>
        <p className="text-muted-foreground text-sm">
          {profile.name ?? ''}
          {profile.customerCode ? ` · ${profile.customerCode}` : ''}
        </p>
      </header>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('customer360.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('customer360.tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="rounded-xl border border-slate-200 dark:border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer360.kpi.totalDemands')}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.totalDemands ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-slate-200 dark:border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer360.kpi.totalQuotations')}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.totalQuotations ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-slate-200 dark:border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer360.kpi.totalOrders')}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.totalOrders ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-slate-200 dark:border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer360.kpi.openQuotations')}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.openQuotations ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border border-slate-200 dark:border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer360.kpi.openOrders')}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.openOrders ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard
              title={t('customer360.sections.contacts')}
              icon={User}
              items={data.contacts ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
            <SectionCard
              title={t('customer360.sections.shippingAddresses')}
              icon={MapPin}
              items={data.shippingAddresses ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
            <SectionCard
              title={t('customer360.sections.recentDemands')}
              icon={ClipboardList}
              items={data.recentDemands ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
            <SectionCard
              title={t('customer360.sections.recentQuotations')}
              icon={FileText}
              items={data.recentQuotations ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
            <SectionCard
              title={t('customer360.sections.recentOrders')}
              icon={ShoppingCart}
              items={data.recentOrders ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
            <SectionCard
              title={t('customer360.sections.recentActivities')}
              icon={Activity}
              items={data.recentActivities ?? []}
              emptyKey="common.noData"
              renderItem={(item) => <SimpleItemRow item={item as Customer360SimpleItemDto} />}
            />
          </div>

          <SectionCard
            title={t('customer360.sections.timeline')}
            icon={Clock}
            items={timelineSorted}
            emptyKey="common.noData"
            renderItem={(item) => <TimelineRow item={item as Customer360TimelineItemDto} />}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {isAnalyticsError ? (
            <Card className="rounded-xl border border-dashed border-slate-200 dark:border-white/10">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                {t('customer360.analytics.error')}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer360.analytics.last12MonthsOrderAmount')}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {isAnalyticsLoading ? '-' : currencyFormatter.format(analyticsSummary.last12MonthsOrderAmount ?? 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer360.analytics.openQuotationAmount')}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {isAnalyticsLoading ? '-' : currencyFormatter.format(analyticsSummary.openQuotationAmount ?? 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer360.analytics.openOrderAmount')}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {isAnalyticsLoading ? '-' : currencyFormatter.format(analyticsSummary.openOrderAmount ?? 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer360.analytics.activityCount')}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {isAnalyticsLoading ? '-' : analyticsSummary.activityCount ?? 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer360.analytics.lastActivityDate')}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {isAnalyticsLoading
                        ? '-'
                        : analyticsSummary.lastActivityDate
                          ? new Date(analyticsSummary.lastActivityDate).toLocaleDateString(i18n.language)
                          : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {isChartsError ? (
                <Card className="rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    {t('customer360.analytics.error')}
                  </CardContent>
                </Card>
              ) : isChartsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                  </Card>
                  <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                  </Card>
                  <Card className="rounded-xl border border-slate-200 dark:border-white/10">
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                  </Card>
                </div>
              ) : chartsData ? (
                <AnalyticsChartsSection
                  distribution={chartsData.distribution}
                  monthlyTrend={chartsData.monthlyTrend}
                  amountComparison={chartsData.amountComparison}
                  currencyFormatter={currencyFormatter}
                  t={t}
                  noDataKey="common.noData"
                />
              ) : null}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
