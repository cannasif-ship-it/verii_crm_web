import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface ActivityStatusBadgeProps {
  status: string;
}

export function ActivityStatusBadge({
  status,
}: ActivityStatusBadgeProps): ReactElement {
  const { t } = useTranslation();

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

  const getStatusColor = (statusValue: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (statusValue) {
      case 'Scheduled':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
        return 'default';
      case 'Canceled':
        return 'destructive';
      case 'Postponed':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
}
