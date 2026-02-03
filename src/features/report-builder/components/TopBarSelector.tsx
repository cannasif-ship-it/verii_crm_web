import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectionDto } from '../types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarSelectorProps {
  connections: ConnectionDto[];
  connectionKey: string;
  dataSourceType: string;
  dataSourceName: string;
  connectionsLoading: boolean;
  checkLoading: boolean;
  onConnectionChange: (key: string) => void;
  onTypeChange: (type: string) => void;
  onNameChange: (name: string) => void;
  onCheck: () => void;
}

const TYPE_OPTIONS = [
  { value: 'view', label: 'View' },
  { value: 'function', label: 'Function' },
];

export function TopBarSelector({
  connections,
  connectionKey,
  dataSourceType,
  dataSourceName,
  connectionsLoading,
  checkLoading,
  onConnectionChange,
  onTypeChange,
  onNameChange,
  onCheck,
}: TopBarSelectorProps): ReactElement {
  const connectionList = Array.isArray(connections) ? connections : [];

  return (
    <div className={cn('flex flex-wrap items-end gap-4 border-b pb-4')}>
      <div className="space-y-1 min-w-[140px]">
        <Label className="flex items-center gap-2">
          Connection
          {connectionsLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </Label>
        <Select
          value={connectionKey || undefined}
          onValueChange={onConnectionChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="CRM / ERP" />
          </SelectTrigger>
          <SelectContent>
            {connectionList.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label ?? c.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 min-w-[100px]">
        <Label>Type</Label>
        <Select value={dataSourceType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="view / function" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 min-w-[180px]">
        <Label>Name (vw_... / fn_...)</Label>
        <Input
          placeholder="vw_... veya fn_..."
          value={dataSourceName}
          onChange={(e) => onNameChange(e.target.value)}
          className="font-mono text-sm"
        />
      </div>
      <Button onClick={onCheck} disabled={checkLoading || connectionsLoading}>
        {checkLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Kontrol
      </Button>
    </div>
  );
}
