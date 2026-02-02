export enum DocumentRuleType {
  Demand = 0,
  Quotation = 1,
  Order = 2,
}

export interface FieldDefinitionDto {
  label: string;
  path: string;
  type?: string;
}

export interface ReportTemplateFieldsDto {
  headerFields: FieldDefinitionDto[];
  lineFields: FieldDefinitionDto[];
}

export interface ReportTemplatePageDto {
  width: number;
  height: number;
  unit: string;
}

export interface ReportTemplateElementDto {
  id: string;
  type: string;
  section: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  value?: string;
  path?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  columns?: { label: string; path: string }[];
}

export interface ReportTemplateDataDto {
  page: ReportTemplatePageDto;
  elements: ReportTemplateElementDto[];
}

export interface ReportTemplateGetDto {
  id: number;
  ruleType: DocumentRuleType;
  title: string;
  templateData: ReportTemplateDataDto;
  isActive: boolean;
}

export interface ReportTemplateCreateDto {
  ruleType: DocumentRuleType;
  title: string;
  templateData: ReportTemplateDataDto;
  isActive: boolean;
}

export interface ReportTemplateUpdateDto extends ReportTemplateCreateDto {}
