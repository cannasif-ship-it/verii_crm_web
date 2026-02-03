import type { ReactElement } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useReportStore } from '../store/useReportStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { isTableElement } from '../models/report-element';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FONT_FAMILIES, FONT_SIZES } from '../constants';

export type FieldPaletteType = 'text' | 'field' | 'table' | 'table-column' | 'image';

export interface FieldPaletteItem {
  label: string;
  path: string;
  type: FieldPaletteType;
  value?: string;
}

export interface SidebarDragData {
  type: FieldPaletteType;
  path: string;
  label: string;
  value?: string;
}

export interface SidebarProps {
  headerFields?: FieldPaletteItem[];
  lineFields?: FieldPaletteItem[];
  exchangeRateFields?: FieldPaletteItem[];
}

const TEXT_ITEM: FieldPaletteItem = {
  label: 'Text',
  path: '',
  type: 'text',
};

const FIELDS: FieldPaletteItem[] = [
  { label: 'Company Name', path: 'CompanyName', type: 'field' },
  { label: 'Customer Name', path: 'CustomerName', type: 'field' },
  { label: 'Offer Date', path: 'OfferDate', type: 'field' },
];

const TABLE_COLUMNS: FieldPaletteItem[] = [
  { label: 'Product Name', path: 'Lines.ProductName', type: 'table-column' },
  { label: 'Quantity', path: 'Lines.Quantity', type: 'table-column' },
  { label: 'Price', path: 'Lines.Price', type: 'table-column' },
];

const ADD_TABLE_ITEM: FieldPaletteItem = {
  label: 'Add Table',
  path: '',
  type: 'table',
};

const LOGO_IMAGE_ITEM: FieldPaletteItem = {
  label: 'Logo Image',
  path: '',
  type: 'image',
  value: 'Logo',
};

function DraggablePaletteItem({
  field,
  id,
}: {
  field: FieldPaletteItem;
  id: string;
}): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type: field.type,
      path: field.path,
      label: field.label,
      ...(field.value != null && { value: field.value }),
    } satisfies SidebarDragData,
  });

  const style: React.CSSProperties | undefined = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm active:cursor-grabbing data-[dragging=true]:opacity-50"
      data-dragging={isDragging ?? undefined}
    >
      {field.label}
    </div>
  );
}

function Section({
  title,
  items,
  idPrefix,
}: {
  title: string;
  items: FieldPaletteItem[];
  idPrefix: string;
}): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </span>
      <div className="flex flex-col gap-1.5">
        {items.map((field, index) => (
          <DraggablePaletteItem
            key={`${idPrefix}-${field.path || field.type}-${index}`}
            field={field}
            id={`${idPrefix}-${field.path || field.type}-${index}`}
          />
        ))}
      </div>
    </div>
  );
}

function TextPropertiesPanel(): ReactElement | null {
  const elements = useReportStore((s) => s.elements);
  const selectedElementId = useReportStore((s) => s.selectedElementId);
  const updateReportElement = useReportStore((s) => s.updateReportElement);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (
    !selectedElement ||
    isTableElement(selectedElement) ||
    selectedElement.type !== 'text'
  ) {
    return null;
  }

  const fontSize = selectedElement.fontSize ?? 14;
  const fontFamily = selectedElement.fontFamily ?? 'Arial';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Metin Özellikleri
      </span>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Metin</Label>
        <Input
          value={selectedElement.text ?? ''}
          onChange={(e) => updateReportElement(selectedElement.id, { text: e.target.value })}
          className="min-h-[60px] text-sm"
          placeholder="Metin girin..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Yazı boyutu</Label>
        <Select
          value={String(fontSize)}
          onValueChange={(v) =>
            updateReportElement(selectedElement.id, { fontSize: Number(v) })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Yazı tipi</Label>
        <Select
          value={fontFamily}
          onValueChange={(v) =>
            updateReportElement(selectedElement.id, { fontFamily: v })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Renk</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedElement.color ?? '#374151'}
            onChange={(e) =>
              updateReportElement(selectedElement.id, { color: e.target.value })
            }
            className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
          />
          <Input
            value={selectedElement.color ?? ''}
            onChange={(e) =>
              updateReportElement(selectedElement.id, { color: e.target.value || undefined })
            }
            className="h-8 flex-1 text-xs"
            placeholder="#374151"
          />
        </div>
      </div>
    </div>
  );
}

function FieldPropertiesPanel(): ReactElement | null {
  const elements = useReportStore((s) => s.elements);
  const selectedElementId = useReportStore((s) => s.selectedElementId);
  const updateReportElement = useReportStore((s) => s.updateReportElement);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (
    !selectedElement ||
    isTableElement(selectedElement) ||
    selectedElement.type !== 'field'
  ) {
    return null;
  }

  const fontSize = selectedElement.fontSize ?? 14;
  const fontFamily = selectedElement.fontFamily ?? 'Arial';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Alan Özellikleri
      </span>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Değer / Etiket</Label>
        <Input
          value={selectedElement.value ?? ''}
          readOnly
          className="text-sm bg-slate-50 dark:bg-slate-800"
          placeholder="Palette'ten sürüklenen alan"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Yazı boyutu</Label>
        <Select
          value={String(fontSize)}
          onValueChange={(v) =>
            updateReportElement(selectedElement.id, { fontSize: Number(v) })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Yazı tipi</Label>
        <Select
          value={fontFamily}
          onValueChange={(v) =>
            updateReportElement(selectedElement.id, { fontFamily: v })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Renk</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedElement.color ?? '#374151'}
            onChange={(e) =>
              updateReportElement(selectedElement.id, { color: e.target.value })
            }
            className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
          />
          <Input
            value={selectedElement.color ?? ''}
            onChange={(e) =>
              updateReportElement(selectedElement.id, { color: e.target.value || undefined })
            }
            className="h-8 flex-1 text-xs"
            placeholder="#374151"
          />
        </div>
      </div>
    </div>
  );
}

const REPORT_IMAGE_INPUT_ID = 'report-designer-image-upload';
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function ImagePropertiesPanel(): ReactElement | null {
  const elements = useReportStore((s) => s.elements);
  const selectedElementId = useReportStore((s) => s.selectedElementId);
  const updateReportElement = useReportStore((s) => s.updateReportElement);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (
    !selectedElement ||
    isTableElement(selectedElement) ||
    selectedElement.type !== 'image'
  ) {
    return null;
  }

  const isUrl =
    typeof selectedElement.value === 'string' &&
    (selectedElement.value.startsWith('http') ||
      selectedElement.value.startsWith('/') ||
      selectedElement.value.startsWith('data:'));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Resim en fazla 2 MB olabilir.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string')
        updateReportElement(selectedElement.id, { value: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Resim Özellikleri
      </span>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Resim URL</Label>
        <Input
          value={selectedElement.value ?? ''}
          onChange={(e) => updateReportElement(selectedElement.id, { value: e.target.value })}
          className="text-sm"
          placeholder="https://... veya /logo.png"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Dosyadan yükle</Label>
        <input
          id={REPORT_IMAGE_INPUT_ID}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
        <Label
          htmlFor={REPORT_IMAGE_INPUT_ID}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Upload className="size-3.5" />
          Resim seç (max 2 MB)
        </Label>
      </div>
      {isUrl && (
        <div className="rounded border border-slate-200 bg-slate-50 p-2">
          <span className="text-xs text-slate-500">Önizleme</span>
          <img
            src={selectedElement.value}
            alt=""
            className="mt-1 max-h-20 w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export function Sidebar({ headerFields, lineFields, exchangeRateFields }: SidebarProps = {}): ReactElement {
  const fieldsItems = headerFields ?? FIELDS;
  const tableColumnsItems = lineFields ?? TABLE_COLUMNS;
  const exchangeRateColumnsItems = exchangeRateFields ?? [];
  return (
    <div className="flex w-64 flex-col gap-6 border-r border-slate-200 bg-slate-50 p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Field Palette
      </span>
      <Section title="Text" items={[TEXT_ITEM]} idPrefix="palette-text" />
      <Section title="Fields" items={fieldsItems} idPrefix="palette-fields" />
      <Section title="Table Columns" items={tableColumnsItems} idPrefix="palette-table-columns" />
      {exchangeRateColumnsItems.length > 0 && (
        <Section title="Döviz kurları" items={exchangeRateColumnsItems} idPrefix="palette-exchange-rates" />
      )}
      <Section title="Add Table" items={[ADD_TABLE_ITEM]} idPrefix="palette-add-table" />
      <Section title="Images" items={[LOGO_IMAGE_ITEM]} idPrefix="palette-images" />
      <TextPropertiesPanel />
      <FieldPropertiesPanel />
      <ImagePropertiesPanel />
    </div>
  );
}
