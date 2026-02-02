import type { ReactElement } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useReportTemplateList } from '../hooks/useReportTemplateList';
import { useGenerateReportPdf } from '../hooks/useGenerateReportPdf';
import { DocumentRuleType } from '../types/report-template-types';
import type { ReportTemplateGetDto } from '../types/report-template-types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileDown, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';

function downloadBlobAsPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printBlobPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) {
    w.onload = () => {
      w.print();
      w.onafterprint = () => w.close();
    };
  } else {
    URL.revokeObjectURL(url);
    toast.error('Yazdırma penceresi açılamadı. Açılır pencereleri etkinleştirin.');
  }
}

const RULE_TYPE_EMPTY_LABELS: Record<DocumentRuleType, string> = {
  [DocumentRuleType.Demand]: 'Talep şablonu bulunamadı',
  [DocumentRuleType.Quotation]: 'Teklif şablonu bulunamadı',
  [DocumentRuleType.Order]: 'Sipariş şablonu bulunamadı',
};

const RULE_TYPE_FILE_PREFIX: Record<DocumentRuleType, string> = {
  [DocumentRuleType.Demand]: 'talep',
  [DocumentRuleType.Quotation]: 'teklif',
  [DocumentRuleType.Order]: 'siparis',
};

interface ReportTemplateTabProps {
  entityId: number;
  ruleType: DocumentRuleType;
}

export function ReportTemplateTab({ entityId, ruleType }: ReportTemplateTabProps): ReactElement {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const pdfBlobUrlRef = useRef<string | null>(null);
  pdfBlobUrlRef.current = pdfBlobUrl;

  const { data: templates = [], isLoading: isLoadingTemplates } = useReportTemplateList();
  const generatePdfMutation = useGenerateReportPdf();

  const filteredTemplates: ReportTemplateGetDto[] = templates.filter(
    (t) => Number(t.ruleType) === ruleType
  );

  useEffect(() => {
    if (!selectedTemplateId) {
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const templateId = parseInt(selectedTemplateId, 10);
    if (Number.isNaN(templateId) || templateId < 1) return;

    let cancelled = false;
    generatePdfMutation.mutate(
      { templateId, entityId },
      {
        onSuccess: (blob) => {
          if (cancelled) {
            URL.revokeObjectURL(URL.createObjectURL(blob));
            return;
          }
          setPdfBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        },
        onError: (err: Error) => {
          if (!cancelled) {
            toast.error('PDF oluşturulamadı', {
              description: err?.message,
            });
          }
        },
      }
    );
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId, entityId]);

  useEffect(() => {
    return () => {
      const url = pdfBlobUrlRef.current;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const selectedTemplate = filteredTemplates.find(
    (t) => String(t.id) === selectedTemplateId
  );
  const isGenerating =
    Boolean(selectedTemplateId) && (generatePdfMutation.isPending || !pdfBlobUrl);
  const filePrefix = RULE_TYPE_FILE_PREFIX[ruleType];
  const emptyLabel = RULE_TYPE_EMPTY_LABELS[ruleType];

  const handleDownload = (): void => {
    if (!pdfBlobUrl || !selectedTemplate) return;
    fetch(pdfBlobUrl)
      .then((r) => r.blob())
      .then((blob) =>
        downloadBlobAsPdf(blob, `${filePrefix}-${selectedTemplate.title}-${entityId}.pdf`)
      );
    toast.success('İndiriliyor');
  };

  const handlePrint = (): void => {
    if (!pdfBlobUrl) return;
    fetch(pdfBlobUrl)
      .then((r) => r.blob())
      .then(printBlobPdf);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
        <div className="grid w-full max-w-md gap-2">
          <Label htmlFor="report-template">Rapor şablonu</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
            disabled={isLoadingTemplates}
          >
            <SelectTrigger id="report-template" className="w-full">
              <SelectValue placeholder="Şablon seçin" />
            </SelectTrigger>
            <SelectContent>
              {filteredTemplates.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  {isLoadingTemplates ? 'Yükleniyor…' : emptyLabel}
                </SelectItem>
              ) : (
                filteredTemplates.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTemplateId && selectedTemplateId !== '__none__' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30 overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="size-10 animate-spin text-slate-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rapor oluşturuluyor…
              </p>
            </div>
          ) : pdfBlobUrl ? (
            <>
              <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <FileDown className="size-4" />
                  İndir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-2"
                >
                  <Printer className="size-4" />
                  Yazdır
                </Button>
              </div>
              <div className="min-h-[480px] bg-slate-200 dark:bg-slate-800">
                <iframe
                  title="Rapor önizleme"
                  src={pdfBlobUrl}
                  className="w-full h-[calc(100vh-280px)] min-h-[480px] border-0"
                />
              </div>
            </>
          ) : null}
        </div>
      )}

      {selectedTemplateId && !selectedTemplateId.startsWith('__') && !isGenerating && !pdfBlobUrl && generatePdfMutation.isError && (
        <p className="text-sm text-destructive">
          PDF yüklenemedi. Şablonu tekrar seçin veya sayfayı yenileyin.
        </p>
      )}
    </div>
  );
}
