import { type ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { FloatingSettings } from './FloatingSettings'; 
import { 
  DashboardSquare02Icon, 
  UserGroupIcon, 
  Calendar03Icon, 
  PackageIcon, 
  ShoppingBag03Icon, 
  CheckmarkCircle02Icon, 
  SlidersHorizontalIcon, 
  UserCircleIcon, 
  Settings02Icon 
} from 'hugeicons-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: NavItem[];
}
interface MainLayoutProps {
  navItems?: NavItem[];
}

export function MainLayout({ navItems }: MainLayoutProps): ReactElement {
  const { t, i18n } = useTranslation();

  const defaultNavItems: NavItem[] = useMemo(() => {
    
    const iconSize = 22;

    const collator = new Intl.Collator(i18n.language, { sensitivity: 'base', numeric: true });


    const sortNavItems = (items: NavItem[]): NavItem[] => {
      return items.map((item) => {
        if (item.children && item.children.length > 0) {

          const sortedChildren = [...item.children].sort((a, b) => 
            collator.compare(a.title, b.title)
          );

          return { ...item, children: sortNavItems(sortedChildren) };
        }
        return item;
      });
    };


    const logicalMenuStructure: NavItem[] = [
      

      {
        title: t('sidebar.home', 'Ana Sayfa'),
        href: '/',
        icon: <DashboardSquare02Icon size={iconSize} className="text-blue-500" />,
      },


      {
        title: t('sidebar.customers', 'Müşteriler'),
        icon: <UserGroupIcon size={iconSize} className="text-purple-500"  />,
        children: [
          { title: t('sidebar.customerManagement', 'Müşteri Yönetimi'), href: '/customer-management' },
          { title: t('sidebar.customerTypeManagement', 'Müşteri Tipi Yönetimi'), href: '/customer-type-management' },
          { title: t('sidebar.contactManagement', 'Müşteri İletişim Yönetimi'), href: '/contact-management' },
          { title: t('sidebar.erpCustomerManagement', 'ERP Müşteri'), href: '/erp-customers' },
        ]
      },

      {
        title: t('sidebar.activities', 'Aktiviteler'),
        icon: <Calendar03Icon size={iconSize} className="text-emerald-500"  />,
        children: [
          { title: t('sidebar.activityTypeManagement', 'Aktivite Tipi Yönetimi'), href: '/activity-type-management' },
          { title: t('sidebar.activityManagement', 'Aktivite Yönetimi'), href: '/activity-management' },
          { title: t('sidebar.dailyTasks', 'Günlük İşler'), href: '/daily-tasks' },
        ]
      },

      {
        title: t('sidebar.productAndStock', 'Ürün & Stok'),
        icon: <PackageIcon size={iconSize} className="text-pink-500" />,
        children: [
          { title: t('sidebar.stockManagement', 'Stok Yönetimi'), href: '/stocks' },
          { title: t('sidebar.productPricingManagement', 'Ürün Fiyatlandırma Yönetimi'), href: '/product-pricing-management' },
          { title: t('sidebar.productPricingGroupByManagement', 'Ürün Fiyatlandırma Grubu Yönetimi'), href: '/product-pricing-group-by-management' },
        ]
      },

      {
        title: t('sidebar.salesManagement', 'Satış Yönetimi'),
        icon: <ShoppingBag03Icon size={iconSize} className="text-orange-500" />,
        children: [

          {
            title: t('sidebar.demands', 'Talepler'),
            children: [
              { title: t('sidebar.demandList', 'Talep Listesi'), href: '/demands' },
              { title: t('sidebar.demandCreateWizard', 'Yeni Talep Oluştur'), href: '/demands/create' },
              { title: t('sidebar.waitingApprovalDemands', 'Onay Bekleyen Talepler'), href: '/demands/waiting-approvals' },
            ]
          },

          {
            title: t('sidebar.proposals', 'Teklifler'),
            children: [
              { title: t('sidebar.quotationList', 'Teklif Listesi'), href: '/quotations' },
              { title: t('sidebar.quotationCreateWizard', 'Yeni Teklif Oluştur'), href: '/quotations/create' },
              { title: t('sidebar.waitingApprovals', 'Onay Bekleyen Teklifler'), href: '/quotations/waiting-approvals' },
            ]
          },
 
          {
            title: t('sidebar.orders', 'Siparişler'),
            children: [
              { title: t('sidebar.orderList', 'Sipariş Listesi'), href: '/orders' },
              { title: t('sidebar.orderCreateWizard', 'Yeni Sipariş Oluştur'), href: '/orders/create' },
              { title: t('sidebar.waitingApprovalOrders', 'Onay Bekleyen Siparişler'), href: '/orders/waiting-approvals' },
            ]
          }
        ]
      },

      {
        title: t('sidebar.approvalDefinitions', 'Onay Tanım Grubu'),
        icon: <CheckmarkCircle02Icon size={iconSize} className="text-teal-500" />,
        children: [
          { title: t('sidebar.approvalFlowManagement', 'Onay Akış Yönetimi'), href: '/approval-flow-management' },
          { title: t('sidebar.approvalRoleManagement', 'Onay Rol Yönetimi'), href: '/approval-role-management' },
          { title: t('sidebar.approvalRoleGroupManagement', 'Onay Rol Grubu Yönetimi'), href: '/approval-role-group-management' },
          { title: t('sidebar.approvalUserRoleManagement', 'Onay Kullanıcı Rolü Yönetimi'), href: '/approval-user-role-management' },
        ]
      },

      {
        title: t('sidebar.definitions', 'Tanımlar'),
        icon: <SlidersHorizontalIcon size={iconSize} className="text-slate-500"  />,
        children: [
          { title: t('sidebar.districtManagement', 'İlçe Yönetimi'), href: '/district-management' },
          { title: t('sidebar.cityManagement', 'Şehir Yönetimi'), href: '/city-management' },
          { title: t('sidebar.countryManagement', 'Ülke Yönetimi'), href: '/country-management' },
          { title: t('sidebar.shippingAddressManagement', 'Sevk Adresi Yönetimi'), href: '/shipping-address-management' },
          { title: t('sidebar.paymentTypeManagement', 'Ödeme Tipi Yönetimi'), href: '/payment-type-management' },
          { title: t('sidebar.titleManagement', 'Ünvan Yönetimi'), href: '/title-management' },
          { title: t('sidebar.pricingRuleManagement', 'Fiyat Kuralı Yönetimi'), href: '/pricing-rules' },
          { title: t('sidebar.documentSerialTypeManagement', 'Dosya Tip Yönetimi'), href: '/document-serial-type-management' },
        ]
      },


      {
        title: t('sidebar.users', 'Kullanıcılar'),
        icon: <UserCircleIcon size={iconSize} className="text-indigo-500" stroke="currentColor" />,
        children: [
          { title: t('sidebar.userManagement', 'Kullanıcı Yönetimi'), href: '/user-management' },
          { title: t('sidebar.userDiscountLimitManagement', 'Kullanıcı İskonto Limit Yönetimi'), href: '/user-discount-limit-management' },
        ]
      },

      {
        title: t('sidebar.settings', 'Ayarlar'),
        icon: <Settings02Icon size={iconSize} className="text-gray-500"  />,
        href: '#' 
      }
    ];

    return sortNavItems(logicalMenuStructure);
  }, [t, i18n.language]);

  const items = navItems || defaultNavItems;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f8f9fc] dark:bg-[#0c0516] font-['Outfit'] transition-colors duration-300">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-track { background: #0c0516; }
        .dark ::-webkit-scrollbar-thumb { background: #333; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>

      {/* --- AMBIENT GLOWS --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-pink-300/30 dark:bg-pink-600/5 blur-[120px] mix-blend-multiply dark:mix-blend-normal transition-colors duration-500" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-300/30 dark:bg-orange-600/5 blur-[100px] mix-blend-multiply dark:mix-blend-normal transition-colors duration-500" />
      </div>

      <div className="relative z-20 h-full">
        <Sidebar items={items} />
      </div>

      <div className="flex flex-1 flex-col h-full overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 text-foreground">
           <div className="container mx-auto min-h-full">
             <Outlet />
           </div>
        </main>
        <Footer />
      </div>
      
      <FloatingSettings />
      
    </div>
  );
}