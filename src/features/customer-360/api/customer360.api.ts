import type { ApiResponse } from '@/types/api';
import type {
  Customer360AnalyticsChartsDto,
  Customer360AnalyticsSummaryDto,
  Customer360OverviewDto,
} from '../types/customer360.types';
import { api } from '@/lib/axios';

export async function getOverview(customerId: number): Promise<Customer360OverviewDto> {
  const response = await api.get<ApiResponse<Customer360OverviewDto>>(
    `/api/customers/${customerId}/overview`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? 'Overview could not be loaded');
  }
  return response.data;
}

export async function getAnalyticsSummary(customerId: number): Promise<Customer360AnalyticsSummaryDto> {
  const response = await api.get<ApiResponse<Customer360AnalyticsSummaryDto>>(
    `/api/customers/${customerId}/analytics/summary`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? 'Analytics summary could not be loaded');
  }
  return response.data;
}

export async function getAnalyticsCharts(
  customerId: number,
  months = 12
): Promise<Customer360AnalyticsChartsDto> {
  const response = await api.get<ApiResponse<Customer360AnalyticsChartsDto>>(
    `/api/customers/${customerId}/analytics/charts?months=${months}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? 'Analytics charts could not be loaded');
  }
  return response.data;
}
