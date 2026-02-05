import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as SelectPrimitive from '@radix-ui/react-select';
import { 
  Select,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { 
  Mail, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  User, 
  ChevronRight,
  LogOut,
  Briefcase,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/components/theme-provider';
import { useAuthStore } from '@/stores/auth-store';
import { useUserDetailByUserId } from '@/features/user-detail-management/hooks/useUserDetailByUserId';
import { getImageUrl } from '@/features/user-detail-management/utils/image-url';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProfileDetails: () => void;
}

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', short: 'DE' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', short: 'IT' },
  { code: 'es', name: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', short: 'AR' },
];

export function UserProfileModal({ 
  open, 
  onOpenChange,
  onOpenProfileDetails
}: UserProfileModalProps): ReactElement {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout, branch } = useAuthStore();
  const navigate = useNavigate();
  const { data: userDetail } = useUserDetailByUserId(user?.id || 0);

  const langCode = i18n.language?.toLowerCase() === 'sa' ? 'ar' : i18n.language?.toLowerCase().split('-')[0] ?? 'tr';
  const currentLanguage = languages.find((lang) => lang.code === langCode) || languages[0];

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const displayInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'MK';

  const handleLogout = () => {
    logout();
    onOpenChange(false);
    navigate('/login');
  };

  const darkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (value: string): void => {
    i18n.changeLanguage(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 border-none shadow-2xl overflow-hidden focus:outline-none flex flex-col md:flex-row transition-all duration-300 max-h-[90dvh] md:max-h-[85vh] w-[95vw] sm:w-full max-w-5xl rounded-2xl",
        darkMode ? "bg-[#1a1025]/98 backdrop-blur-xl border-white/10 shadow-purple-900/20" : "bg-white/98 backdrop-blur-xl border-gray-200/80 shadow-xl"
      )}>
        <DialogTitle className="sr-only">Kullanıcı Ayarları</DialogTitle>

        <div className={cn(
          "w-full md:w-[36%] min-w-0 flex flex-col items-center justify-center relative md:border-r shrink-0",
          "p-4 sm:p-6 md:p-8 py-6 md:py-8",
          darkMode ? "bg-[#150a1f]/60 border-white/10" : "bg-gray-50/80 border-gray-100"
        )}>
          <div className="flex flex-col items-center text-center w-full max-w-xs">
            <div className="relative mb-4 sm:mb-6">
              <div className={cn(
                "rounded-full overflow-hidden border-2 p-0.5 transition-transform active:scale-[0.98]",
                "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
                darkMode ? "border-white/20 shadow-lg shadow-black/20" : "border-white shadow-lg"
              )}>
                {userDetail?.profilePictureUrl ? (
                  <img
                    src={getImageUrl(userDetail.profilePictureUrl) || ''}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                      {displayInitials}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-[#0b0818] ring-2 ring-emerald-400/30" />
            </div>
            <h2 className={cn(
              "font-bold truncate w-full px-1",
              "text-lg sm:text-xl",
              darkMode ? "text-white" : "text-gray-900"
            )}>{displayName}</h2>
            <div className={cn(
              "mt-4 sm:mt-6 w-full space-y-2 sm:space-y-3 text-xs sm:text-sm min-w-0",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-transparent hover:bg-white/5 transition-colors min-h-[44px]">
                <Mail size={16} className="shrink-0 text-current" />
                <span className="truncate" title={user?.email}>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-transparent hover:bg-white/5 transition-colors min-h-[44px]">
                <Building2 size={16} className="shrink-0 text-current" />
                <span className="truncate">{branch?.name || 'Merkez Ofis'}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-transparent hover:bg-white/5 transition-colors min-h-[44px]">
                <Briefcase size={16} className="shrink-0 text-current" />
                <span className="truncate">Yönetim</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[64%] min-w-0 flex flex-col overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8 md:pl-10">
          <div className="flex justify-between items-center gap-3 mb-6 sm:mb-8 shrink-0">
            <h1 className={cn(
              "font-bold truncate min-w-0",
              "text-xl sm:text-2xl",
              darkMode ? "text-white" : "text-gray-900"
            )}>Hesap Ayarları</h1>
            <span className={cn(
              "text-[10px] sm:text-xs px-2 py-1 rounded-full shrink-0 font-medium",
              darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
            )}>v3.2.0</span>
          </div>

          <div className="flex-1 min-h-0 space-y-4 sm:space-y-6">
            <div
              onClick={onOpenProfileDetails}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenProfileDetails(); } }}
              className={cn(
                "group p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 sm:gap-4 min-h-[56px] sm:min-h-[64px]",
                "hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-purple-500/50 focus:outline-none",
                darkMode ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-purple-500/20" : "bg-white border-gray-200/80 hover:border-purple-200 hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={cn(
                  "p-2.5 sm:p-3 rounded-xl shrink-0",
                  darkMode ? "bg-purple-500/15 text-purple-400" : "bg-purple-50 text-purple-600"
                )}>
                  <User size={22} className="sm:w-6 sm:h-6 w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn("font-semibold truncate text-base sm:text-lg", darkMode ? "text-white" : "text-gray-800")}>Profil Bilgileri</h3>
                  <p className={cn("text-xs sm:text-sm truncate", darkMode ? "text-gray-400" : "text-gray-500")}>Kişisel bilgilerinizi düzenleyin</p>
                </div>
              </div>
              <ChevronRight size={20} className={cn("shrink-0 transition-transform group-hover:translate-x-0.5", darkMode ? "text-gray-500 group-hover:text-white" : "text-gray-400 group-hover:text-purple-600")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative w-full min-w-0">
                <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
                  <SelectPrimitive.Trigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[100px] sm:min-h-[128px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 hover:scale-[1.01] active:scale-[0.99]",
                        darkMode ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15" : "bg-white border-gray-200/80 hover:shadow-md hover:border-gray-300"
                      )}
                    >
                      <div className="flex justify-between items-start w-full gap-2">
                        <div className={cn("p-2 rounded-lg shrink-0", darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600")}>
                          <Globe size={20} />
                        </div>
                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg shrink-0", darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-600")}>{currentLanguage.short}</span>
                      </div>
                      <span className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>Dil Seçeneği</span>
                    </button>
                  </SelectPrimitive.Trigger>
                  <SelectContent className="z-60">
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  "w-full p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[100px] sm:min-h-[128px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 hover:scale-[1.01] active:scale-[0.99]",
                  darkMode ? "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/15" : "bg-white border-gray-200/80 hover:shadow-md hover:border-gray-300"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-lg shrink-0", darkMode ? "bg-gray-700/50 text-gray-200" : "bg-orange-100 text-orange-500")}>
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div className={cn(
                    "w-10 h-6 flex items-center rounded-full p-1 transition-colors shrink-0",
                    darkMode ? "bg-purple-600" : "bg-gray-300"
                  )}>
                    <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200", darkMode ? "translate-x-4" : "translate-x-0")} />
                  </div>
                </div>
                <span className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>Görünüm Modu</span>
              </button>
            </div>

            <div className={cn(
              "px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border flex items-center justify-between gap-3 sm:gap-4 min-h-[56px]",
              darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200/80"
            )}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn("p-2 rounded-lg shrink-0", darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                  <Bell size={18} />
                </div>
                <span className={cn("text-sm font-medium truncate", darkMode ? "text-gray-300" : "text-gray-700")}>Sistem Bildirimleri</span>
              </div>
              <div className="w-10 h-6 shrink-0 flex items-center rounded-full p-1 bg-emerald-600">
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4" />
              </div>
            </div>
          </div>

          <div className={cn(
            "mt-6 sm:mt-8 pt-4 sm:pt-6 border-t shrink-0 flex justify-end",
            darkMode ? "border-white/10" : "border-gray-200"
          )}>
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-linear-to-r from-[#e91e63] to-[#ff5722] hover:from-[#d81b60] hover:to-[#f4511e] text-white text-sm font-semibold shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
              )}
            >
              <LogOut size={18} />
              <span>Güvenli Çıkış Yap</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
