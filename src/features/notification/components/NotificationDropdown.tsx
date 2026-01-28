import { type ReactElement, useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationApi } from '../api/notification-api';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useNotificationStore } from '../stores/notification-store';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  children: ReactElement;
}

export function NotificationDropdown({ children }: NotificationDropdownProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadCount();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['notification', 'list'],
    queryFn: ({ pageParam = 1 }) => 
      notificationApi.getUserNotifications(pageParam, 20, 'Id', 'desc'),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isOpen,
    staleTime: 30000,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notification', 'unread-count'] });
    },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((route: string): void => {
    navigate(route);
    setIsOpen(false);
  }, [navigate]);

  const handleScroll = useCallback((): void => {
    const container = scrollContainerRef.current;
    if (!container || isFetchingNextPage || !hasNextPage) return;
    
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (scrollBottom < 200) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen, handleScroll]);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = scrollContainerRef.current;
    if (!trigger || !container || !isOpen || !hasNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
      { root: container, rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMarkAllAsRead = useCallback(async (): Promise<void> => {
    if (unreadCount === 0) return;
    markAllAsReadMutation.mutate();
  }, [unreadCount, markAllAsReadMutation]);

  const handleClose = useCallback((e?: React.MouseEvent): void => {
    e?.stopPropagation();
    setIsOpen(false);
  }, []);

  const { realTimeNotifications } = useNotificationStore();
  
  const apiNotifications = data?.pages.flatMap((page) => page.data) ?? [];
  
  const mergedNotifications = [
    ...realTimeNotifications.filter((n) => !apiNotifications.some((apiN) => apiN.id === n.id)),
    ...apiNotifications,
  ].sort((a, b) => {
    const dateA = new Date(a.createdDate || a.timestamp || 0).getTime();
    const dateB = new Date(b.createdDate || b.timestamp || 0).getTime();
    return dateB - dateA;
  });
  
  const notifications = mergedNotifications;
  const isLoadingInitial = isLoading && notifications.length === 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-[#1a1025] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200" 
        sideOffset={8}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{t('notification.title')}</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/20">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            aria-label={t('notification.close')}
          >
            <X size={16} />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="max-h-64 overflow-y-auto custom-scrollbar"
        >
          {isLoadingInitial ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {t('notification.loading')}...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              {t('notification.noNotifications')}
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onNavigate={handleNavigate}
                />
              ))}
              {hasNextPage && <div ref={loadMoreTriggerRef} className="h-4" />}
              {isFetchingNextPage && (
                <div className="p-2 text-center text-xs text-slate-500">
                  {t('notification.loading')}...
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 bg-[#1a1025]">
          <button 
            type="button"
            onClick={handleMarkAllAsRead} 
            className="hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/50 rounded px-2 py-1"
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          >
            {t('notification.markAllAsRead')}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}