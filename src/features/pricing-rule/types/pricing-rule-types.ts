export const PricingRuleType = {
  Demand: 1,
  Quotation: 2,
  Order: 3,
} as const;

export type PricingRuleType = (typeof PricingRuleType)[keyof typeof PricingRuleType];

export interface PricingRuleHeaderGetDto {
  id: number;
  ruleType: PricingRuleType;
  ruleCode: string;
  ruleName: string;
  validFrom: string;
  validTo: string;
  customerId?: number | null;
  customerName?: string | null;
  erpCustomerCode?: string | null;
  branchCode?: number | null;
  priceIncludesVat: boolean;
  isActive: boolean;
  lines?: PricingRuleLineGetDto[] | null;
  salesmen?: PricingRuleSalesmanGetDto[] | null;
  createdAt: string;
  updatedAt?: string | null;
  createdByFullUser?: string | null;
  updatedByFullUser?: string | null;
}

export interface PricingRuleHeaderCreateDto {
  ruleType: PricingRuleType;
  ruleCode: string;
  ruleName: string;
  validFrom: string;
  validTo: string;
  customerId?: number | null;
  erpCustomerCode?: string | null;
  branchCode?: number | null;
  priceIncludesVat: boolean;
  isActive: boolean;
  lines?: PricingRuleLineCreateDto[] | null;
  salesmen?: PricingRuleSalesmanCreateDto[] | null;
}

export interface PricingRuleHeaderUpdateDto {
  ruleType: PricingRuleType;
  ruleCode: string;
  ruleName: string;
  validFrom: string;
  validTo: string;
  customerId?: number | null;
  erpCustomerCode?: string | null;
  branchCode?: number | null;
  priceIncludesVat: boolean;
  isActive: boolean;
  lines?: PricingRuleLineUpdateDto[] | null;
  salesmen?: PricingRuleSalesmanUpdateDto[] | null;
}

export interface PricingRuleLineGetDto {
  id: number;
  pricingRuleHeaderId: number;
  stokCode: string;
  minQuantity: number;
  maxQuantity?: number | null;
  fixedUnitPrice?: number | null;
  currencyCode: string;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PricingRuleLineCreateDto {
  pricingRuleHeaderId: number;
  stokCode: string;
  minQuantity: number;
  maxQuantity?: number | null;
  fixedUnitPrice?: number | null;
  currencyCode?: string;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
}

export interface PricingRuleLineUpdateDto {
  pricingRuleHeaderId: number;
  stokCode: string;
  minQuantity: number;
  maxQuantity?: number | null;
  fixedUnitPrice?: number | null;
  currencyCode?: string;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
}

export interface PricingRuleSalesmanGetDto {
  id: number;
  pricingRuleHeaderId: number;
  salesmanId: number;
  salesmanFullName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PricingRuleSalesmanCreateDto {
  pricingRuleHeaderId: number;
  salesmanId: number;
}

export interface PricingRuleSalesmanUpdateDto {
  pricingRuleHeaderId: number;
  salesmanId: number;
}

export interface PricingRuleLineFormState extends Omit<PricingRuleLineCreateDto, 'pricingRuleHeaderId'> {
  id: string;
  isEditing: boolean;
}

export interface PricingRuleSalesmanFormState extends Omit<PricingRuleSalesmanCreateDto, 'pricingRuleHeaderId'> {
  id: string;
}

export interface PricingRuleFormState {
  header: PricingRuleHeaderCreateDto;
  lines: PricingRuleLineFormState[];
  salesmen: PricingRuleSalesmanFormState[];
  isSubmitting: boolean;
  errors: Record<string, string[]>;
}

export interface PricingRuleFilter {
  ruleType?: PricingRuleType;
  customerId?: number;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  search?: string;
}
