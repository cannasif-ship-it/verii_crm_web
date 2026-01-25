import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, Receipt, Package, Headphones, Info } from 'lucide-react'; // İkon seti
import type { NotificationDto } from '../types/notification';
import { formatNotificationTime } from '../utils/date-utils';
import { notificationApi } from '../api/notification-api';
import { useNotificationStore } from '../stores/notification-store';

interface NotificationItemProps {
  notification: NotificationDto;
}

export function NotificationItem({ notification }: NotificationItemProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { markAsRead: markAsReadStore, addMarkedAsReadId } = useNotificationStore();

  const getRouteForEntity = (entityType: string, entityId: number): string | null => {
    if (!entityType || !entityType.endsWith('Header')) {
      const routeMap: Record<string, string> = {
        Package: `/package/detail/${entityId}`,
        Shipment: `/shipment/collection/${entityId}`,
        GoodsReceipt: `/goods-receipt/collection/${entityId}`,
      };
      return routeMap[entityType] || null;
    }
    const prefix = entityType.replace('Header', '');
    const headerRouteMap: Record<string, { route: string; useCollection: boolean }> = {
      WT: { route: 'transfer', useCollection: true },
      GR: { route: 'goods-receipt', useCollection: true },
      SH: { route: 'shipment', useCollection: true },
      SIT: { route: 'subcontracting/issue', useCollection: true },
      SRT: { route: 'subcontracting/receipt', useCollection: true },
      WI: { route: 'warehouse/inbound', useCollection: false },
      WO: { route: 'warehouse/outbound', useCollection: false },
    };
    const routeConfig = headerRouteMap[prefix];
    if (routeConfig) {
      return routeConfig.useCollection
        ? `/${routeConfig.route}/collection/${entityId}`
        : `/${routeConfig.route}/assigned`;
    }
    return null;
  };

  const handleClick = async (): Promise<void> => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.relatedEntityType && notification.relatedEntityId) {
      const route = getRouteForEntity(notification.relatedEntityType, notification.relatedEntityId);
      if (route) navigate(route);
    }
   
      if (!notification.isRead) {
        handleMarkAsRead();
    }
  };

  const handleMarkAsRead = async (e?: React.MouseEvent): Promise<void> => {
    e?.stopPropagation();
    if (notification.isRead) return;
    try {
      await notificationApi.markNotificationsAsReadBulk([notification.id]);
      markAsReadStore(notification.id);
      addMarkedAsReadId(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const renderIcon = () => {
    const type = notification.relatedEntityType || '';
    
    if (type.includes('Offer') || type.includes('Teklif')) 
        return <FileText size={16} className="text-pink-400" />;
    if (type.includes('Payment') || type.includes('Invoice') || type.includes('Fatura')) 
        return <Receipt size={16} className="text-green-400" />;
    if (type.includes('Stock') || type.includes('Warehouse') || type.includes('Package')) 
        return <Package size={16} className="text-orange-400" />;
    if (type.includes('Support') || type.includes('Ticket')) 
        return <Headphones size={16} className="text-blue-400" />;
        

    return <Info size={16} className="text-purple-400" />;
  };


  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-pink-500/50"
    >
 
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            {renderIcon()}
        </div>

     
        <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate leading-tight">
                {notification.title}
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {notification.message}
            </p>
            <div className="text-[10px] text-slate-600 mt-1.5 font-medium">
                {formatNotificationTime(notification.timestamp)}
            </div>
        </div>

       
        {!notification.isRead && (
            <div 
                className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(236,72,153,0.5)]" 
                title={t('notification.unread')}
                onClick={handleMarkAsRead} // Sadece noktaya basınca okundu yap
            />
        )}
    </div>
  );
}