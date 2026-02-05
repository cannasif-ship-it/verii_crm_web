import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePowerbiReportSyncMutation } from '../hooks/usePowerbiSync';
import type { PowerBIReportSyncResultDto } from '../types/powerbiSync.types';

export function PowerbiReportSyncCard(): ReactElement {
  const { t } = useTranslation();
  const [workspaceId, setWorkspaceId] = useState('');
  const [lastResult, setLastResult] = useState<PowerBIReportSyncResultDto | null>(null);
  const mutation = usePowerbiReportSyncMutation();

  const handleSync = (): void => {
    setLastResult(null);
    mutation.mutate(workspaceId.trim() || undefined, {
      onSuccess: (data) => {
        setLastResult(data);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('powerbiSync.title', 'PowerBI Rapor Senkronizasyonu')}</CardTitle>
        <CardDescription>{t('powerbiSync.description', "Workspace'ten raporları çekip CRM veritabanına işler.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="powerbi-sync-workspace">{t('powerbiSync.workspaceId', 'Workspace ID')}</Label>
          <Input
            id="powerbi-sync-workspace"
            placeholder={t('powerbiSync.workspaceIdPlaceholder', 'Workspace GUID (opsiyonel)')}
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          />
        </div>
        <Button onClick={handleSync} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">{t('powerbiSync.sync', 'Senkronize Et')}</span>
        </Button>
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message ?? t('powerbiSync.error', 'Senkronizasyon başarısız')}</p>
        )}
        {lastResult && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold">{lastResult.totalRemote}</p>
              <p className="text-xs text-muted-foreground">{t('powerbiSync.totalRemote', 'Uzak Toplam')}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-green-600">{lastResult.created}</p>
              <p className="text-xs text-muted-foreground">{t('powerbiSync.created', 'Oluşturulan')}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-blue-600">{lastResult.updated}</p>
              <p className="text-xs text-muted-foreground">{t('powerbiSync.updated', 'Güncellenen')}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-amber-600">{lastResult.reactivated}</p>
              <p className="text-xs text-muted-foreground">{t('powerbiSync.reactivated', 'Yeniden Aktif')}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-red-600">{lastResult.deleted}</p>
              <p className="text-xs text-muted-foreground">{t('powerbiSync.deleted', 'Silinen')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
