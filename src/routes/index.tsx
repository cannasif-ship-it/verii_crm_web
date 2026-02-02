import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { LoginPage, ResetPasswordPage, ForgotPasswordPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { TitleManagementPage } from '@/features/title-management';
import { UserManagementPage } from '@/features/user-management';
import { CountryManagementPage } from '@/features/country-management';
import { CityManagementPage } from '@/features/city-management';
import { DistrictManagementPage } from '@/features/district-management';
import { CustomerTypeManagementPage } from '@/features/customer-type-management';
import { CustomerManagementPage } from '@/features/customer-management';
import { ContactManagementPage } from '@/features/contact-management';
import { PaymentTypeManagementPage } from '@/features/payment-type-management';
import { UserDiscountLimitManagementPage } from '@/features/user-discount-limit-management';
import { ProductPricingGroupByManagementPage } from '@/features/product-pricing-group-by-management';
import { ProductPricingManagementPage } from '@/features/product-pricing-management';
import { ActivityManagementPage } from '@/features/activity-management';
import { ActivityTypeManagementPage } from '@/features/activity-type';
import { ShippingAddressManagementPage } from '@/features/shipping-address-management';
import { DailyTasksPage } from '@/features/daily-tasks/components/DailyTasksPage';
import { ErpCustomerManagementPage } from '@/features/erp-customer-management';
import { ApprovalRoleGroupManagementPage } from '@/features/approval-role-group-management';
import { ApprovalUserRoleManagementPage } from '@/features/approval-user-role-management';
import { ApprovalRoleManagementPage } from '@/features/approval-role-management';
import { ApprovalFlowManagementPage } from '@/features/approval-flow-management';
import { QuotationCreateForm, QuotationDetailPage, QuotationListPage, WaitingApprovalsPage } from '@/features/quotation';
import { 
  DemandCreateForm, 
  DemandDetailPage, 
  DemandListPage, 
  WaitingApprovalsPage as DemandWaitingApprovalsPage 
} from '@/features/demand';
import { 
  OrderCreateForm, 
  OrderDetailPage, 
  OrderListPage, 
  WaitingApprovalsPage as OrderWaitingApprovalsPage 
} from '@/features/order';
import { PricingRuleManagementPage } from '@/features/pricing-rule';
import { StockListPage, StockDetailPage } from '@/features/stock';
import { DocumentSerialTypeManagementPage } from '@/features/document-serial-type-management';
import { ReportDesignerListPage, ReportDesignerCreatePage } from '@/report-designer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'report-designer',
        element: <ReportDesignerListPage />,
      },
      {
        path: 'report-designer/create',
        element: <ReportDesignerCreatePage />,
      },
      {
        path: 'report-designer/edit/:id',
        element: <ReportDesignerCreatePage />,
      },
      {
        path: 'title-management',
        element: <TitleManagementPage />,
      },
      {
        path: 'user-management',
        element: <UserManagementPage />,
      },
      {
        path: 'country-management',
        element: <CountryManagementPage />,
      },
      {
        path: 'city-management',
        element: <CityManagementPage />,
      },
      {
        path: 'district-management',
        element: <DistrictManagementPage />,
      },
      {
        path: 'customer-type-management',
        element: <CustomerTypeManagementPage />,
      },
      {
        path: 'customer-management',
        element: <CustomerManagementPage />,
      },
      {
        path: 'contact-management',
        element: <ContactManagementPage />,
      },
      {
        path: 'payment-type-management',
        element: <PaymentTypeManagementPage />,
      },
      {
        path: 'user-discount-limit-management',
        element: <UserDiscountLimitManagementPage />,
      },
      {
        path: 'product-pricing-group-by-management',
        element: <ProductPricingGroupByManagementPage />,
      },
      {
        path: 'product-pricing-management',
        element: <ProductPricingManagementPage />,
      },
      {
        path: 'activity-management',
        element: <ActivityManagementPage />,
      },
      {
        path: 'activity-type-management',
        element: <ActivityTypeManagementPage />,
      },
      {
        path: 'shipping-address-management',
        element: <ShippingAddressManagementPage />,
      },
      {
        path: 'daily-tasks',
        element: <DailyTasksPage />,
      },
      {
        path: 'erp-customers',
        element: <ErpCustomerManagementPage />,
      },
      {
        path: 'approval-role-group-management',
        element: <ApprovalRoleGroupManagementPage />,
      },
      {
        path: 'approval-user-role-management',
        element: <ApprovalUserRoleManagementPage />,
      },
      {
        path: 'approval-role-management',
        element: <ApprovalRoleManagementPage />,
      },
      {
        path: 'approval-flow-management',
        element: <ApprovalFlowManagementPage />,
      },
      {
        path: 'quotations',
        element: <QuotationListPage />,
      },
      {
        path: 'quotations/create',
        element: <QuotationCreateForm />,
      },
      {
        path: 'quotations/:id',
        element: <QuotationDetailPage />,
      },
      {
        path: 'quotations/waiting-approvals',
        element: <WaitingApprovalsPage />,
      },
      // DEMAND ROUTES
      {
        path: 'demands',
        element: <DemandListPage />,
      },
      {
        path: 'demands/create',
        element: <DemandCreateForm />,
      },
      {
        path: 'demands/:id',
        element: <DemandDetailPage />,
      },
      {
        path: 'demands/waiting-approvals',
        element: <DemandWaitingApprovalsPage />,
      },
      // ORDER ROUTES
      {
        path: 'orders',
        element: <OrderListPage />,
      },
      {
        path: 'orders/create',
        element: <OrderCreateForm />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailPage />,
      },
      {
        path: 'orders/waiting-approvals',
        element: <OrderWaitingApprovalsPage />,
      },
      {
        path: 'pricing-rules',
        element: <PricingRuleManagementPage />,
      },
      {
        path: 'stocks',
        element: <StockListPage />,
      },
      {
        path: 'stocks/:id',
        element: <StockDetailPage />,
      },
      {
        path: 'document-serial-type-management',
        element: <DocumentSerialTypeManagementPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: '/reset-password',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <ResetPasswordPage />,
      },
    ],
  },
]);
