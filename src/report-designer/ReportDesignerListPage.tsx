import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { useReportTemplateList } from './hooks/useReportTemplateList';
import { useDeleteReportTemplate } from './hooks/useDeleteReportTemplate';
import { useGenerateReportPdf } from './hooks/useGenerateReportPdf';
import type { ReportTemplateGetDto } from './types/report-template-types';
import { DocumentRuleType } from './types/report-template-types';

const RULE_TYPE_LABELS: Record<DocumentRuleType, string> = {
  [DocumentRuleType.Demand]: 'Talep',
  [DocumentRuleType.Quotation]: 'Teklif',
  [DocumentRuleType.Order]: 'Sipariş',
};

function downloadBlobAsPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportDesignerListPage(): ReactElement {
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useReportTemplateList();
  const deleteMutation = useDeleteReportTemplate();
  const generatePdfMutation = useGenerateReportPdf();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ReportTemplateGetDto | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfTemplate, setPdfTemplate] = useState<ReportTemplateGetDto | null>(null);
  const [entityId, setEntityId] = useState('');

  const handleDeleteClick = (template: ReportTemplateGetDto): void => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!templateToDelete) return;
    try {
      await deleteMutation.mutateAsync(templateToDelete.id);
      toast.success('Şablon silindi');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      toast.error('Şablon silinemedi', {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleCopyClick = (template: ReportTemplateGetDto): void => {
    navigate('/report-designer/create', { state: { copyFrom: template } });
  };

  const handlePdfClick = (template: ReportTemplateGetDto): void => {
    setPdfTemplate(template);
    setEntityId('');
    setPdfDialogOpen(true);
  };

  const handlePdfGenerate = async (): Promise<void> => {
    if (!pdfTemplate) return;
    const id = Number(entityId);
    if (!Number.isInteger(id) || id < 1) {
      toast.error('Geçerli bir belge ID girin');
      return;
    }
    try {
      const blob = await generatePdfMutation.mutateAsync({
        templateId: pdfTemplate.id,
        entityId: id,
      });
      downloadBlobAsPdf(blob, `rapor-${pdfTemplate.title}-${id}.pdf`);
      toast.success('PDF oluşturuldu');
      setPdfDialogOpen(false);
      setPdfTemplate(null);
      setEntityId('');
    } catch (err) {
      toast.error('PDF oluşturulamadı', {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Rapor Şablonları
        </h1>
        <Button asChild>
          <Link to="/report-designer/create" className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            Yeni Oluştur
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Yükleniyor…
          </div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Henüz şablon yok. Yeni Oluştur ile ekleyebilirsiniz.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Belge tipi</TableHead>
                <TableHead className="w-[80px]">Aktif</TableHead>
                <TableHead className="w-[100px] text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-slate-500">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell>{RULE_TYPE_LABELS[t.ruleType] ?? t.ruleType}</TableCell>
                  <TableCell>{t.isActive ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/report-designer/edit/${t.id}`} className="flex items-center gap-2">
                            <Pencil className="size-4" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyClick(t)}>
                          <Copy className="size-4" />
                          Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePdfClick(t)}>
                          <FileDown className="size-4" />
                          PDF oluştur
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(t)}
                        >
                          <Trash2 className="size-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şablonu sil</DialogTitle>
            <DialogDescription>
              “{templateToDelete?.title}” şablonunu silmek istediğinize emin misiniz? Bu işlem
              geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PDF oluştur</DialogTitle>
            <DialogDescription>
              Şablon: {pdfTemplate?.title}. Belge ID (Teklif / Sipariş / Talep ID) girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="entityId">Belge ID</Label>
              <Input
                id="entityId"
                type="number"
                min={1}
                placeholder="Örn. 123"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handlePdfGenerate}
              disabled={generatePdfMutation.isPending || !entityId.trim()}
            >
              {generatePdfMutation.isPending ? 'Oluşturuluyor…' : 'PDF oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
