import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ContactStats } from './ContactStats';
import { ContactTable } from './ContactTable';
import { ContactForm } from './ContactForm';
import { useCreateContact } from '../hooks/useCreateContact';
import { useUpdateContact } from '../hooks/useUpdateContact';
import type { ContactDto } from '../types/contact-types';
import type { ContactFormSchema } from '../types/contact-types';

export function ContactManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters] = useState<Record<string, unknown>>({});

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  useEffect(() => {
    setPageTitle(t('contactManagement.menu', 'İletişim Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const handleEdit = (contact: ContactDto): void => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ContactFormSchema): Promise<void> => {
    if (editingContact) {
      await updateContact.mutateAsync({
        id: editingContact.id,
        data: {
          fullName: data.fullName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          mobile: data.mobile || undefined,
          notes: data.notes || undefined,
          customerId: data.customerId,
          titleId: data.titleId,
        },
      });
    } else {
      await createContact.mutateAsync({
        fullName: data.fullName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        mobile: data.mobile || undefined,
        notes: data.notes || undefined,
        customerId: data.customerId,
        titleId: data.titleId,
      });
    }
    setFormOpen(false);
    setEditingContact(null);
  };

  const handleSortChange = (newSortBy: string, newSortDirection: 'asc' | 'desc'): void => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setPageNumber(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('contactManagement.menu', 'İletişim Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('contactManagement.description', 'İletişimleri yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('contactManagement.addButton', 'Yeni İletişim Ekle')}
        </Button>
      </div>

      <ContactStats />

      <div className="space-y-4">
        <ContactTable
          onEdit={handleEdit}
          pageNumber={pageNumber}
          pageSize={pageSize}
          sortBy={sortBy}
          sortDirection={sortDirection}
          filters={filters}
          onPageChange={setPageNumber}
          onSortChange={handleSortChange}
        />
      </div>

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        contact={editingContact}
        isLoading={createContact.isPending || updateContact.isPending}
      />
    </div>
  );
}
