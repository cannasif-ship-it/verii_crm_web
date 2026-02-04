import { api } from '@/shared/api';
import type { ConnectionDto, DataSourceCheckResponseDto, Field } from '../types';

const BASE = '/api/reportbuilder';

function normalizeField(raw: Record<string, unknown>): Field {
  return {
    name: String(raw.name ?? raw.Name ?? ''),
    sqlType: String(raw.sqlType ?? raw.SqlType ?? ''),
    dotNetType: String(raw.dotNetType ?? raw.DotNetType ?? ''),
    isNullable: Boolean(raw.isNullable ?? raw.IsNullable ?? false),
  };
}

function schemaToFields(schema: unknown): Field[] {
  if (!Array.isArray(schema)) return [];
  return schema.map((item) =>
    typeof item === 'object' && item !== null ? normalizeField(item as Record<string, unknown>) : { name: '', sqlType: '', dotNetType: '', isNullable: false }
  );
}

function normalizeConnection(raw: Record<string, unknown>): ConnectionDto {
  return {
    key: String(raw.key ?? raw.Key ?? ''),
    label: raw.label != null || raw.Label != null ? String(raw.label ?? raw.Label ?? '') : undefined,
  };
}

function toConnectionList(list: unknown): ConnectionDto[] {
  const arr = Array.isArray(list)
    ? list
    : (list as { data?: unknown[] })?.data ?? (list as { Data?: unknown[] })?.Data ?? [];
  if (!Array.isArray(arr)) return [];
  return arr.map((item) =>
    typeof item === 'object' && item !== null ? normalizeConnection(item as Record<string, unknown>) : { key: '' }
  ).filter((c) => c.key !== '');
}

export const reportingApi = {
  async getConnections(): Promise<ConnectionDto[]> {
    const res = await api.get<ConnectionDto[] | { data?: unknown[]; Data?: unknown[] }>(`${BASE}/connections`);
    return toConnectionList(res);
  },

  async checkDataSource(body: {
    connectionKey: string;
    type: string;
    name: string;
  }): Promise<{ exists: boolean; message?: string; schema: Field[] }> {
    const res = await api.post<DataSourceCheckResponseDto>(`${BASE}/datasources/check`, body);
    const schema = res?.schema ?? (res as { Schema?: unknown[] }).Schema ?? [];
    const schemaArr = Array.isArray(schema) ? schema : [];
    return {
      exists: Boolean(res?.exists ?? (res as { Exists?: boolean }).Exists ?? schemaArr.length > 0),
      message: String(res?.message ?? (res as { Message?: string }).Message ?? ''),
      schema: schemaToFields(schemaArr),
    };
  },
};
