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
// Modern ikonlar için Lucide importları
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

  // Modern Lucide İkonlu Sort Bileşeni
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

  // Loading Durumu
  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current text-pink-500" />
           <div className="text-sm text-muted-foreground animate-pulse">
             {t('contactManagement.loading', 'Yükleniyor...')}
           </div>
        </div>
      </div>
    );
  }

  const contacts = data?.data || (data as any)?.items || [];

  // Veri Yok Durumu
  if (!data || contacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground bg-slate-50 dark:bg-white/5 px-6 py-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
          {t('contactManagement.noData', 'Veri yok')}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / pageSize);

  // Ortak Başlık Stili
  const headStyle = "cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors py-4";

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/50 dark:bg-transparent">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5">
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

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.email', 'E-posta')}
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.phone', 'Telefon')}
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.mobile', 'Mobil')}
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.customer', 'Müşteri')}
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.title', 'Ünvan')}
              </TableHead>

              <TableHead onClick={() => handleSort('CreatedDate')} className={headStyle}>
                <div className="flex items-center">
                  {t('contactManagement.table.createdDate', 'Oluşturulma Tarihi')}
                  <SortIcon column="CreatedDate" />
                </div>
              </TableHead>

              <TableHead className="text-slate-500 dark:text-slate-400">
                {t('contactManagement.table.createdBy', 'Oluşturan')}
              </TableHead>

              <TableHead className="text-right text-slate-500 dark:text-slate-400">
                {t('contactManagement.actions', 'İşlemler')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact: ContactDto, index: number) => (
              <TableRow 
                key={contact.id || `contact-${index}`}
                // Hover Efekti ve Grup Class'ı
                className="border-b border-slate-100 dark:border-white/5 transition-colors duration-200 hover:bg-pink-50/40 dark:hover:bg-pink-500/5 group"
              >
                <TableCell className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {contact.id}
                </TableCell>
                
                <TableCell className="font-medium text-slate-900 dark:text-white">
                    {contact.fullName}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {contact.email ? (
                        <div className="flex items-center gap-2">
                             <Mail size={12} className="text-blue-500" /> {contact.email}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {contact.phone ? (
                        <div className="flex items-center gap-2">
                             <Phone size={12} className="text-orange-500" /> {contact.phone}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    {contact.mobile ? (
                        <div className="flex items-center gap-2">
                             <Smartphone size={12} className="text-green-500" /> {contact.mobile}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                    {contact.customerName ? (
                         <div className="flex items-center gap-2">
                             <Building2 size={14} className="text-slate-400" /> {contact.customerName}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                    {contact.titleName ? (
                        <div className="flex items-center gap-2">
                             <Briefcase size={14} className="text-slate-400" /> {contact.titleName}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-pink-500/50" />
                        {new Date(contact.createdDate).toLocaleDateString(i18n.language)}
                    </div>
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400 text-xs">
                     {contact.createdByFullUser ? (
                        <div className="flex items-center gap-2">
                             <User size={14} className="text-indigo-500/50" /> {contact.createdByFullUser}
                        </div>
                    ) : '-'}
                </TableCell>

                <TableCell className="text-right">
                  {/* Butonlar varsayılan olarak gizli (opacity-0), hover yapınca görünür */}
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

      {/* Pagination (Tasarım Giydirilmiş) */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('contactManagement.table.showing', '{{from}}-{{to}} / {{total}} gösteriliyor', {
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
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('contactManagement.previous', 'Önceki')}
          </Button>
          <div className="flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('contactManagement.table.page', 'Sayfa {{current}} / {{total}}', {
              current: pageNumber,
              total: totalPages,
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            {t('contactManagement.next', 'Sonraki')}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-2xl">
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