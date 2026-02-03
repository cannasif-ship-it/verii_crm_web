import { api } from '@/shared/api';
import type { ReportDto, ReportPreviewRequest, ReportPreviewResponse } from '../types';

const BASE = '/api/reports';

export interface ReportCreateUpdateBody {
  name: string;
  description?: string;
  connectionKey: string;
  dataSourceType: string;
  dataSourceName: string;
  configJson: string;
}

function normalizeReportItem(raw: Record<string, unknown>): ReportDto {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    name: String(raw.name ?? raw.Name ?? ''),
    description: raw.description != null || raw.Description != null ? String(raw.description ?? raw.Description ?? '') : undefined,
    connectionKey: String(raw.connectionKey ?? raw.ConnectionKey ?? ''),
    dataSourceType: String(raw.dataSourceType ?? raw.DataSourceType ?? ''),
    dataSourceName: String(raw.dataSourceName ?? raw.DataSourceName ?? ''),
    configJson: String(raw.configJson ?? raw.ConfigJson ?? ''),
    createdAt: raw.createdAt != null || raw.CreatedAt != null || raw.createdDate != null || raw.CreatedDate != null
      ? String(raw.createdAt ?? raw.CreatedAt ?? raw.createdDate ?? raw.CreatedDate ?? '')
      : undefined,
    updatedAt: raw.updatedAt != null || raw.UpdatedAt != null || raw.updatedDate != null || raw.UpdatedDate != null
      ? String(raw.updatedAt ?? raw.UpdatedAt ?? raw.updatedDate ?? raw.UpdatedDate ?? '')
      : undefined,
    isDeleted: raw.isDeleted != null || raw.IsDeleted != null ? Boolean(raw.isDeleted ?? raw.IsDeleted) : undefined,
  };
}

function toReportList(res: unknown): ReportDto[] {
  let arr: unknown[] = [];
  if (Array.isArray(res)) arr = res;
  else {
    const obj = res as Record<string, unknown>;
    const data = obj?.data ?? obj?.Data;
    if (Array.isArray(data)) arr = data;
    else {
      const inner = data as Record<string, unknown> | undefined;
      arr = Array.isArray(inner?.items ?? inner?.Items) ? (inner?.items ?? inner?.Items) as unknown[] : [];
    }
  }
  return arr.map((item) =>
    typeof item === 'object' && item !== null ? normalizeReportItem(item as Record<string, unknown>) : { id: 0, name: '', connectionKey: '', dataSourceType: '', dataSourceName: '', configJson: '' }
  ).filter((r) => r.id > 0);
}

function toReportDetail(res: unknown): ReportDto {
  const obj = res as Record<string, unknown>;
  const data = obj?.data ?? obj?.Data;
  const raw = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : obj;
  return normalizeReportItem(raw);
}

export const reportsApi = {
  async list(search?: string): Promise<ReportDto[]> {
    const q = search != null && search !== '' ? `?search=${encodeURIComponent(search)}` : '';
    const res = await api.get<unknown>(`${BASE}${q}`);
    return toReportList(res);
  },

  async get(id: number): Promise<ReportDto> {
    const res = await api.get<unknown>(`${BASE}/${id}`);
    return toReportDetail(res);
  },

  create(body: ReportCreateUpdateBody): Promise<ReportDto> {
    return api.post<ReportDto>(BASE, body);
  },

  update(id: number, body: ReportCreateUpdateBody): Promise<ReportDto> {
    return api.put<ReportDto>(`${BASE}/${id}`, body);
  },

  remove(id: number): Promise<void> {
    return api.delete<void>(`${BASE}/${id}`);
  },

  preview(payload: ReportPreviewRequest): Promise<ReportPreviewResponse> {
    return api.post<ReportPreviewResponse>(`${BASE}/preview`, payload);
  },
};
