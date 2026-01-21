
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trCommon from '../locales/tr/common.json';
import enCommon from '../locales/en/common.json';
import deCommon from '../locales/de/common.json';
import frCommon from '../locales/fr/common.json';
import trCustomerTypeManagement from '../locales/tr/customer-type-management.json';
import enCustomerTypeManagement from '../locales/en/customer-type-management.json';
import trCustomerManagement from '../locales/tr/customer-management.json';
import enCustomerManagement from '../locales/en/customer-management.json';
import trContactManagement from '../locales/tr/contact-management.json';
import enContactManagement from '../locales/en/contact-management.json';
import trPaymentTypeManagement from '../locales/tr/payment-type-management.json';
import enPaymentTypeManagement from '../locales/en/payment-type-management.json';
import trUserDiscountLimitManagement from '../locales/tr/user-discount-limit-management.json';
import enUserDiscountLimitManagement from '../locales/en/user-discount-limit-management.json';
import trProductPricingGroupByManagement from '../locales/tr/product-pricing-group-by-management.json';
import enProductPricingGroupByManagement from '../locales/en/product-pricing-group-by-management.json';
import trProductPricingManagement from '../locales/tr/product-pricing-management.json';
import enProductPricingManagement from '../locales/en/product-pricing-management.json';
import trActivityManagement from '../locales/tr/activity-management.json';
import enActivityManagement from '../locales/en/activity-management.json';
import trShippingAddressManagement from '../locales/tr/shipping-address-management.json';
import enShippingAddressManagement from '../locales/en/shipping-address-management.json';
import trDailyTasks from '../locales/tr/daily-tasks.json';
import enDailyTasks from '../locales/en/daily-tasks.json';
import trErpCustomerManagement from '../locales/tr/erp-customer-management.json';
import enErpCustomerManagement from '../locales/en/erp-customer-management.json';
import trCustomerSelectDialog from '../locales/tr/customer-select-dialog.json';
import enCustomerSelectDialog from '../locales/en/customer-select-dialog.json';
import trProductSelectDialog from '../locales/tr/product-select-dialog.json';
import enProductSelectDialog from '../locales/en/product-select-dialog.json';
import trApproval from '../locales/tr/approval.json';
import enApproval from '../locales/en/approval.json';
import trQuotation from '../locales/tr/quotation.json';
import enQuotation from '../locales/en/quotation.json';
import trWizard from '../locales/tr/wizard.json';
import enWizard from '../locales/en/wizard.json';
import trPricingRule from '../locales/tr/pricing-rule.json';
import enPricingRule from '../locales/en/pricing-rule.json';
import trDocumentSerialType from '../locales/tr/document-serial-type.json';
import enDocumentSerialType from '../locales/en/document-serial-type.json';

const savedLanguage = localStorage.getItem('i18nextLng') || 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: {
          ...trCommon,
          customerTypeManagement: trCustomerTypeManagement,
          customerManagement: trCustomerManagement,
          contactManagement: trContactManagement,
          paymentTypeManagement: trPaymentTypeManagement,
          userDiscountLimitManagement: trUserDiscountLimitManagement,
          productPricingGroupByManagement: trProductPricingGroupByManagement,
          productPricingManagement: trProductPricingManagement,
          activityManagement: trActivityManagement,
          shippingAddressManagement: trShippingAddressManagement,
          dailyTasks: trDailyTasks,
          erpCustomerManagement: trErpCustomerManagement,
          customerSelectDialog: trCustomerSelectDialog,
          productSelectDialog: trProductSelectDialog,
          approval: trApproval,
          quotation: trQuotation,
          wizard: trWizard,
          pricingRule: trPricingRule,
          documentSerialType: trDocumentSerialType,
        } as typeof trCommon & { customerTypeManagement: typeof trCustomerTypeManagement; customerManagement: typeof trCustomerManagement; contactManagement: typeof trContactManagement; paymentTypeManagement: typeof trPaymentTypeManagement; userDiscountLimitManagement: typeof trUserDiscountLimitManagement; productPricingGroupByManagement: typeof trProductPricingGroupByManagement; productPricingManagement: typeof trProductPricingManagement; activityManagement: typeof trActivityManagement; shippingAddressManagement: typeof trShippingAddressManagement; dailyTasks: typeof trDailyTasks; erpCustomerManagement: typeof trErpCustomerManagement; customerSelectDialog: typeof trCustomerSelectDialog; productSelectDialog: typeof trProductSelectDialog; approval: typeof trApproval; quotation: typeof trQuotation; wizard: typeof trWizard; pricingRule: typeof trPricingRule; documentSerialType: typeof trDocumentSerialType },
      },
      en: {
        translation: {
          ...enCommon,
          customerTypeManagement: enCustomerTypeManagement,
          customerManagement: enCustomerManagement,
          contactManagement: enContactManagement,
          paymentTypeManagement: enPaymentTypeManagement,
          userDiscountLimitManagement: enUserDiscountLimitManagement,
          productPricingGroupByManagement: enProductPricingGroupByManagement,
          productPricingManagement: enProductPricingManagement,
          activityManagement: enActivityManagement,
          shippingAddressManagement: enShippingAddressManagement,
          dailyTasks: enDailyTasks,
          erpCustomerManagement: enErpCustomerManagement,
          customerSelectDialog: enCustomerSelectDialog,
          productSelectDialog: enProductSelectDialog,
          approval: enApproval,
          quotation: enQuotation,
          wizard: enWizard,
          pricingRule: enPricingRule,
          documentSerialType: enDocumentSerialType,
        } as typeof enCommon & { customerTypeManagement: typeof enCustomerTypeManagement; customerManagement: typeof enCustomerManagement; contactManagement: typeof enContactManagement; paymentTypeManagement: typeof enPaymentTypeManagement; userDiscountLimitManagement: typeof enUserDiscountLimitManagement; productPricingGroupByManagement: typeof enProductPricingGroupByManagement; productPricingManagement: typeof enProductPricingManagement; activityManagement: typeof enActivityManagement; shippingAddressManagement: typeof enShippingAddressManagement; dailyTasks: typeof enDailyTasks; erpCustomerManagement: typeof enErpCustomerManagement; customerSelectDialog: typeof enCustomerSelectDialog; productSelectDialog: typeof enProductSelectDialog; approval: typeof enApproval; quotation: typeof enQuotation; wizard: typeof enWizard; pricingRule: typeof enPricingRule; documentSerialType: typeof enDocumentSerialType },
      },
      de: {
        translation: deCommon,
      },
      fr: {
        translation: frCommon,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

