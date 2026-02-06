import { useQuery } from '@tanstack/react-query';
import {
  getCustomer360Overview,
  getCustomer360AnalyticsSummary,
  getCustomer360AnalyticsCharts,
} from '../api/customer360.api';

const OVERVIEW_STALE_MS = 30_000;
const SUMMARY_STALE_MS = 30_000;
const CHARTS_STALE_MS = 45_000;

export function useCustomer360OverviewQuery(id: number, currency?: string) {
  return useQuery({
    queryKey: ['customer360', 'overview', id, currency ?? 'ALL'],
    queryFn: ({ signal }) => getCustomer360Overview({ id, currency, signal }),
    staleTime: OVERVIEW_STALE_MS,
    enabled: id > 0,
  });
}

export function useCustomer360AnalyticsSummaryQuery(id: number, currency?: string) {
  return useQuery({
    queryKey: ['customer360', 'summary', id, currency ?? 'ALL'],
    queryFn: ({ signal }) => getCustomer360AnalyticsSummary({ id, currency, signal }),
    staleTime: SUMMARY_STALE_MS,
    enabled: id > 0,
  });
}

export function useCustomer360AnalyticsChartsQuery(id: number, months?: number, currency?: string) {
  return useQuery({
    queryKey: ['customer360', 'charts', id, months ?? 12, currency ?? 'ALL'],
    queryFn: ({ signal }) =>
      getCustomer360AnalyticsCharts({ id, months: months ?? 12, currency, signal }),
    staleTime: CHARTS_STALE_MS,
    enabled: id > 0,
  });
}
