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
        "p-0 gap-0 border-none shadow-2xl overflow-hidden focus:outline-none flex flex-col md:flex-row transition-all duration-300",
        "w-full max-w-5xl rounded-2xl",
        darkMode ? "bg-[#1a1025]/95 backdrop-blur-xl border-white/10 shadow-purple-900/20" : "bg-white/95 backdrop-blur-xl border-gray-200 shadow-xl"
      )}>
        <DialogTitle className="sr-only">Kullanıcı Ayarları</DialogTitle>
        
        {/* SOL PANEL */}
        <div className={cn(
            "w-full md:w-[35%] p-8 flex flex-col items-center justify-center relative border-r",
            darkMode ? "bg-[#150a1f]/50 border-white/10" : "bg-gray-50/50 border-gray-100"
        )}>
             <div className="flex flex-col items-center text-center w-full"> 
             <div className="relative mb-6 group"> 
               <div className={`w-32 h-32 rounded-full overflow-hidden border-4 p-1 ${darkMode ? 'border-[#2d2445]' : 'border-white shadow-md'}`}> 
                  {userDetail?.profilePictureUrl ? (
                    <img
                      src={getImageUrl(userDetail.profilePictureUrl) || ''}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {displayInitials}
                      </span>
                    </div>
                  )}
               </div> 
               <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0b0818]"></div> 
             </div> 
             <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</h2> 
             <div className={`mt-8 w-full space-y-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}> 
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all">
                  <Mail size={16} className="shrink-0" />
                  <span className="truncate" title={user?.email}>{user?.email}</span>
                </div> 
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all">
                  <Building2 size={16} className="shrink-0" />
                  <span className="truncate">{branch?.name || 'Merkez Ofis'}</span>
                </div> 
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all">
                  <Briefcase size={16} className="shrink-0" />
                  <span className="truncate">Yönetim</span>
                </div> 
             </div> 
           </div> 
        </div>

        {/* SAĞ PANEL */}
        <div className="w-full md:w-[65%] p-8 md:p-10 flex flex-col">
           <div className="flex justify-between items-center mb-8"> 
             <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hesap Ayarları</h1> 
             <span className={`text-xs px-2 py-1 rounded border ${darkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'}`}>v3.2.0</span> 
           </div> 
           
           <div className="flex-1 space-y-6"> 
             {/* Kart 1: Profil Bilgileri */} 
             <div onClick={onOpenProfileDetails} className={`group p-5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${darkMode ? 'bg-[#251b30]/80 border-white/5 hover:border-purple-500/30 hover:bg-[#2d223a]' : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'}`}> 
               <div className="flex items-center gap-4 flex-1 min-w-0"> 
                 <div className={`p-3 rounded-lg shrink-0 ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}><User size={24} /></div> 
                 <div className="flex-1 min-w-0"> 
                     <h3 className={`font-semibold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>Profil Bilgileri</h3> 
                     <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Kişisel bilgilerinizi düzenleyin</p> 
                 </div> 
               </div> 
               <ChevronRight size={20} className={`shrink-0 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-gray-600 group-hover:text-white' : 'text-gray-300 group-hover:text-purple-600'}`} /> 
             </div>

             {/* Grid Kartlar: Tema ve Dil */} 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                {/* Dil */} 
          <div className="relative w-full">
            <Select value={currentLanguage.code} onValueChange={handleLanguageChange}>
              <SelectPrimitive.Trigger asChild>
                <button type="button" className={`w-full p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-32 group text-left focus:outline-none ${darkMode ? 'bg-[#251b30]/80 border-white/5 hover:border-white/10 hover:bg-[#2d223a]' : 'bg-white border-gray-200 hover:shadow-md'}`}> 
                  <div className="flex justify-between items-start w-full"> 
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><Globe size={20} /></div> 
                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{currentLanguage.short}</span> 
                  </div> 
                  <div><span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dil Seçeneği</span></div> 
                </button> 
              </SelectPrimitive.Trigger>
              <SelectContent className="z-[60]">
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

                {/* Tema */} 
                <div onClick={toggleTheme} className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-32 group ${darkMode ? 'bg-[#251b30]/80 border-white/5 hover:border-white/10 hover:bg-[#2d223a]' : 'bg-white border-gray-200 hover:shadow-md'}`}> 
                   <div className="flex justify-between items-start"> 
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-orange-100 text-orange-500'}`}>{darkMode ? <Moon size={20} /> : <Sun size={20} />}</div> 
                      <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}> 
                         <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div> 
                      </div> 
                   </div> 
                   <div><span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Görünüm Modu</span></div> 
                </div> 
             </div> 

             {/* Bildirimler */} 
             <div className={`px-5 py-4 rounded-xl border flex items-center justify-between gap-4 ${darkMode ? 'bg-[#251b30]/80 border-white/5' : 'bg-white border-gray-200'}`}> 
                 <div className="flex items-center gap-3 flex-1"> 
                     <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><Bell size={18} /></div>
                     <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sistem Bildirimleri</span> 
                 </div> 
                 <div className={`w-10 h-6 shrink-0 flex items-center rounded-full p-1 cursor-pointer bg-emerald-600`}> 
                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4`}></div> 
                 </div> 
             </div> 
           </div> 

           <div className="mt-8 pt-6 border-t border-dashed border-white/10 flex justify-end"> 
              <button onClick={handleLogout} className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#e91e63] to-[#ff5722] hover:from-[#d81b60] hover:to-[#f4511e] text-white text-sm font-semibold shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"> 
                 <LogOut size={18} /> 
                 <span>Güvenli Çıkış Yap</span> 
              </button> 
           </div> 
        </div>
      </DialogContent>
    </Dialog>
  );
}
