import { type ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { usePermissionDefinitionsQuery } from '../hooks/usePermissionDefinitionsQuery';
import { getPermissionDisplayMeta, isLeafPermissionCode } from '../utils/permission-config';

interface PermissionDefinitionMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export function PermissionDefinitionMultiSelect({
  value,
  onChange,
  disabled = false,
}: PermissionDefinitionMultiSelectProps): ReactElement {
  const { t } = useTranslation(['access-control', 'common']);
  const { data, isLoading } = usePermissionDefinitionsQuery({
    pageNumber: 1,
    pageSize: 1000,
    sortBy: 'code',
    sortDirection: 'asc',
  });

  const items = (data?.data ?? []).filter((d) => d.isActive && isLeafPermissionCode(d.code));
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const meta = getPermissionDisplayMeta(item.code);
      const display = meta ? t(meta.key, meta.fallback) : item.name ?? '';
      return (item.code ?? '').toLowerCase().includes(q) || (item.name ?? '').toLowerCase().includes(q) || display.toLowerCase().includes(q);
    });
  }, [items, search, t]);

  const handleToggle = (id: number): void => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      onChange(filteredItems.map((i) => i.id));
    } else {
      onChange([]);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500 py-4">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <div className="space-y-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('permissionGroups.search', 'Ara...')}
        disabled={disabled}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="select-all-permissions"
          checked={filteredItems.length > 0 && value.length === filteredItems.length}
          onCheckedChange={(c) => handleSelectAll(!!c)}
          disabled={disabled || filteredItems.length === 0}
        />
        <label htmlFor="select-all-permissions" className="text-sm font-medium cursor-pointer">
          {t('permissionGroups.selectAll', 'Select all')}
        </label>
      </div>
      <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2 space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">{t('permissionGroups.noDefinitions', 'No permission definitions available')}</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                id={`perm-${item.id}`}
                checked={value.includes(item.id)}
                onCheckedChange={() => handleToggle(item.id)}
                disabled={disabled}
              />
              <label htmlFor={`perm-${item.id}`} className="text-sm cursor-pointer flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{item.name || (getPermissionDisplayMeta(item.code)?.key ? t(getPermissionDisplayMeta(item.code)!.key, getPermissionDisplayMeta(item.code)!.fallback) : '') || item.code}</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.code}</span>
                </div>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
