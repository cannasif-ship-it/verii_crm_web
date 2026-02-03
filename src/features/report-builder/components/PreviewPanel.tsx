import type { ReactElement } from 'react';
import { ReportChart } from './ReportChart';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  columns: string[];
  rows: unknown[][];
  chartType: 'table' | 'bar' | 'line' | 'pie';
  loading: boolean;
  error: string | null;
  empty: boolean;
  className?: string;
}

export function PreviewPanel({
  columns,
  rows,
  chartType,
  loading,
  error,
  empty,
  className,
}: PreviewPanelProps): ReactElement {
  return (
    <div className={cn('flex h-full flex-col rounded-lg border bg-card p-4', className)}>
      <h3 className="text-muted-foreground mb-2 text-sm font-medium">Preview</h3>
      {loading && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      )}
      {error && !loading && (
        <div className="text-destructive flex flex-1 items-center justify-center text-sm">
          {error}
        </div>
      )}
      {empty && !loading && !error && (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Önce Kontrol yapın
        </div>
      )}
      {!loading && !error && !empty && (
        <div className="flex-1 overflow-hidden">
          <ReportChart columns={columns} rows={rows} chartType={chartType} />
        </div>
      )}
    </div>
  );
}
