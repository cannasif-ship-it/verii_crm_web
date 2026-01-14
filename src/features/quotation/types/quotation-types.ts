export const ApprovalLevel = {
  SalesManager: 1,
  RegionalManager: 2,
  Finance: 3,
  GeneralManager: 4,
} as const;

export type ApprovalLevel = typeof ApprovalLevel[keyof typeof ApprovalLevel];

export const ApprovalStatus = {
  NotRequired: 0,
  Waiting: 1,
  Approved: 2,
  Rejected: 3,
} as const;

export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export const OfferType = {
  Domestic: 'Domestic',
  Export: 'Export',
} as const;

export type OfferType = typeof OfferType[keyof typeof OfferType];

export interface QuotationBulkCreateDto {
  quotation: CreateQuotationDto;
  lines: CreateQuotationLineDto[];
  exchangeRates?: QuotationExchangeRateCreateDto[];
}

export interface CreateQuotationDto {
  potentialCustomerId?: number | null;
  erpCustomerCode?: string | null;
  deliveryDate?: string | null;
  shippingAddressId?: number | null;
  representativeId?: number | null;
  status?: number | null;
  description?: string | null;
  paymentTypeId?: number | null;
  offerType: string;
  offerDate?: string | null;
  offerNo?: string | null;
  revisionNo?: string | null;
  revisionId?: number | null;
  currency: string;
}

export interface CreateQuotationLineDto {
  quotationId: number;
  productId?: number | null;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
}

export interface UpdateQuotationLineDto {
  productId: number;
  productCode?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
}

export interface QuotationLineGetDto {
  id: number;
  quotationId: number;
  productId?: number | null;
  productCode?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description?: string | null;
  pricingRuleHeaderId?: number | null;
  relatedStockId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface QuotationExchangeRateCreateDto {
  quotationId: number;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial?: boolean;
}

export interface QuotationGetDto {
  id: number;
  potentialCustomerId?: number | null;
  potentialCustomerName?: string | null;
  erpCustomerCode?: string | null;
  deliveryDate?: string | null;
  shippingAddressId?: number | null;
  shippingAddressText?: string | null;
  representativeId?: number | null;
  representativeName?: string | null;
  status?: number | null;
  description?: string | null;
  paymentTypeId?: number | null;
  paymentTypeName?: string | null;
  offerType: string;
  offerDate?: string | null;
  offerNo?: string | null;
  revisionNo?: string | null;
  revisionId?: number | null;
  currency: string;
  total: number;
  grandTotal: number;
  hasCustomerSpecificDiscount: boolean;
  validUntil?: string | null;
  contactId?: number | null;
  activityId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface QuotationLineFormState extends Omit<CreateQuotationLineDto, 'quotationId'> {
  id: string;
  isEditing: boolean;
}

export interface QuotationExchangeRateFormState {
  id: string;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  isOfficial?: boolean;
  dovizTipi?: number;
}

export interface Customer {
  id: number;
  name: string;
  customerCode?: string | null;
  erpCode?: string | null;
}

export interface ShippingAddress {
  id: number;
  addressText: string;
  customerId: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface PaymentType {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  unitPrice?: number;
  vatRate?: number;
}

export interface PriceOfProductRequestDto {
  productCode: string;
  groupCode: string;
}

export interface PriceOfProductDto {
  productCode: string;
  groupCode: string;
  currency: string;
  listPrice: number;
  costPrice: number;
  discount1?: number | null;
  discount2?: number | null;
  discount3?: number | null;
}