import { useQuery } from '@tanstack/react-query';
import {
  getSalesmenOverview,
  getSalesmenAnalyticsSummary,
  getSalesmenAnalyticsCharts,
} from '../api/salesmen360Api';

const OVERVIEW_STALE_MS = 30_000;
const SUMMARY_STALE_MS = 30_000;
const CHARTS_STALE_MS = 45_000;

export function useSalesmenOverviewQuery(userId: number, currency?: string) {
  return useQuery({
    queryKey: ['salesmen360', 'overview', userId, currency ?? 'ALL'],
    queryFn: ({ signal }) =>
      getSalesmenOverview({ userId, currency: currency && currency !== 'ALL' ? currency : undefined, signal }),
    staleTime: OVERVIEW_STALE_MS,
    enabled: userId > 0,
  });
}

export function useSalesmenAnalyticsSummaryQuery(userId: number, currency?: string) {
  return useQuery({
    queryKey: ['salesmen360', 'summary', userId, currency ?? 'ALL'],
    queryFn: ({ signal }) =>
      getSalesmenAnalyticsSummary({
        userId,
        currency: currency && currency !== 'ALL' ? currency : undefined,
        signal,
      }),
    staleTime: SUMMARY_STALE_MS,
    enabled: userId > 0,
  });
}

export function useSalesmenAnalyticsChartsQuery(
  userId: number,
  months = 12,
  currency?: string
) {
  return useQuery({
    queryKey: ['salesmen360', 'charts', userId, months, currency ?? 'ALL'],
    queryFn: ({ signal }) =>
      getSalesmenAnalyticsCharts({
        userId,
        months,
        currency: currency && currency !== 'ALL' ? currency : undefined,
        signal,
      }),
    staleTime: CHARTS_STALE_MS,
    enabled: userId > 0,
  });
}
