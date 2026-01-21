import { type ReactElement, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import Logo from '../../../public/v3logo.png';

interface NavItem {
  title: string;
  href?: string;
  icon?: ReactElement;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
}

// --- YARDIMCI: Metin Normalleştirme ---
const normalizeText = (text: string): string => {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
};

// --- 3. SEVİYE ALT MENÜ (Örn: Teklifler Grubu) ---
function SubMenuComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasActiveChild = item.children?.some(child => child.href === pathname) || false;
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-sm group select-none relative",
          isOpen || hasActiveChild
            ? "text-slate-900 dark:text-white font-medium" 
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5"
        )}
      >
        {/* truncate KALDIRILDI, yerine text-wrap eklendi */}
        <span className="whitespace-normal leading-tight text-left break-words pr-2">{item.title}</span>
        <span className="opacity-70 shrink-0">
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>

      {isOpen && (
        <div className="ml-2 mt-1 space-y-1 border-l border-slate-200 dark:border-white/10 pl-2">
          {item.children?.map((child) => {
             const isSubLinkActive = pathname === child.href;
             return (
               <Link
                 key={child.href || child.title}
                 to={child.href || '#'}
                 className={cn(
                   "flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs block w-full relative",
                   isSubLinkActive
                     ? 'bg-slate-100 text-slate-900 font-medium dark:bg-white/10 dark:text-white'
                     : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5'
                 )}
                 onClick={() => {
                   if (window.innerWidth < 1024) useUIStore.getState().setSidebarOpen(false);
                 }}
               >
                 {/* truncate KALDIRILDI */}
                 <span className="whitespace-normal leading-tight text-left break-words">{child.title}</span>
                 {isSubLinkActive && <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-pink-500 shrink-0 ml-2" />}
               </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}

// --- ANA MENÜ ELEMANI (1. Seviye) ---
function NavItemComponent({
  item,
  searchQuery,
  expandedItemKey,
  onToggle,
  isManualClick,
}: {
  item: NavItem;
  searchQuery: string;
  expandedItemKey: string | null;
  onToggle: (key: string | null) => void;
  isManualClick: boolean;
}): ReactElement {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  
  const checkIsActive = (navItem: NavItem): boolean => {
    if (navItem.href === location.pathname) return true;
    if (navItem.children) return navItem.children.some(checkIsActive);
    return false;
  };

  const hasChildren = item.children && item.children.length > 0;
  const isAnyChildActive = hasChildren && checkIsActive(item);
  const isActive = item.href ? location.pathname === item.href : false;
  
  const itemKey = item.href || item.title;
  const isExpanded = expandedItemKey === itemKey;
  const onToggleRef = useRef(onToggle);

  onToggleRef.current = onToggle;

  const matchesSearch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const normalizedQuery = normalizeText(searchQuery);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);
    if (queryWords.length === 0) return true;

    const checkMatch = (nav: NavItem): boolean => {
       const normalizedTitle = normalizeText(nav.title);
       const titleWords = normalizedTitle.split(/\s+/);
       const titleMatch = queryWords.every(q => titleWords.some(t => t.includes(q)));
       if (titleMatch) return true;
       return nav.children ? nav.children.some(checkMatch) : false;
    };

    return checkMatch(item);
  }, [item, searchQuery]);

  useEffect(() => {
    if (isAnyChildActive && hasChildren && !isExpanded && !isManualClick) {
      onToggleRef.current(itemKey);
    }
  }, [isAnyChildActive, hasChildren, itemKey, isExpanded, isManualClick]);

  if (!matchesSearch) return <></>;

  const handleIconClick = (e: React.MouseEvent): void => {
    if (!isSidebarOpen) {
      e.preventDefault(); e.stopPropagation(); setSidebarOpen(true);
      if (hasChildren) onToggleRef.current(itemKey);
    }
  };

  // --- DURUM 1: Ana Başlık ve Altında Elemanlar Var ---
  if (hasChildren) {
    const visualActive = isAnyChildActive; 
    
    return (
      <div className="mb-1">
        <button 
            type="button"
            className={cn(
                "relative flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors cursor-pointer select-none text-left group",
                visualActive 
                  ? 'bg-purple-50 dark:bg-white/5' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5',
                !isSidebarOpen && "justify-center px-0"
            )}
            onClick={() => {
                if (!isSidebarOpen) {
                  setSidebarOpen(true);
                  setTimeout(() => onToggleRef.current(itemKey), 100);
                } else {
                  onToggle(itemKey);
                }
            }}
        >
          {item.icon && (
            <div 
                className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    visualActive 
                      ? 'bg-purple-100 text-purple-700 dark:bg-pink-500/20 dark:text-pink-400' 
                      : 'bg-white border border-slate-200 text-slate-500 group-hover:text-slate-700 dark:bg-slate-800 dark:border-none dark:text-slate-400 dark:group-hover:text-white'
                )}
                onClick={handleIconClick}
            >
              {item.icon}
            </div>
          )}

          {isSidebarOpen && (
             <span className={cn(
               "flex-1 text-sm font-medium transition-colors whitespace-normal leading-tight text-left break-words pr-2", // truncate yerine wrap
               visualActive 
                 ? 'text-purple-900 font-semibold dark:text-white' 
                 : 'text-slate-600 dark:text-slate-300'
             )}>
                {item.title}
             </span>
          )}

          {isSidebarOpen && (
            <div className="text-slate-400 dark:text-slate-500 shrink-0">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}

          {visualActive && !isExpanded && !isSidebarOpen && (
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500" />
          )}
        </button>

        {isExpanded && isSidebarOpen && (
          <div className="ml-12 mt-2 space-y-1 border-l border-slate-200 dark:border-white/10 pl-2">
            {item.children?.map((child) => {
              if (child.children && child.children.length > 0) {
                 return <SubMenuComponent key={child.title} item={child} pathname={location.pathname} />;
              }

              const isSubActive = location.pathname === child.href;
              return (
                <Link
                  key={child.href}
                  to={child.href || '#'}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm block w-full relative",
                    isSubActive 
                      ? 'bg-purple-50 text-purple-700 font-semibold dark:bg-white/10 dark:text-white' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5'
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) useUIStore.getState().setSidebarOpen(false);
                  }}
                >
                  {/* truncate yerine wrap kullanıldı */}
                  <span className="whitespace-normal leading-tight text-left break-words">{child.title}</span>
                  
                  {isSubActive && <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-pink-500 shrink-0 ml-2" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- DURUM 2: Direkt Link ---
  if (!item.href) return <></>;

  return (
    <div className="mb-1">
        <Link
        to={item.href}
        className={cn(
            "relative flex items-center gap-3 rounded-xl px-3 py-2 transition-colors group",
            isActive 
              ? 'bg-purple-50 dark:bg-white/5' 
              : 'hover:bg-slate-100 dark:hover:bg-white/5',
            !isSidebarOpen && "justify-center px-0"
        )}
        onClick={(e) => {
            if (!isSidebarOpen) { e.preventDefault(); setSidebarOpen(true); } else if (window.innerWidth < 1024) { setSidebarOpen(false); }
        }}
        >
            {item.icon && (
                <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    isActive 
                      ? 'bg-purple-100 text-purple-700 dark:bg-pink-500/20 dark:text-pink-400' 
                      : 'bg-white border border-slate-200 text-slate-500 group-hover:text-slate-700 dark:bg-slate-800 dark:border-none dark:text-slate-400 dark:group-hover:text-white'
                )} onClick={handleIconClick}>
                    {item.icon}
                </div>
            )}
            
            {isSidebarOpen && (
                <span className={cn(
                  "text-sm font-medium transition-colors whitespace-normal leading-tight text-left break-words pr-2", 
                  isActive ? 'text-purple-900 font-semibold dark:text-white' : 'text-slate-600 dark:text-slate-300'
                )}>
                    {item.title}
                </span>
            )}

            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500" />
            )}
        </Link>
    </div>
  );
}

export function Sidebar({ items }: SidebarProps): ReactElement {
  const { t } = useTranslation();
  const { isSidebarOpen, searchQuery } = useUIStore(); 
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
  const [isManualClick, setIsManualClick] = useState(false);
  useEffect(() => {
    if (!isSidebarOpen) setExpandedItemKey(null);
  }, [isSidebarOpen]);

  const handleToggle = useCallback((key: string | null): void => {
    setIsManualClick(true);
    setExpandedItemKey((prev) => (key === null || prev === key ? null : key));
  }, []);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'sticky top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-2xl',
          'bg-white border-r border-slate-200 dark:bg-[#130822]/90 dark:border-white/5 dark:backdrop-blur-2xl',
          // DEĞİŞİKLİK BURADA: w-72 yerine w-80 (320px) yapıldı
          isSidebarOpen ? 'w-80' : 'w-20' 
        )}
      >
        <div className={cn(
            "h-24 flex items-center justify-center border-b border-slate-100 dark:border-white/5 shrink-0 relative",
            isSidebarOpen ? "px-4" : "px-0"
        )}>
            {isSidebarOpen ? (
                 <div className="overflow-hidden w-full flex justify-center">
                    <img 
                        src={Logo}
                        alt="Logo" 
                        className="h-28 object-contain" 
                    />
                 </div>
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                     <div className="w-full h-full flex items-center justify-center p-1">
                         <img 
                            src={Logo}
                            alt="V3" 
                            className="w-full h-full object-contain scale-150" 
                        />
                     </div>
                </div>
            )}
        </div>

        <nav className="flex-1 min-h-0 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {items.map((item, index) => (
            <NavItemComponent
              key={item.href || item.title || index}
              item={item}
              searchQuery={searchQuery}
              expandedItemKey={expandedItemKey}
              onToggle={handleToggle}
              isManualClick={isManualClick}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white/80 dark:bg-[#130822]/95 backdrop-blur-xl mt-auto">
          <button
            type="button"
            onClick={() => {
              logout();
              toast.success(t('auth.logout'));
              navigate('/auth/login');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors group",
              "hover:bg-slate-100 dark:hover:bg-white/5",
              !isSidebarOpen && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-red-400 dark:group-hover:bg-slate-800">
               <LogOut size={18} />
            </div>

            {isSidebarOpen && (
               <div className="text-left overflow-hidden">
                 <span className="text-sm font-medium block truncate text-slate-700 group-hover:text-red-600 dark:text-slate-300 dark:group-hover:text-white">
                   {t('sidebar.logout', 'Çıkış Yap')}
                 </span>
                 <span className="text-[10px] truncate block text-slate-500 dark:text-slate-600">
                   {t('auth.endSession', 'Oturumu sonlandır')}
                 </span>
               </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}