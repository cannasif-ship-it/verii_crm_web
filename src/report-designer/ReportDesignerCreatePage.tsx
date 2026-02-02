import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import {
  reportDesignerCreateSchema,
  type ReportDesignerCreateFormValues,
} from './schemas/report-designer-create-schema';
import {
  A4Canvas,
  getSectionFromDroppableId,
  parseTableIdFromDroppableId,
} from './components/A4Canvas';
import { Sidebar, type SidebarDragData } from './components/Sidebar';
import type { ReportElement, TableElement } from './models/report-element';
import { useReportStore } from './store/useReportStore';

const RULE_TYPE_OPTIONS: { value: PricingRuleType; label: string }[] = [
  { value: PricingRuleType.Demand, label: 'Talep' },
  { value: PricingRuleType.Quotation, label: 'Teklif' },
  { value: PricingRuleType.Order, label: 'Sipariş' },
];

const DEFAULT_ELEMENT_WIDTH = 200;
const DEFAULT_ELEMENT_HEIGHT = 50;

function isSidebarDragData(data: unknown): data is SidebarDragData {
  const d = data as SidebarDragData | null;
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.type === 'string' &&
    typeof d.path === 'string' &&
    typeof d.label === 'string'
  );
}

export function ReportDesignerCreatePage(): ReactElement {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const addElement = useReportStore((s) => s.addElement);
  const addColumnToTable = useReportStore((s) => s.addColumnToTable);

  const form = useForm<ReportDesignerCreateFormValues>({
    resolver: zodResolver(reportDesignerCreateSchema),
    defaultValues: {
      ruleType: PricingRuleType.Demand,
      title: '',
    },
  });

  const onSubmit = (values: ReportDesignerCreateFormValues): void => {
    toast.success('Kaydedildi', {
      description: `Belge tipi: ${RULE_TYPE_OPTIONS.find((o) => o.value === values.ruleType)?.label}, Başlık: ${values.title}`,
    });
    navigate('/report-designer');
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    const data = active.data.current;
    if (!isSidebarDragData(data)) return;

    const tableId = over?.id != null ? parseTableIdFromDroppableId(String(over.id)) : null;

    if (tableId != null) {
      if (data.type !== 'table-column') return;
      addColumnToTable(tableId, { label: data.label, path: data.path });
      return;
    }

    const overId = over?.id != null ? String(over.id) : null;
    const section = overId != null ? getSectionFromDroppableId(overId) : null;

    if (section == null || !canvasRef.current) return;
    if (data.type === 'table-column') return;

    if (data.type === 'table' && section !== 'content') return;
    if (data.type === 'image' && section === 'content') return;

    const translated = active.rect.current.translated;
    if (!translated) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(translated.left - canvasRect.left);
    const y = Math.round(translated.top - canvasRect.top);

    if (data.type === 'text') {
      const newElement: ReportElement = {
        id: crypto.randomUUID(),
        type: 'text',
        section,
        x,
        y,
        width: 200,
        height: 60,
        text: 'Double click to edit',
        fontSize: 14,
        fontFamily: 'Arial',
      };
      addElement(newElement);
      return;
    }

    if (data.type === 'field') {
      const newElement: ReportElement = {
        id: crypto.randomUUID(),
        type: 'field',
        section,
        x,
        y,
        width: DEFAULT_ELEMENT_WIDTH,
        height: DEFAULT_ELEMENT_HEIGHT,
        value: data.label,
      };
      addElement(newElement);
      return;
    }

    if (data.type === 'table') {
      const newTable: TableElement = {
        id: crypto.randomUUID(),
        type: 'table',
        section,
        x,
        y,
        width: DEFAULT_ELEMENT_WIDTH,
        height: DEFAULT_ELEMENT_HEIGHT,
        columns: [],
      };
      addElement(newTable);
      return;
    }

    if (data.type === 'image') {
      const newElement: ReportElement = {
        id: crypto.randomUUID(),
        type: 'image',
        section,
        x,
        y,
        width: 120,
        height: 80,
        value: data.value ?? data.label ?? '',
      };
      addElement(newElement);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900/50">
        <h1 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Yeni Rapor Şablonu
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-wrap items-end gap-4"
          >
            <FormField
              control={form.control}
              name="ruleType"
              render={({ field }) => (
                <FormItem className="w-48">
                  <FormLabel>Belge tipi</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value) as PricingRuleType)}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RULE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="min-w-[200px] flex-1">
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input placeholder="Rapor başlığını girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Kaydet</Button>
          </form>
        </Form>
      </div>
      <div className="flex-1 min-h-[600px] overflow-hidden">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex h-full w-full">
            <Sidebar />
            <A4Canvas canvasRef={canvasRef} />
          </div>
        </DndContext>
      </div>
    </div>
  );
}
