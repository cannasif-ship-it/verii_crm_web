import type { CanvasElement, ReportElement, TableElement } from '../models/report-element';
import type { ReportTemplateElementDto } from '../types/report-template-types';
import type { ReportSection } from '../models/report-element';

function toSection(s: string): ReportSection {
  if (s === 'header' || s === 'content' || s === 'footer') return s;
  return 'content';
}

export function dtoElementsToCanvasElements(
  dtoElements: ReportTemplateElementDto[]
): CanvasElement[] {
  return dtoElements.map((dto): CanvasElement => {
    const base = {
      id: dto.id,
      section: toSection(dto.section),
      x: dto.x,
      y: dto.y,
      width: dto.width,
      height: dto.height,
      value: dto.value,
      text: dto.text,
      path: dto.path,
      fontSize: dto.fontSize,
      fontFamily: dto.fontFamily,
      color: dto.color,
    };
    if (dto.type === 'table' && Array.isArray(dto.columns)) {
      const table: TableElement = {
        ...base,
        type: 'table',
        columns: dto.columns.map((c) => ({ label: c.label, path: c.path })),
      };
      return table;
    }
    const type = (dto.type === 'text' || dto.type === 'field' || dto.type === 'image')
      ? dto.type
      : 'text';
    const el: ReportElement = { ...base, type };
    return el;
  });
}
