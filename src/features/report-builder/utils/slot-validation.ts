import type { Field } from '../types';
import type { ReportConfig } from '../types';

function getTypeString(field: Field): string {
  return ((field.dotNetType ?? '') + ' ' + (field.sqlType ?? '')).trim().toLowerCase();
}

const STRING_KEYWORDS = ['string', 'guid', 'nvarchar', 'varchar', 'char', 'nchar', 'text'];
const DATE_KEYWORDS = ['datetime', 'datetimeoffset', 'dateonly', 'date', 'time', 'timestamp'];
const NUMERIC_KEYWORDS = [
  'int32', 'int64', 'int16', 'int', 'integer', 'bigint', 'smallint', 'tinyint', 'byte',
  'decimal', 'numeric', 'double', 'single', 'float', 'real', 'number', 'long', 'short',
];

export function isAxisCompatible(field: Field): boolean {
  const t = getTypeString(field);
  return STRING_KEYWORDS.some((s) => t.includes(s)) || DATE_KEYWORDS.some((s) => t.includes(s));
}

export function isValuesCompatible(field: Field): boolean {
  const t = getTypeString(field);
  return NUMERIC_KEYWORDS.some((s) => t.includes(s));
}

export function isLegendCompatible(field: Field): boolean {
  const t = getTypeString(field);
  return STRING_KEYWORDS.some((s) => t.includes(s));
}

export function getOperatorsForField(field: Field): string[] {
  const t = getTypeString(field);
  if (DATE_KEYWORDS.some((d) => t.includes(d))) {
    return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull'];
  }
  if (NUMERIC_KEYWORDS.some((n) => t.includes(n))) {
    return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'isNull', 'isNotNull'];
  }
  return ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in', 'isNull', 'isNotNull'];
}

export function validatePieConfig(config: ReportConfig): string | null {
  const hasAxis = !!config.axis?.field;
  const hasLegend = !!config.legend?.field;
  if (!hasAxis && !hasLegend) return 'Pie requires axis or legend.';
  if (config.values.length === 0) return 'Pie requires one numeric value.';
  if (config.values.length > 1) return 'Pie should have a single value.';
  return null;
}
