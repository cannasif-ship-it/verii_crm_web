import { type ReactElement, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApprovalFlowStepList } from '../hooks/useApprovalFlowStepList';
import { useCreateApprovalFlowStep } from '../hooks/useCreateApprovalFlowStep';
import { useUpdateApprovalFlowStep } from '../hooks/useUpdateApprovalFlowStep';
import { useDeleteApprovalFlowStep } from '../hooks/useDeleteApprovalFlowStep';
import { useApprovalRoleGroupOptions } from '../hooks/useApprovalRoleGroupOptions';
import type { ApprovalFlowStepGetDto } from '../types/approval-flow-step-types';

interface ApprovalFlowStepListProps {
  approvalFlowId: number;
}

const stepFormSchema = z.object({
  approvalRoleGroupId: z.number().min(1, 'approvalFlowStep.form.approvalRoleGroupId.required'),
});

type StepFormSchema = z.infer<typeof stepFormSchema>;

export function ApprovalFlowStepList({ approvalFlowId }: ApprovalFlowStepListProps): ReactElement {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ApprovalFlowStepGetDto | null>(null);
  const dragItemRef = useRef<number | null>(null);

  const { data: steps = [], isLoading } = useApprovalFlowStepList(approvalFlowId);
  const { data: roleGroupOptions = [] } = useApprovalRoleGroupOptions();
  const createStep = useCreateApprovalFlowStep();
  const updateStep = useUpdateApprovalFlowStep();
  const deleteStep = useDeleteApprovalFlowStep();

  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  const form = useForm<StepFormSchema>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      approvalRoleGroupId: 0,
    },
  });

  const handleDragStart = (index: number): void => {
    dragItemRef.current = index;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = (): void => {
    if (draggedIndex === null || dragItemRef.current === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      dragItemRef.current = null;
      return;
    }

    const sourceIndex = dragItemRef.current;
    const targetIndex = dragOverIndex;

    if (targetIndex !== null && sourceIndex !== null && sourceIndex !== targetIndex && targetIndex >= 0 && targetIndex < sortedSteps.length) {
      const movedStep = sortedSteps[sourceIndex];
      const newSteps: ApprovalFlowStepGetDto[] = [];

      for (let i = 0; i < sortedSteps.length; i++) {
        if (i === sourceIndex) {
          continue;
        }
        if (i === targetIndex) {
          if (sourceIndex < targetIndex) {
            newSteps.push(sortedSteps[i]);
            newSteps.push(movedStep);
          } else {
            newSteps.push(movedStep);
            newSteps.push(sortedSteps[i]);
          }
        } else {
          newSteps.push(sortedSteps[i]);
        }
      }

      const updates = newSteps.map((step, index) => ({
        id: step.id,
        data: {
          approvalFlowId: step.approvalFlowId,
          stepOrder: index + 1,
          approvalRoleGroupId: step.approvalRoleGroupId,
        },
      }));

      Promise.all(updates.map(({ id, data }) => updateStep.mutateAsync({ id, data }))).catch(() => {});
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleAddClick = (): void => {
    setEditingStep(null);
    form.reset({ approvalRoleGroupId: 0 });
    setFormOpen(true);
  };

  const handleEditClick = (step: ApprovalFlowStepGetDto): void => {
    setEditingStep(step);
    form.reset({ approvalRoleGroupId: step.approvalRoleGroupId });
    setFormOpen(true);
  };

  const handleDeleteClick = (step: ApprovalFlowStepGetDto): void => {
    if (confirm(t('approvalFlowStep.messages.deleteConfirm', 'Bu adımı silmek istediğinizden emin misiniz?'))) {
      deleteStep.mutate({ id: step.id, approvalFlowId: step.approvalFlowId });
    }
  };

  const handleFormSubmit = async (data: StepFormSchema): Promise<void> => {
    if (editingStep) {
      await updateStep.mutateAsync({
        id: editingStep.id,
        data: {
          approvalFlowId: editingStep.approvalFlowId,
          stepOrder: editingStep.stepOrder,
          approvalRoleGroupId: data.approvalRoleGroupId,
        },
      });
    } else {
      const maxOrder = sortedSteps.length > 0 ? Math.max(...sortedSteps.map((s) => s.stepOrder)) : 0;
      await createStep.mutateAsync({
        approvalFlowId,
        stepOrder: maxOrder + 1,
        approvalRoleGroupId: data.approvalRoleGroupId,
      });
    }
    setFormOpen(false);
    setEditingStep(null);
    form.reset();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('approvalFlowStep.title', 'Akış Adımları')}
            </CardTitle>
            <Button onClick={handleAddClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('approvalFlowStep.addButton', 'Adım Ekle')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              {t('common.loading', 'Yükleniyor...')}
            </div>
          ) : sortedSteps.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {t('approvalFlowStep.empty', 'Henüz adım eklenmemiş')}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSteps.map((step, index) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 p-3 border rounded-lg cursor-move
                    transition-all hover:bg-accent
                    ${draggedIndex === index ? 'opacity-50' : ''}
                    ${dragOverIndex === index && draggedIndex !== index ? 'border-primary bg-accent' : ''}
                  `}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {step.stepOrder}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {step.approvalRoleGroupName || t('approvalFlowStep.unknownRoleGroup', 'Rol Grubu Yok')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(step)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(step)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStep
                ? t('approvalFlowStep.form.editTitle', 'Adım Düzenle')
                : t('approvalFlowStep.form.addTitle', 'Yeni Adım Ekle')}
            </DialogTitle>
            <DialogDescription>
              {editingStep
                ? t('approvalFlowStep.form.editDescription', 'Akış adımı bilgilerini düzenleyin')
                : t('approvalFlowStep.form.addDescription', 'Yeni akış adımı ekleyin')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="approvalRoleGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('approvalFlowStep.form.approvalRoleGroup', 'Rol Grubu')} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value && field.value !== 0 ? field.value.toString() : '0'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('approvalFlowStep.form.selectRoleGroup', 'Rol grubu seçin')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">
                          {t('approvalFlowStep.form.noRoleGroupSelected', 'Rol grubu seçilmedi')}
                        </SelectItem>
                        {roleGroupOptions.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={createStep.isPending || updateStep.isPending}
                >
                  {t('common.cancel', 'İptal')}
                </Button>
                <Button
                  type="submit"
                  disabled={createStep.isPending || updateStep.isPending}
                >
                  {createStep.isPending || updateStep.isPending
                    ? t('common.saving', 'Kaydediliyor...')
                    : t('common.save', 'Kaydet')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
