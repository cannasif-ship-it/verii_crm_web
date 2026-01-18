import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { UserDetailDialog } from '@/features/user-detail-management/components/UserDetailDialog';
import { useUserDetailByUserId } from '@/features/user-detail-management/hooks/useUserDetailByUserId';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { toggleSidebar, searchQuery, setSearchQuery, setSidebarOpen } = useUIStore(); 
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const { data: userDetail } = useUserDetailByUserId(user?.id || 0);

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'MK';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 0) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <header 
        className={cn(
          "h-20 px-8 flex items-center justify-between border-b border-border backdrop-blur-md sticky top-0 z-50 shrink-0 transition-all",
          // DÜZELTME BURADA:
          // Light Mode: bg-background/80 (Genelde beyaz olur)
          // Dark Mode: dark:bg-[#0c0516]/80 (Senin istediğin özel koyu renk)
          "bg-background/80 dark:bg-[#0c0516]/80"
        )}
      >
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none"
          >
            <Menu size={24} />
          </button>

          {/* Arama Alanı */}
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-pink-500 transition-colors" />
            
            <input
              type="text"
              value={searchQuery} 
              onChange={handleSearch} 
              placeholder={t('navbar.search_placeholder', 'Müşteri, Teklif, Sipariş ara...')}
              className={cn(
                "bg-secondary/50 border border-input text-foreground placeholder:text-muted-foreground",
                "rounded-full py-2.5 pl-10 pr-10 w-80 text-sm transition-all outline-none",
                // Pembe Vurgu (Focus)
                "focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20" 
              )}
            />
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative p-2 rounded-full hover:bg-accent transition-colors group cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center">
               <NotificationIcon />
            </div>
            
            <div className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center">
              <ThemeToggle />
            </div>
          </div>

          {user && (
            <div 
              onClick={() => setUserDetailDialogOpen(true)} 
              className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-foreground group-hover:text-pink-500 transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {t('roles.admin', 'Yönetici')}
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-yellow-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all">
                {/* Avatar Arkaplanı: Koyu modda özel renk, açık modda beyaz */}
                <div className="w-full h-full rounded-full bg-background dark:bg-[#0c0516] flex items-center justify-center overflow-hidden">
                  {userDetail?.profilePictureUrl ? (
                    <img
                      src={getImageUrl(userDetail.profilePictureUrl) || ''}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-orange-400">
                      {displayInitials}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <UserDetailDialog 
        open={userDetailDialogOpen} 
        onOpenChange={setUserDetailDialogOpen} 
      />
    </>
  );
}
