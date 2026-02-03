export type ChartType = 'table' | 'bar' | 'line' | 'pie';

export type DateGrouping = 'day' | 'week' | 'month' | 'year';

export type Aggregation = 'sum' | 'count' | 'avg' | 'min' | 'max';

export interface ReportConfigAxis {
  field: string;
  dateGrouping?: DateGrouping;
}

export interface ReportConfigValue {
  field: string;
  aggregation: Aggregation;
}

export interface ReportConfigLegend {
  field: string;
}

export interface ReportConfigSorting {
  by: 'axis' | 'value';
  direction: 'asc' | 'desc';
  valueField?: string;
}

export interface ReportConfigFilter {
  field: string;
  operator: string;
  value?: unknown;
  values?: unknown[];
  from?: unknown;
  to?: unknown;
}

export interface ReportConfig {
  chartType: ChartType;
  axis?: ReportConfigAxis;
  values: ReportConfigValue[];
  legend?: ReportConfigLegend;
  sorting?: ReportConfigSorting;
  filters: ReportConfigFilter[];
}

export interface Field {
  name: string;
  sqlType: string;
  dotNetType: string;
  isNullable: boolean;
}

export interface DataSourceCheckResponseDto {
  exists?: boolean;
  message?: string;
  schema?: Field[];
}

export interface ConnectionDto {
  key: string;
  label?: string;
}

export interface ReportDto {
  id: number;
  name: string;
  description?: string;
  connectionKey: string;
  dataSourceType: string;
  dataSourceName: string;
  configJson: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface ReportPreviewRequest {
  connectionKey: string;
  dataSourceType: string;
  dataSourceName: string;
  configJson: string;
}

export interface ReportPreviewResponse {
  columns: string[];
  rows: unknown[][];
}
