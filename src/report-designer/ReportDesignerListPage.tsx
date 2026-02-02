import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ReportDesignerListPage(): ReactElement {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Report Designer
        </h1>
        <Button asChild>
          <Link to="/report-designer/create" className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            Yeni Oluştur
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rapor şablonları listesi burada görüntülenecek.
        </p>
      </div>
    </div>
  );
}
