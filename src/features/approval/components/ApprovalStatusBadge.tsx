import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { ApprovalStatus } from '../types/approval-types';
import { ApprovalStatus as ApprovalStatusEnum } from '../types/approval-types';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps): ReactElement {
  const { t } = useTranslation();

  const statusConfig = {
    [ApprovalStatusEnum.NotRequired]: {
      label: t('approval.status.notRequired', 'Gerekli Değil'),
      variant: 'secondary' as const,
      className: undefined,
    },
    [ApprovalStatusEnum.Waiting]: {
      label: t('approval.status.waiting', 'Bekliyor'),
      variant: 'default' as const,
      className: undefined,
    },
    [ApprovalStatusEnum.Approved]: {
      label: t('approval.status.approved', 'Onaylandı'),
      variant: 'default' as const,
      className: 'bg-green-600 hover:bg-green-700',
    },
    [ApprovalStatusEnum.Rejected]: {
      label: t('approval.status.rejected', 'Reddedildi'),
      variant: 'destructive' as const,
      className: undefined,
    },
  };

  const config = statusConfig[status] || statusConfig[ApprovalStatusEnum.Waiting];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
