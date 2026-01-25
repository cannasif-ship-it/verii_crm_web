import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trCommon from '../locales/tr/common.json';
import enCommon from '../locales/en/common.json';
import deCommon from '../locales/de/common.json';
import frCommon from '../locales/fr/common.json';
import trCustomerTypeManagement from '../locales/tr/customer-type-management.json';
import enCustomerTypeManagement from '../locales/en/customer-type-management.json';
import deCustomerTypeManagement from '../locales/de/customer-type-management.json';
import frCustomerTypeManagement from '../locales/fr/customer-type-management.json';
import trCustomerManagement from '../locales/tr/customer-management.json';
import enCustomerManagement from '../locales/en/customer-management.json';
import deCustomerManagement from '../locales/de/customer-management.json';
import frCustomerManagement from '../locales/fr/customer-management.json';
import trContactManagement from '../locales/tr/contact-management.json';
import enContactManagement from '../locales/en/contact-management.json';
import deContactManagement from '../locales/de/contact-management.json';
import frContactManagement from '../locales/fr/contact-management.json';
import trCountryManagement from '../locales/tr/country-management.json';
import enCountryManagement from '../locales/en/country-management.json';
import deCountryManagement from '../locales/de/country-management.json';
import frCountryManagement from '../locales/fr/country-management.json';
import trPaymentTypeManagement from '../locales/tr/payment-type-management.json';
import enPaymentTypeManagement from '../locales/en/payment-type-management.json';
import dePaymentTypeManagement from '../locales/de/payment-type-management.json';
import frPaymentTypeManagement from '../locales/fr/payment-type-management.json';
import trUserDiscountLimitManagement from '../locales/tr/user-discount-limit-management.json';
import enUserDiscountLimitManagement from '../locales/en/user-discount-limit-management.json';
import deUserDiscountLimitManagement from '../locales/de/user-discount-limit-management.json';
import frUserDiscountLimitManagement from '../locales/fr/user-discount-limit-management.json';
import trProductPricingGroupByManagement from '../locales/tr/product-pricing-group-by-management.json';
import enProductPricingGroupByManagement from '../locales/en/product-pricing-group-by-management.json';
import deProductPricingGroupByManagement from '../locales/de/product-pricing-group-by-management.json';
import frProductPricingGroupByManagement from '../locales/fr/product-pricing-group-by-management.json';
import trProductPricingManagement from '../locales/tr/product-pricing-management.json';
import enProductPricingManagement from '../locales/en/product-pricing-management.json';
import deProductPricingManagement from '../locales/de/product-pricing-management.json';
import frProductPricingManagement from '../locales/fr/product-pricing-management.json';
import trActivityManagement from '../locales/tr/activity-management.json';
import enActivityManagement from '../locales/en/activity-management.json';
import deActivityManagement from '../locales/de/activity-management.json';
import frActivityManagement from '../locales/fr/activity-management.json';
import trActivityType from '../locales/tr/activity-type.json';
import enActivityType from '../locales/en/activity-type.json';
import deActivityType from '../locales/de/activity-type.json';
import frActivityType from '../locales/fr/activity-type.json';
import trShippingAddressManagement from '../locales/tr/shipping-address-management.json';
import enShippingAddressManagement from '../locales/en/shipping-address-management.json';
import deShippingAddressManagement from '../locales/de/shipping-address-management.json';
import frShippingAddressManagement from '../locales/fr/shipping-address-management.json';
import trDailyTasks from '../locales/tr/daily-tasks.json';
import enDailyTasks from '../locales/en/daily-tasks.json';
import deDailyTasks from '../locales/de/daily-tasks.json';
import frDailyTasks from '../locales/fr/daily-tasks.json';
import trErpCustomerManagement from '../locales/tr/erp-customer-management.json';
import enErpCustomerManagement from '../locales/en/erp-customer-management.json';
import deErpCustomerManagement from '../locales/de/erp-customer-management.json';
import frErpCustomerManagement from '../locales/fr/erp-customer-management.json';
import trCustomerSelectDialog from '../locales/tr/customer-select-dialog.json';
import enCustomerSelectDialog from '../locales/en/customer-select-dialog.json';
import deCustomerSelectDialog from '../locales/de/customer-select-dialog.json';
import frCustomerSelectDialog from '../locales/fr/customer-select-dialog.json';
import trRelatedStocksSelectionDialog from '../locales/tr/related-stocks-selection-dialog.json';
import enRelatedStocksSelectionDialog from '../locales/en/related-stocks-selection-dialog.json';
import deRelatedStocksSelectionDialog from '../locales/de/related-stocks-selection-dialog.json';
import frRelatedStocksSelectionDialog from '../locales/fr/related-stocks-selection-dialog.json';
import trProductSelectDialog from '../locales/tr/product-select-dialog.json';
import enProductSelectDialog from '../locales/en/product-select-dialog.json';
import deProductSelectDialog from '../locales/de/product-select-dialog.json';
import frProductSelectDialog from '../locales/fr/product-select-dialog.json';
import trApproval from '../locales/tr/approval.json';
import enApproval from '../locales/en/approval.json';
import deApproval from '../locales/de/approval.json';
import frApproval from '../locales/fr/approval.json';
import trQuotation from '../locales/tr/quotation.json';
import enQuotation from '../locales/en/quotation.json';
import deQuotation from '../locales/de/quotation.json';
import frQuotation from '../locales/fr/quotation.json';
import trWizard from '../locales/tr/wizard.json';
import enWizard from '../locales/en/wizard.json';
import deWizard from '../locales/de/wizard.json';
import frWizard from '../locales/fr/wizard.json';
import trPricingRule from '../locales/tr/pricing-rule.json';
import enPricingRule from '../locales/en/pricing-rule.json';
import dePricingRule from '../locales/de/pricing-rule.json';
import frPricingRule from '../locales/fr/pricing-rule.json';
import trDocumentSerialTypeManagement from '../locales/tr/document-serial-type-management.json';
import enDocumentSerialTypeManagement from '../locales/en/document-serial-type-management.json';
import deDocumentSerialTypeManagement from '../locales/de/document-serial-type-management.json';
import frDocumentSerialTypeManagement from '../locales/fr/document-serial-type-management.json';
import trApprovalRoleGroupManagement from '../locales/tr/approval-role-group-management.json';
import enApprovalRoleGroupManagement from '../locales/en/approval-role-group-management.json';
import deApprovalRoleGroupManagement from '../locales/de/approval-role-group-management.json';
import frApprovalRoleGroupManagement from '../locales/fr/approval-role-group-management.json';
import trApprovalFlowManagement from '../locales/tr/approval-flow-management.json';
import enApprovalFlowManagement from '../locales/en/approval-flow-management.json';
import deApprovalFlowManagement from '../locales/de/approval-flow-management.json';
import frApprovalFlowManagement from '../locales/fr/approval-flow-management.json';
import trApprovalRoleManagement from '../locales/tr/approval-role-management.json';
import enApprovalRoleManagement from '../locales/en/approval-role-management.json';
import deApprovalRoleManagement from '../locales/de/approval-role-management.json';
import frApprovalRoleManagement from '../locales/fr/approval-role-management.json';
import trApprovalUserRoleManagement from '../locales/tr/approval-user-role-management.json';
import enApprovalUserRoleManagement from '../locales/en/approval-user-role-management.json';
import deApprovalUserRoleManagement from '../locales/de/approval-user-role-management.json';
import frApprovalUserRoleManagement from '../locales/fr/approval-user-role-management.json';
import trQuotationLineManagement from '../locales/tr/quotation-line-management.json';
import enQuotationLineManagement from '../locales/en/quotation-line-management.json';
import deQuotationLineManagement from '../locales/de/quotation-line-management.json';
import frQuotationLineManagement from '../locales/fr/quotation-line-management.json';
import trDistrictManagement from '../locales/tr/district-management.json';
import enDistrictManagement from '../locales/en/district-management.json';
import deDistrictManagement from '../locales/de/district-management.json';
import frDistrictManagement from '../locales/fr/district-management.json';
import trStock from '../locales/tr/stock.json';
import enStock from '../locales/en/stock.json';
import deStock from '../locales/de/stock.json';
import frStock from '../locales/fr/stock.json';
import trUserManagement from '../locales/tr/user-management.json';
import enUserManagement from '../locales/en/user-management.json';
import deUserManagement from '../locales/de/user-management.json';
import frUserManagement from '../locales/fr/user-management.json';
import trCityManagement from '../locales/tr/city-management.json';
import enCityManagement from '../locales/en/city-management.json';
import deCityManagement from '../locales/de/city-management.json';
import frCityManagement from '../locales/fr/city-management.json';
import trTitleManagement from '../locales/tr/title-management.json';
import enTitleManagement from '../locales/en/title-management.json';
import deTitleManagement from '../locales/de/title-management.json';
import frTitleManagement from '../locales/fr/title-management.json';
import trUserDetailManagement from '../locales/tr/user-detail-management.json';
import enUserDetailManagement from '../locales/en/user-detail-management.json';
import deUserDetailManagement from '../locales/de/user-detail-management.json';
import frUserDetailManagement from '../locales/fr/user-detail-management.json';
import trNotification from '../locales/tr/notification.json';
import enNotification from '../locales/en/notification.json';
import deNotification from '../locales/de/notification.json';
import frNotification from '../locales/fr/notification.json';
import trDashboard from '../locales/tr/dashboard.json';
import enDashboard from '../locales/en/dashboard.json';
import deDashboard from '../locales/de/dashboard.json';
import frDashboard from '../locales/fr/dashboard.json';
import trAuth from '../locales/tr/auth.json';
import enAuth from '../locales/en/auth.json';
import deAuth from '../locales/de/auth.json';
import frAuth from '../locales/fr/auth.json';

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
          countryManagement: trCountryManagement,
          paymentTypeManagement: trPaymentTypeManagement,
          userDiscountLimitManagement: trUserDiscountLimitManagement,
          productPricingGroupByManagement: trProductPricingGroupByManagement,
          productPricingManagement: trProductPricingManagement,
          activityManagement: trActivityManagement,
          activityType: trActivityType,
          shippingAddressManagement: trShippingAddressManagement,
          dailyTasks: trDailyTasks,
          erpCustomerManagement: trErpCustomerManagement,
          customerSelectDialog: trCustomerSelectDialog,
          relatedStocksSelectionDialog: trRelatedStocksSelectionDialog,
          productSelectDialog: trProductSelectDialog,
          approval: trApproval,
          quotation: trQuotation,
          wizard: trWizard,
          pricingRule: trPricingRule,
          documentSerialTypeManagement: trDocumentSerialTypeManagement,
          approvalRoleGroup: trApprovalRoleGroupManagement,
          ...trApprovalFlowManagement,
          ...trApprovalRoleManagement,
          ...trApprovalUserRoleManagement,
          quotationLineManagement: trQuotationLineManagement,
          districtManagement: trDistrictManagement,
          stock: trStock,
          userManagement: trUserManagement,
          cityManagement: trCityManagement,
          titleManagement: trTitleManagement,
          userDetailManagement: trUserDetailManagement,
          notification: trNotification,
          dashboard: trDashboard,
          auth: trAuth,
        } as unknown as typeof trCommon & { 
          customerTypeManagement: typeof trCustomerTypeManagement; 
          customerManagement: typeof trCustomerManagement; 
          contactManagement: typeof trContactManagement; 
          countryManagement: typeof trCountryManagement;
          paymentTypeManagement: typeof trPaymentTypeManagement; 
          userDiscountLimitManagement: typeof trUserDiscountLimitManagement; 
          productPricingGroupByManagement: typeof trProductPricingGroupByManagement; 
          productPricingManagement: typeof trProductPricingManagement; 
          activityManagement: typeof trActivityManagement; 
          activityType: typeof trActivityType;
          shippingAddressManagement: typeof trShippingAddressManagement; 
          dailyTasks: typeof trDailyTasks; 
          erpCustomerManagement: typeof trErpCustomerManagement; 
          customerSelectDialog: typeof trCustomerSelectDialog; 
          relatedStocksSelectionDialog: typeof trRelatedStocksSelectionDialog;
          productSelectDialog: typeof trProductSelectDialog; 
          approval: typeof trApproval; 
          quotation: typeof trQuotation; 
          wizard: typeof trWizard; 
          pricingRule: typeof trPricingRule; 
          documentSerialTypeManagement: typeof trDocumentSerialTypeManagement;
          approvalRoleGroup: typeof trApprovalRoleGroupManagement;
          quotationLineManagement: typeof trQuotationLineManagement;
          districtManagement: typeof trDistrictManagement;
          stock: typeof trStock;
          userManagement: typeof trUserManagement;
          cityManagement: typeof trCityManagement;
          titleManagement: typeof trTitleManagement;
          userDetailManagement: typeof trUserDetailManagement;
          notification: typeof trNotification;
          dashboard: typeof trDashboard;
          auth: typeof trAuth;
        },
      },
      en: {
        translation: {
          ...enCommon,
          customerTypeManagement: enCustomerTypeManagement,
          customerManagement: enCustomerManagement,
          contactManagement: enContactManagement,
          countryManagement: enCountryManagement,
          paymentTypeManagement: enPaymentTypeManagement,
          userDiscountLimitManagement: enUserDiscountLimitManagement,
          productPricingGroupByManagement: enProductPricingGroupByManagement,
          productPricingManagement: enProductPricingManagement,
          activityManagement: enActivityManagement,
          activityType: enActivityType,
          shippingAddressManagement: enShippingAddressManagement,
          dailyTasks: enDailyTasks,
          erpCustomerManagement: enErpCustomerManagement,
          customerSelectDialog: enCustomerSelectDialog,
          relatedStocksSelectionDialog: enRelatedStocksSelectionDialog,
          productSelectDialog: enProductSelectDialog,
          approval: enApproval,
          quotation: enQuotation,
          wizard: enWizard,
          pricingRule: enPricingRule,
          documentSerialTypeManagement: enDocumentSerialTypeManagement,
          approvalRoleGroup: enApprovalRoleGroupManagement,
          ...enApprovalFlowManagement,
          ...enApprovalRoleManagement,
          ...enApprovalUserRoleManagement,
          quotationLineManagement: enQuotationLineManagement,
          districtManagement: enDistrictManagement,
          stock: enStock,
          userManagement: enUserManagement,
          cityManagement: enCityManagement,
          titleManagement: enTitleManagement,
          userDetailManagement: enUserDetailManagement,
          notification: enNotification,
          dashboard: enDashboard,
          auth: enAuth,
        } as unknown as typeof enCommon & {  
          customerTypeManagement: typeof enCustomerTypeManagement; 
          customerManagement: typeof enCustomerManagement; 
          contactManagement: typeof enContactManagement; 
          countryManagement: typeof enCountryManagement;
          paymentTypeManagement: typeof enPaymentTypeManagement; 
          userDiscountLimitManagement: typeof enUserDiscountLimitManagement; 
          productPricingGroupByManagement: typeof enProductPricingGroupByManagement; 
          productPricingManagement: typeof enProductPricingManagement; 
          activityManagement: typeof enActivityManagement; 
          activityType: typeof enActivityType;
          shippingAddressManagement: typeof enShippingAddressManagement; 
          dailyTasks: typeof enDailyTasks; 
          erpCustomerManagement: typeof enErpCustomerManagement; 
          customerSelectDialog: typeof enCustomerSelectDialog; 
          relatedStocksSelectionDialog: typeof enRelatedStocksSelectionDialog;
          productSelectDialog: typeof enProductSelectDialog; 
          approval: typeof enApproval; 
          quotation: typeof enQuotation; 
          wizard: typeof enWizard; 
          pricingRule: typeof enPricingRule; 
          documentSerialTypeManagement: typeof enDocumentSerialTypeManagement;
          approvalRoleGroup: typeof enApprovalRoleGroupManagement;
          quotationLineManagement: typeof enQuotationLineManagement;
          districtManagement: typeof enDistrictManagement;
          stock: typeof enStock;
          userManagement: typeof enUserManagement;
          cityManagement: typeof enCityManagement;
          titleManagement: typeof enTitleManagement;
          userDetailManagement: typeof enUserDetailManagement;
          notification: typeof enNotification;
          dashboard: typeof enDashboard;
          auth: typeof enAuth;
        },
      },
      de: {
        translation: {
          ...deCommon,
          customerTypeManagement: deCustomerTypeManagement,
          customerManagement: deCustomerManagement,
          contactManagement: deContactManagement,
          countryManagement: deCountryManagement,
          paymentTypeManagement: dePaymentTypeManagement,
          userDiscountLimitManagement: deUserDiscountLimitManagement,
          productPricingGroupByManagement: deProductPricingGroupByManagement,
          productPricingManagement: deProductPricingManagement,
          activityManagement: deActivityManagement,
          activityType: deActivityType,
          shippingAddressManagement: deShippingAddressManagement,
          dailyTasks: deDailyTasks,
          erpCustomerManagement: deErpCustomerManagement,
          customerSelectDialog: deCustomerSelectDialog,
          relatedStocksSelectionDialog: deRelatedStocksSelectionDialog,
          productSelectDialog: deProductSelectDialog,
          approval: deApproval,
          quotation: deQuotation,
          wizard: deWizard,
          pricingRule: dePricingRule,
          documentSerialTypeManagement: deDocumentSerialTypeManagement,
          approvalRoleGroup: deApprovalRoleGroupManagement,
          ...deApprovalFlowManagement,
          ...deApprovalRoleManagement,
          ...deApprovalUserRoleManagement,
          quotationLineManagement: deQuotationLineManagement,
          districtManagement: deDistrictManagement,
          stock: deStock,
          userManagement: deUserManagement,
          cityManagement: deCityManagement,
          titleManagement: deTitleManagement,
          userDetailManagement: deUserDetailManagement,
          notification: deNotification,
          dashboard: deDashboard,
        },
      },
      fr: {
        translation: {
          ...frCommon,
          customerTypeManagement: frCustomerTypeManagement,
          customerManagement: frCustomerManagement,
          contactManagement: frContactManagement,
          countryManagement: frCountryManagement,
          paymentTypeManagement: frPaymentTypeManagement,
          userDiscountLimitManagement: frUserDiscountLimitManagement,
          productPricingGroupByManagement: frProductPricingGroupByManagement,
          productPricingManagement: frProductPricingManagement,
          activityManagement: frActivityManagement,
          activityType: frActivityType,
          shippingAddressManagement: frShippingAddressManagement,
          dailyTasks: frDailyTasks,
          erpCustomerManagement: frErpCustomerManagement,
          customerSelectDialog: frCustomerSelectDialog,
          relatedStocksSelectionDialog: frRelatedStocksSelectionDialog,
          productSelectDialog: frProductSelectDialog,
          approval: frApproval,
          quotation: frQuotation,
          wizard: frWizard,
          pricingRule: frPricingRule,
          documentSerialTypeManagement: frDocumentSerialTypeManagement,
          approvalRoleGroup: frApprovalRoleGroupManagement,
          ...frApprovalFlowManagement,
          ...frApprovalRoleManagement,
          ...frApprovalUserRoleManagement,
          quotationLineManagement: frQuotationLineManagement,
          districtManagement: frDistrictManagement,
          stock: frStock,
          userManagement: frUserManagement,
          cityManagement: frCityManagement,
          titleManagement: frTitleManagement,
          userDetailManagement: frUserDetailManagement,
          notification: frNotification,
          dashboard: frDashboard,
          auth: frAuth,
        } as unknown as typeof frCommon & {
          customerTypeManagement: typeof frCustomerTypeManagement;
          customerManagement: typeof frCustomerManagement;
          contactManagement: typeof frContactManagement;
          countryManagement: typeof frCountryManagement;
          paymentTypeManagement: typeof frPaymentTypeManagement;
          userDiscountLimitManagement: typeof frUserDiscountLimitManagement;
          productPricingGroupByManagement: typeof frProductPricingGroupByManagement;
          productPricingManagement: typeof frProductPricingManagement;
          activityManagement: typeof frActivityManagement;
          activityType: typeof frActivityType;
          shippingAddressManagement: typeof frShippingAddressManagement;
          dailyTasks: typeof frDailyTasks;
          erpCustomerManagement: typeof frErpCustomerManagement;
          customerSelectDialog: typeof frCustomerSelectDialog;
          relatedStocksSelectionDialog: typeof frRelatedStocksSelectionDialog;
          productSelectDialog: typeof frProductSelectDialog;
          approval: typeof frApproval;
          quotation: typeof frQuotation;
          wizard: typeof frWizard;
          pricingRule: typeof frPricingRule;
          documentSerialTypeManagement: typeof frDocumentSerialTypeManagement;
          approvalRoleGroup: typeof frApprovalRoleGroupManagement;
          quotationLineManagement: typeof frQuotationLineManagement;
          districtManagement: typeof frDistrictManagement;
          stock: typeof frStock;
          userManagement: typeof frUserManagement;
          cityManagement: typeof frCityManagement;
          titleManagement: typeof frTitleManagement;
          userDetailManagement: typeof frUserDetailManagement;
          notification: typeof frNotification;
          dashboard: typeof frDashboard;
          auth: typeof frAuth;
        },
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
