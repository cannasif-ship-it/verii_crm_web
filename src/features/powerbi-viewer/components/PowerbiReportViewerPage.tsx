import { type ReactElement, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePowerbiEmbedConfig } from '../hooks/usePowerbiViewer';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export function PowerbiReportViewerPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const reportId = id != null ? parseInt(id, 10) : null;
  const { data: embedConfig, isLoading, isError, error, refetch } = usePowerbiEmbedConfig(reportId ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<{ setAccessToken: (token: string) => Promise<void> } | null>(null);

  useEffect(() => {
    if (!embedConfig || !containerRef.current) return;
    const container = containerRef.current;
    let report: { setAccessToken: (token: string) => Promise<void>; off?: (event: string) => void } | null = null;
    let powerbiInstance: { reset: (el: HTMLElement) => void } | null = null;

    const initEmbed = async (): Promise<void> => {
      const raw = await import('powerbi-client');
      const mod = (raw && typeof (raw as { default?: unknown }).default === 'object' ? (raw as { default: typeof raw }).default : raw) as {
        service: { Service?: new (hpm: unknown, wpmp: unknown, router: unknown) => { embed: (el: HTMLElement, config: unknown) => unknown; reset: (el: HTMLElement) => void } } | (new (hpm: unknown, wpmp: unknown, router: unknown) => { embed: (el: HTMLElement, config: unknown) => unknown; reset: (el: HTMLElement) => void });
        factories: { hpmFactory: unknown; wpmpFactory: unknown; routerFactory: unknown };
      };
      const ServiceConstructor =
        typeof mod.service?.Service === 'function'
          ? mod.service.Service
          : typeof mod.service === 'function'
            ? mod.service
            : undefined;
      if (typeof ServiceConstructor !== 'function') throw new Error('Power BI Service not found');
      const powerbi = new ServiceConstructor(mod.factories.hpmFactory, mod.factories.wpmpFactory, mod.factories.routerFactory);
      powerbiInstance = powerbi;
      const config = {
        type: 'report',
        embedUrl: embedConfig.embedUrl,
        accessToken: embedConfig.accessToken,
        id: embedConfig.reportId,
      };
      const reportInstance = powerbi.embed(container, config) as {
        setAccessToken: (token: string) => Promise<void>;
        on?: (event: string, handler: () => void) => void;
        off?: (event: string) => void;
      };
      report = reportInstance;
      reportRef.current = report;

      if (reportInstance.on) {
        reportInstance.on('tokenExpired', async () => {
          const result = await refetch();
          const newToken = result.data?.accessToken;
          if (newToken && reportRef.current) {
            await reportRef.current.setAccessToken(newToken);
          }
        });
      }
    };

    void initEmbed();
    return () => {
      if (report?.off) report.off('tokenExpired');
      reportRef.current = null;
      try {
        if (powerbiInstance?.reset && container) powerbiInstance.reset(container);
        else if (container?.firstChild) container.innerHTML = '';
      } catch {
        if (container?.firstChild) container.innerHTML = '';
      }
    };
  }, [embedConfig?.embedUrl, embedConfig?.accessToken, embedConfig?.reportId, refetch]);

  if (reportId == null || Number.isNaN(reportId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t('powerbiViewer.invalidId', 'Geçersiz rapor')}</p>
        <Button asChild variant="outline">
          <Link to="/powerbi/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('powerbiViewer.backToList', 'Listeye Dön')}
          </Link>
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error?.message ?? t('powerbiViewer.loadError', 'Rapor yüklenemedi')}</p>
        <Button asChild variant="outline">
          <Link to="/powerbi/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('powerbiViewer.backToList', 'Listeye Dön')}
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !embedConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('powerbiViewer.loadingReport', 'Rapor yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/powerbi/reports">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('powerbiViewer.backToList', 'Listeye Dön')}
          </Link>
        </Button>
      </div>
      <div
        ref={containerRef}
        className="w-full border rounded-lg overflow-hidden bg-white"
        style={{ minHeight: 'calc(100vh - 12rem)' }}
      />
    </div>
  );
}
