import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContactList } from '../hooks/useContactList';
import { useDeleteContact } from '../hooks/useDeleteContact';
import type { ContactDto } from '../types/contact-types';
import type { PagedFilter } from '@/types/api';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Mail, 
  Phone, 
  Smartphone,
  Calendar,
  User,
  Building2,
  Briefcase
} from 'lucide-react';

interface ContactTableProps {
  onEdit: (contact: ContactDto) => void;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: PagedFilter[] | Record<string, unknown>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export function ContactTable({
  onEdit,
  pageNumber,
  pageSize,
  sortBy = 'Id',
  sortDirection = 'desc',
  filters = {},
  onPageChange,
  onSortChange,
}: ContactTableProps): ReactElement {
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);

  const { data, isLoading, isFetching } = useContactList({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    filters: filters as PagedFilter[] | undefined,
  });

  const deleteContact = useDeleteContact();

  const handleDeleteClick = (contact: ContactDto): void => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedContact) {
      await deleteContact.mutateAsync(selectedContact.id);
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  const handleSort = (column: string): void => {
    const newDirection =
      sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newDirection);
  };

  const SortIcon = ({ column }: { column: string }): ReactElement => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="ml-2 inline-block text-slate-400 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    ) : (
      <ArrowDown size={14} className="ml-2 inline-block text-pink-600 dark:text-pink-400" />
    );
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
           <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <span className="text-sm font-medium text-muted-foreground animate-pulse">
             {t('contactManagement.loading', 'Yükleniyor...')}
           </span>
        </div>
      </div>
    );
  }

  const contacts = data?.data || (data as any)?.items || [];

  if (!data || contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[500px]">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-8 py-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm font-medium">
          {t('contactManagement.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  // --- TASARIM STİLLERİ ---
  const headStyle = `
    cursor-pointer select-none 
    text-slate-500 dark:text-slate-400 
    font-bold text-xs uppercase tracking-wider 
    py-5 px-5 
    hover:text-pink-600 dark:hover:text-pink-400 
    transition-colors 
    border-r border-slate-200 dark:border-white/[0.03] last:border-r-0
    bg-slate-50/90 dark:bg-[#130822]/90
    whitespace-nowrap
  `;

  const cellStyle = `
    text-slate-600 dark:text-slate-400 
    px-5 py-4
    border-r border-slate-100 dark:border-white/[0.03] last:border-r-0
    text-sm align-top
  `;

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-[#1a1025]/40 backdrop-blur-sm min-h-[65vh] flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 z-20 shadow-sm">
              <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
                
                <TableHead onClick={() => handleSort('Id')} className={headStyle}>
                  <div className="flex items-center">
                    {t('contactManagement.table.id', 'ID')}
                    <SortIcon column="Id" />
                  </div>
                </TableHead>

                <TableHead onClick={() => handleSort('FullName')} className={headStyle}>
                  <div className="flex items-center">
                    {t('contactManagement.table.fullName', 'Ad Soyad')}
                    <SortIcon column="FullName" />
                  </div>
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.email', 'E-posta')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.phone', 'Telefon')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.mobile', 'Mobil')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.customer', 'Müşteri')}
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.title', 'Ünvan')}
                </TableHead>

                <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                  <div className="flex items-center">
                    {t('contactManagement.table.createdDate', 'Oluşturulma')}
                    <SortIcon column="CreatedDate" />
                  </div>
                </TableHead>

                <TableHead className={headStyle}>
                  {t('contactManagement.table.createdBy', 'Oluşturan')}
                </TableHead>

                <TableHead className={`${headStyle} text-right`}>
                  {t('contactManagement.actions', 'İşlemler')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact: ContactDto, index: number) => (
                <TableRow 
                  key={contact.id || `contact-${index}`}
                  className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
                >
                  <TableCell className={`${cellStyle} font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors`}>
                      {contact.id}
                  </TableCell>
                  
                  <TableCell className={`${cellStyle} font-semibold text-slate-900 dark:text-white min-w-[150px]`}>
                      {contact.fullName}
                  </TableCell>

                  <TableCell className={`${cellStyle} min-w-[180px] break-all`}>
                      {contact.email ? (
                          <div className="flex items-start gap-2">
                               <Mail size={14} className="text-blue-500 mt-0.5 shrink-0" /> 
                               <span>{contact.email}</span>
                          </div>
                      ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                      {contact.phone ? (
                          <div className="flex items-center gap-2">
                               <Phone size={14} className="text-orange-500" /> {contact.phone}
                          </div>
                      ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                      {contact.mobile ? (
                          <div className="flex items-center gap-2">
                               <Smartphone size={14} className="text-green-500" /> {contact.mobile}
                          </div>
                      ) : '-'}
                  </TableCell>

                  {/* Müşteri Adı - Uzun olabilir, wrap izin verdik ve min-width ekledik */}
                  <TableCell className={`${cellStyle} min-w-[200px]`}>
                      {contact.customerName ? (
                           <div className="flex items-start gap-2">
                               <Building2 size={14} className="text-slate-400 mt-0.5 shrink-0" /> 
                               <span>{contact.customerName}</span>
                          </div>
                      ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} min-w-[150px]`}>
                      {contact.titleName ? (
                          <div className="flex items-start gap-2">
                               <Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0" /> 
                               <span>{contact.titleName}</span>
                          </div>
                      ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                      <div className="flex items-center gap-2 text-xs">
                          <Calendar size={14} className="text-pink-500/50" />
                          {new Date(contact.createdDate).toLocaleDateString(i18n.language)}
                      </div>
                  </TableCell>

                  <TableCell className={`${cellStyle} whitespace-nowrap`}>
                       {contact.createdByFullUser ? (
                          <div className="flex items-center gap-2 text-xs">
                               <User size={14} className="text-indigo-500/50" /> {contact.createdByFullUser}
                          </div>
                      ) : '-'}
                  </TableCell>

                  <TableCell className={`${cellStyle} text-right`}>
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        onClick={() => onEdit(contact)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(contact)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4 px-2">
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {t('contactManagement.table.showing', '{{from}}-{{to}} / {{total}} kayıt', {
            from: (pageNumber - 1) * pageSize + 1,
            to: Math.min(pageNumber * pageSize, data.totalCount || 0),
            total: data.totalCount || 0,
          })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-8 px-4"
          >
            {t('contactManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-bold text-slate-700 dark:text-white bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 h-8">
            {pageNumber} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-8 px-4"
          >
            {t('contactManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {t('contactManagement.delete.confirmTitle', 'İletişimi Sil')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('contactManagement.delete.confirmMessage', '{{name}} iletişimini silmek istediğinizden emin misiniz?', {
                name: selectedContact?.fullName || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteContact.isPending}
              className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              {t('contactManagement.cancel', 'İptal')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteContact.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900/50 dark:hover:bg-red-900/70 border border-transparent dark:border-red-500/20 text-white"
            >
              {deleteContact.isPending
                ? t('contactManagement.loading', 'Yükleniyor...')
                : t('contactManagement.delete.action', 'Sil')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}