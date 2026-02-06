import type { ApiResponse } from '@/types/api';
import type {
  Customer360AnalyticsChartsDto,
  Customer360AnalyticsSummaryDto,
  Customer360OverviewDto,
} from '../types/customer360.types';
import { api } from '@/lib/axios';

function ensureData<T>(response: ApiResponse<T | null>, fallbackMessage: string): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message ?? response.exceptionMessage ?? fallbackMessage);
  }
  return response.data;
}

export async function getCustomer360Overview(params: {
  id: number;
  currency?: string;
  signal?: AbortSignal;
}): Promise<Customer360OverviewDto> {
  const { id, currency, signal } = params;
  const url =
    currency != null && currency !== ''
      ? `/api/customers/${id}/overview?currency=${encodeURIComponent(currency)}`
      : `/api/customers/${id}/overview`;
  const headers: Record<string, string> = {};
  if (currency != null && currency !== '') {
    headers['X-Currency'] = currency;
    headers['Currency'] = currency;
  }
  const response = await api.get<ApiResponse<Customer360OverviewDto | null>>(url, {
    signal,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
  return ensureData(response, 'Overview could not be loaded');
}

export async function getCustomer360AnalyticsSummary(params: {
  id: number;
  currency?: string;
  signal?: AbortSignal;
}): Promise<Customer360AnalyticsSummaryDto> {
  const { id, currency, signal } = params;
  const url =
    currency != null && currency !== ''
      ? `/api/customers/${id}/analytics/summary?currency=${encodeURIComponent(currency)}`
      : `/api/customers/${id}/analytics/summary`;
  const headers: Record<string, string> = {};
  if (currency != null && currency !== '') {
    headers['X-Currency'] = currency;
    headers['Currency'] = currency;
  }
  const response = await api.get<ApiResponse<Customer360AnalyticsSummaryDto | null>>(url, {
    signal,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
  return ensureData(response, 'Analytics summary could not be loaded');
}

export async function getCustomer360AnalyticsCharts(params: {
  id: number;
  months?: number;
  currency?: string;
  signal?: AbortSignal;
}): Promise<Customer360AnalyticsChartsDto> {
  const { id, months = 12, currency, signal } = params;
  const search = new URLSearchParams({ months: String(months) });
  if (currency != null && currency !== '') {
    search.set('currency', currency);
  }
  const url = `/api/customers/${id}/analytics/charts?${search.toString()}`;
  const headers: Record<string, string> = {};
  if (currency != null && currency !== '') {
    headers['X-Currency'] = currency;
    headers['Currency'] = currency;
  }
  const response = await api.get<ApiResponse<Customer360AnalyticsChartsDto | null>>(url, {
    signal,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
  return ensureData(response, 'Analytics charts could not be loaded');
}
