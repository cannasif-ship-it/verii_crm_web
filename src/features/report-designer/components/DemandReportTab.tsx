import type { ReactElement } from 'react';
import { ReportTemplateTab } from './ReportTemplateTab';
import { DocumentRuleType } from '../types/report-template-types';

interface DemandReportTabProps {
  demandId: number;
}

export function DemandReportTab({ demandId }: DemandReportTabProps): ReactElement {
  return <ReportTemplateTab entityId={demandId} ruleType={DocumentRuleType.Demand} />;
}
