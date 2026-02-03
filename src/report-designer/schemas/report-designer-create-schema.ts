import { z } from 'zod';
import { PricingRuleType } from '@/features/pricing-rule/types/pricing-rule-types';

export const reportDesignerCreateSchema = z.object({
  ruleType: z.nativeEnum(PricingRuleType, {
    message: 'Belge tipi seçin',
  }),
  title: z.string().min(1, 'Başlık gerekli'),
  default: z.boolean().optional().default(false),
});

export type ReportDesignerCreateFormValues = z.infer<typeof reportDesignerCreateSchema>;
