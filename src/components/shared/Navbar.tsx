import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserDetailDialog } from '@/features/user-detail-management/components/UserDetailDialog';
import { useUserDetailByUserId } from '@/features/user-detail-management/hooks/useUserDetailByUserId';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, pageTitle } = useUIStore();
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const { data: userDetail } = useUserDetailByUserId(user?.id || 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('hidden lg:flex', !isSidebarOpen && 'lg:flex')}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </Button>
          <h1 className="text-xl font-semibold">{pageTitle || t('navbar.crm')}</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher />
          <NotificationIcon />
          <ThemeToggle />
          {user && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => setUserDetailDialogOpen(true)}
            >
              {userDetail?.profilePictureUrl ? (
                <img
                  src={getImageUrl(userDetail.profilePictureUrl) || ''}
                  alt={user.name || user.email}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm hidden sm:inline">{user.name || user.email}</span>
            </div>
          )}
        </div>
      </div>
      <UserDetailDialog 
        open={userDetailDialogOpen} 
        onOpenChange={setUserDetailDialogOpen} 
      />
    </header>
  );
}
