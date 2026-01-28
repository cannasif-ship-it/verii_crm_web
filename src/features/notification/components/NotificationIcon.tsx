import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationIcon(): ReactElement {
  const { t } = useTranslation();
  const { data: unreadCount = 0 } = useUnreadCount();
  const hasUnread = unreadCount > 0;

  return (
    <NotificationDropdown>
      <button
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors group focus:outline-none"
        aria-label={`${t('notification.notifications')}${hasUnread ? ` (${unreadCount} ${t('notification.new')})` : ''}`}
      >
        <Bell size={22} className="text-slate-400 group-hover:text-white transition-colors" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 border-2 border-[#0c0516] rounded-full" />
        )}
      </button>
    </NotificationDropdown>
  );
}