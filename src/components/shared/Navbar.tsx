import { type ReactElement, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Search, X, Command } from 'lucide-react'; // Command ikonu eklendi

import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationIcon } from '@/features/notification/components/NotificationIcon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserDetailDialog } from '@/features/user-detail-management/components/UserDetailDialog';
import { useUserDetailByUserId } from '@/features/user-detail-management/hooks/useUserDetailByUserId';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';

export function Navbar(): ReactElement {
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { toggleSidebar, searchQuery, setSearchQuery, setSidebarOpen } = useUIStore(); 
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const { data: userDetail } = useUserDetailByUserId(user?.id || 0);

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'MK';

  // --- CTRL + K Kısa Yolu ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          "h-20 px-8 flex items-center justify-between border-b transition-all sticky top-0 z-40 shrink-0",
          // Glassmorphism Efekti
          "backdrop-blur-xl border-slate-200 bg-white/80", 
          "dark:border-white/5 dark:bg-[#0c0516]/80"
        )}
      >
        
        <div className="flex items-center gap-6 flex-1">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-all focus:outline-none lg:hidden"
          >
            <Menu size={24} />
          </button>

          {/* --- MODERN ARAMA ALANI (COMMAND PALETTE STYLE) --- */}
          <div className="relative hidden md:block w-full max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400 w-5 h-5 group-focus-within:text-pink-500 transition-colors duration-300" />
              
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery} 
                onChange={handleSearch} 
                placeholder={t('navbar.search_placeholder', 'Hızlı arama yap...')}
                className={cn(
                  "w-full py-3 pl-12 pr-24 text-sm font-medium transition-all duration-300 outline-none rounded-2xl border",
                  // Light Mode
                  "bg-slate-100/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-pink-500/30",
                  // Dark Mode
                  "dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#150a25]",
                  // Focus Glow Efekti
                  "focus:ring-4 focus:ring-pink-500/10 focus:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                )}
              />

              {/* Sağdaki İkonlar / Kısayol İpucu */}
              <div className="absolute right-3 flex items-center gap-2">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
                    <Command size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 font-mono">K</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- SAĞ TARAF (Profil & Ayarlar) --- */}
        <div className="flex items-center gap-3 sm:gap-6 pl-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-500 hover:text-pink-500 dark:text-slate-400 dark:hover:text-pink-400 flex items-center justify-center group">
               <NotificationIcon />
            </div>
            
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400 cursor-pointer flex items-center justify-center">
              <ThemeToggle />
            </div>
          </div>

          {user && (
            <div 
              onClick={() => setUserDetailDialogOpen(true)} 
              className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-200 dark:border-white/10 cursor-pointer group"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-pink-500 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                  {t('roles.admin', 'Yönetici')}
                </p>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-orange-500 to-yellow-500 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0516] flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#0c0516]">
                    {userDetail?.profilePictureUrl ? (
                      <img
                        src={getImageUrl(userDetail.profilePictureUrl) || ''}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-orange-500">
                        {displayInitials}
                      </span>
                    )}
                  </div>
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0c0516] rounded-full"></div>
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