import { type ReactElement, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';
import { UserForm } from './UserForm';
import { useCreateUser } from '../hooks/useCreateUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import type { UserDto } from '../types/user-types';
import type { UserFormSchema, UserUpdateFormSchema } from '../types/user-types';

export function UserManagementPage(): ReactElement {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('Id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters] = useState<Record<string, unknown>>({});

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    setPageTitle(t('userManagement.menu', 'Kullanıcı Yönetimi'));
    return () => {
      setPageTitle(null);
    };
  }, [t, setPageTitle]);

  const handleAddClick = (): void => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: UserDto): void => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: UserFormSchema | UserUpdateFormSchema): Promise<void> => {
    if (editingUser) {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: data as UserUpdateFormSchema,
      });
    } else {
      await createUser.mutateAsync(data as UserFormSchema);
    }
    setFormOpen(false);
    setEditingUser(null);
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
            {t('userManagement.menu', 'Kullanıcı Yönetimi')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('userManagement.description', 'Kullanıcıları yönetin ve düzenleyin')}
          </p>
        </div>
        <Button onClick={handleAddClick}>
          {t('userManagement.addButton', 'Yeni Kullanıcı Ekle')}
        </Button>
      </div>

      <UserStats />

      <div className="space-y-4">
        <UserTable
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

      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isLoading={createUser.isPending || updateUser.isPending}
      />
    </div>
  );
}
