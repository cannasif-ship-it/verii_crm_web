export type ReportSection = 'header' | 'content' | 'footer';

export interface ReportElement {
  id: string;
  type: 'text' | 'field' | 'image';
  section: ReportSection;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface TableColumn {
  label: string;
  path: string;
}

export interface TableElement extends ReportElement {
  type: 'table';
  columns: TableColumn[];
}

export type CanvasElement = ReportElement | TableElement;

export function isTableElement(el: CanvasElement): el is TableElement {
  return el.type === 'table';
}

export function isReportElement(el: CanvasElement): el is ReportElement {
  return el.type !== 'table';
}
