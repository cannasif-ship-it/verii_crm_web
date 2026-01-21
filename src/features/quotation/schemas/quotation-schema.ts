import { z } from 'zod';

export const createQuotationSchema = z.object({
  quotation: z.object({
    potentialCustomerId: z.number().nullable().optional(),
    erpCustomerCode: z.string().max(50, 'Müşteri kodu en fazla 50 karakter olabilir').nullable().optional(),
    deliveryDate: z.string().nullable().optional(),
    shippingAddressId: z.number().nullable().optional(),
    representativeId: z.number().nullable().optional(),
    status: z.number().nullable().optional(),
    description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').nullable().optional(),
    paymentTypeId: z.number().nullable().optional(),
    offerType: z.string({
      message: 'Teklif tipi seçilmelidir',
    }),
    offerDate: z.string().nullable().optional(),
    offerNo: z.string().max(50, 'Teklif no en fazla 50 karakter olabilir').nullable().optional(),
    revisionNo: z.string().max(50, 'Revizyon no en fazla 50 karakter olabilir').nullable().optional(),
    revisionId: z.number().nullable().optional(),
    currency: z.string().min(1, 'Para birimi seçilmelidir'),
  }),
});

export type CreateQuotationSchema = z.infer<typeof createQuotationSchema>;
