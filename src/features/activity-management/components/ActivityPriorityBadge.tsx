import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowRight, ArrowUp, Minus } from 'lucide-react';

interface ActivityPriorityBadgeProps {
  priority?: string;
}

export function ActivityPriorityBadge({
  priority,
}: ActivityPriorityBadgeProps): ReactElement {
  const { t } = useTranslation();

  if (!priority) {
    return (
      <span className="text-muted-foreground text-xs flex items-center gap-1">
        <Minus size={12} />
        -
      </span>
    );
  }

  // Tasarım Konfigürasyonu
  const config = {
    Low: {
      label: t('activityManagement.priorityLow', 'Düşük'),
      icon: ArrowDown,
      className: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20",
    },
    Medium: {
      label: t('activityManagement.priorityMedium', 'Orta'),
      icon: ArrowRight,
      className: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20",
    },
    High: {
      label: t('activityManagement.priorityHigh', 'Yüksek'),
      icon: ArrowUp,
      className: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20",
    },
    // Bilinmeyen durumlar için varsayılan
    Default: {
      label: priority,
      icon: Minus,
      className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    }
  };

  // Eşleşen konfigürasyonu veya varsayılanı seç
  const currentConfig = config[priority as keyof typeof config] || config.Default;
  const Icon = currentConfig.icon;

  return (
    <Badge 
      variant="outline" // Temel stili outline alıp üzerine kendi classlarımızı ekliyoruz
      className={`
        ${currentConfig.className} 
        font-medium px-2 py-0.5 text-xs rounded-md border transition-colors flex w-fit items-center gap-1.5 shadow-sm
      `}
    >
      <Icon size={12} strokeWidth={2.5} />
      {currentConfig.label}
    </Badge>
  );
}