import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarClock, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  HelpCircle 
} from 'lucide-react';

interface ActivityStatusBadgeProps {
  status: string;
}

export function ActivityStatusBadge({
  status,
}: ActivityStatusBadgeProps): ReactElement {
  const { t } = useTranslation();

  // Metin Çeviri Mantığı (Mevcut yapı korundu)
  const getStatusText = (statusValue: string): string => {
    switch (statusValue) {
      case 'Scheduled':
        return t('activityManagement.statusScheduled', 'Planlandı');
      case 'In Progress':
        return t('activityManagement.statusInProgress', 'Devam Ediyor');
      case 'Completed':
        return t('activityManagement.statusCompleted', 'Tamamlandı');
      case 'Canceled':
        return t('activityManagement.statusCanceled', 'İptal Edildi');
      case 'Postponed':
        return t('activityManagement.statusPostponed', 'Ertelendi');
      default:
        return statusValue;
    }
  };

  // Tasarım Konfigürasyonu (Renkler ve İkonlar)
  const config = {
    Scheduled: {
      icon: CalendarClock,
      className: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/20",
    },
    'In Progress': {
      icon: Timer,
      className: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20",
    },
    Completed: {
      icon: CheckCircle2,
      className: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20",
    },
    Canceled: {
      icon: XCircle,
      className: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20",
    },
    Postponed: {
      icon: PauseCircle,
      className: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20",
    },
    // Bilinmeyen durumlar için varsayılan
    Default: {
      icon: HelpCircle,
      className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    }
  };

  // Eşleşen konfigürasyonu seç
  const currentConfig = config[status as keyof typeof config] || config.Default;
  const Icon = currentConfig.icon;

  return (
    <Badge 
      variant="outline" 
      className={`
        ${currentConfig.className} 
        font-medium px-2.5 py-0.5 text-xs rounded-md border transition-colors flex w-fit items-center gap-1.5 shadow-sm
      `}
    >
      <Icon size={12} strokeWidth={2.5} />
      {getStatusText(status)}
    </Badge>
  );
}