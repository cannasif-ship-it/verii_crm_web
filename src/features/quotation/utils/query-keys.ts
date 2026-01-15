export const QUOTATION_QUERY_KEYS = {
  QUOTATIONS: 'quotation.quotations',
  QUOTATION: 'quotation.quotation',
  CUSTOMERS: 'quotation.customers',
  SHIPPING_ADDRESSES: 'quotation.shippingAddresses',
  USERS: 'quotation.users',
  PAYMENT_TYPES: 'quotation.paymentTypes',
  PRODUCTS: 'quotation.products',
  CAN_EDIT: 'quotation.canEdit',
  APPROVAL_STATUS: 'quotation.approvalStatus',
  PRICE_RULE_OF_QUOTATION: 'quotation.priceRuleOfQuotation',
} as const;

export const queryKeys = {
  quotations: () => [QUOTATION_QUERY_KEYS.QUOTATIONS] as const,
  quotation: (id: number) => [QUOTATION_QUERY_KEYS.QUOTATION, id] as const,
  customers: (search?: string) => [QUOTATION_QUERY_KEYS.CUSTOMERS, search] as const,
  shippingAddresses: (customerId?: number) => [QUOTATION_QUERY_KEYS.SHIPPING_ADDRESSES, customerId] as const,
  users: () => [QUOTATION_QUERY_KEYS.USERS] as const,
  paymentTypes: () => [QUOTATION_QUERY_KEYS.PAYMENT_TYPES] as const,
  products: (search?: string) => [QUOTATION_QUERY_KEYS.PRODUCTS, search] as const,
  canEdit: (quotationId: number) => [QUOTATION_QUERY_KEYS.CAN_EDIT, quotationId] as const,
  approvalStatus: (quotationId: number) => [QUOTATION_QUERY_KEYS.APPROVAL_STATUS, quotationId] as const,
  priceRuleOfQuotation: (customerCode: string, salesmenId: number, quotationDate: string) => 
    [QUOTATION_QUERY_KEYS.PRICE_RULE_OF_QUOTATION, customerCode, salesmenId, quotationDate] as const,
};
