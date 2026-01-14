import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface ActivityPriorityBadgeProps {
  priority?: string;
}

export function ActivityPriorityBadge({
  priority,
}: ActivityPriorityBadgeProps): ReactElement {
  const { t } = useTranslation();

  if (!priority) {
    return <span className="text-muted-foreground">-</span>;
  }

  const getPriorityText = (priorityValue: string): string => {
    switch (priorityValue) {
      case 'Low':
        return t('activityManagement.priorityLow', 'Düşük');
      case 'Medium':
        return t('activityManagement.priorityMedium', 'Orta');
      case 'High':
        return t('activityManagement.priorityHigh', 'Yüksek');
      default:
        return priorityValue;
    }
  };

  const getPriorityColor = (priorityValue: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (priorityValue) {
      case 'Low':
        return 'outline';
      case 'Medium':
        return 'secondary';
      case 'High':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getPriorityColor(priority)}>
      {getPriorityText(priority)}
    </Badge>
  );
}
