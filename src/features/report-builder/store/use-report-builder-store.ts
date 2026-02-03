import { create } from 'zustand';
import { reportingApi } from '../api/reporting-api';
import { reportsApi } from '../api/reports-api';
import type {
  ReportConfig,
  ReportConfigSorting,
  ReportConfigFilter,
  ReportDto,
  Field,
  ConnectionDto,
  ChartType,
  Aggregation,
  DateGrouping,
} from '../types';

const DEFAULT_CONFIG: ReportConfig = {
  chartType: 'table',
  values: [],
  filters: [],
};

interface BuilderMeta {
  id?: number;
  name: string;
  description?: string;
  connectionKey: string;
  dataSourceType: string;
  dataSourceName: string;
}

interface BuilderUI {
  connectionsLoading: boolean;
  checkLoading: boolean;
  previewLoading: boolean;
  saveLoading: boolean;
  error: string | null;
  slotError: string | null;
  toast: { message: string; variant: 'success' | 'error' } | null;
}

interface ReportBuilderState {
  connections: ConnectionDto[];
  meta: BuilderMeta;
  schema: Field[];
  dataSourceChecked: boolean;
  fieldsSearch: string;
  config: ReportConfig;
  preview: { columns: string[]; rows: unknown[][] };
  ui: BuilderUI;
  setMeta: (patch: Partial<BuilderMeta>) => void;
  setFieldsSearch: (v: string) => void;
  setConfig: (patch: Partial<ReportConfig>) => void;
  loadConnections: () => Promise<void>;
  setConnectionKey: (v: string) => void;
  setType: (v: string) => void;
  setDataSourceName: (v: string) => void;
  checkDataSource: () => Promise<void>;
  setChartType: (t: ChartType) => void;
  addToSlot: (slot: 'axis' | 'values' | 'legend' | 'filters', field: string, options?: { aggregation?: Aggregation }) => void;
  removeFromSlot: (slot: 'axis' | 'values' | 'legend' | 'filters', indexOrField: number | string) => void;
  reorderSlot: (slot: 'values' | 'filters', fromIndex: number, toIndex: number) => void;
  setAggregation: (valuesIndex: number, aggregation: Aggregation) => void;
  setDateGrouping: (grouping: DateGrouping) => void;
  setSorting: (s: ReportConfigSorting | null) => void;
  addFilter: (f: ReportConfigFilter) => void;
  updateFilter: (index: number, patch: Partial<ReportConfigFilter>) => void;
  removeFilter: (index: number) => void;
  reorderFilter: (fromIndex: number, toIndex: number) => void;
  hydrateFromReportDetail: (report: ReportDto) => void;
  serializeConfigJson: () => string;
  previewDebounced: () => { execute: () => void; cancel: () => void };
  saveNewReport: () => Promise<ReportDto | null>;
  updateReport: () => Promise<ReportDto | null>;
  loadReportById: (id: number) => Promise<void>;
  setUi: (patch: Partial<BuilderUI>) => void;
  setPreview: (data: { columns: string[]; rows: unknown[][] }) => void;
  reset: () => void;
}

const defaultMeta: BuilderMeta = {
  name: '',
  connectionKey: '',
  dataSourceType: '',
  dataSourceName: '',
};

const defaultUi: BuilderUI = {
  connectionsLoading: false,
  checkLoading: false,
  previewLoading: false,
  saveLoading: false,
  error: null,
  slotError: null,
  toast: null,
};

const initialState = {
  connections: [] as ConnectionDto[],
  meta: { ...defaultMeta },
  schema: [] as Field[],
  dataSourceChecked: false,
  fieldsSearch: '',
  config: { ...DEFAULT_CONFIG },
  preview: { columns: [] as string[], rows: [] as unknown[][] },
  ui: { ...defaultUi },
};

export const useReportBuilderStore = create<ReportBuilderState>((set, get) => ({
  ...initialState,

  setMeta: (patch) =>
    set((s) => ({ meta: { ...s.meta, ...patch } })),

  setFieldsSearch: (v) => set({ fieldsSearch: v }),

  setConfig: (patch) =>
    set((s) => ({ config: { ...s.config, ...patch } })),

  setChartType: (t) =>
    set((s) => ({ config: { ...s.config, chartType: t } })),

  loadConnections: async () => {
    try {
      set((s) => ({ ui: { ...s.ui, connectionsLoading: true, error: null } }));
      const items = await reportingApi.getConnections();
      set({ connections: items, ui: { ...get().ui, connectionsLoading: false } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load connections';
      set((s) => ({ ui: { ...s.ui, connectionsLoading: false, error: msg } }));
    }
  },

  setConnectionKey: (v) =>
    set((s) => ({ meta: { ...s.meta, connectionKey: v } })),

  setType: (v) =>
    set((s) => ({ meta: { ...s.meta, dataSourceType: v } })),

  setDataSourceName: (v) =>
    set((s) => ({ meta: { ...s.meta, dataSourceName: v } })),

  checkDataSource: async () => {
    const { meta } = get();
    if (!meta.connectionKey?.trim() || !meta.dataSourceType || !meta.dataSourceName?.trim()) {
      get().setUi({ toast: { message: 'Connection, type ve name gerekli', variant: 'error' } });
      return;
    }
    try {
      set((s) => ({
        ui: { ...s.ui, checkLoading: true, error: null },
        dataSourceChecked: false,
      }));
      const result = await reportingApi.checkDataSource({
        connectionKey: meta.connectionKey,
        type: meta.dataSourceType,
        name: meta.dataSourceName.trim(),
      });
      const fields = result.schema ?? [];
      set((s) => ({
        schema: fields,
        config: { ...DEFAULT_CONFIG },
        preview: { columns: [], rows: [] },
        dataSourceChecked: result.exists && fields.length > 0,
        ui: { ...s.ui, checkLoading: false },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Kontrol başarısız';
      set((s) => ({
        schema: [],
        dataSourceChecked: false,
        ui: { ...s.ui, checkLoading: false, error: msg },
      }));
    }
  },

  addToSlot: (slot, field, options) => {
    set((s) => {
      const c = { ...s.config };
      if (slot === 'axis') c.axis = { field };
      if (slot === 'legend') c.legend = { field };
      if (slot === 'values') {
        const agg = options?.aggregation ?? 'sum';
        c.values = [...c.values, { field, aggregation: agg }];
      }
      if (slot === 'filters') c.filters = [...c.filters, { field, operator: 'eq' }];
      return { config: c, ui: { ...s.ui, slotError: null } };
    });
  },

  removeFromSlot: (slot, indexOrField) => {
    set((s) => {
      const c = { ...s.config };
      if (slot === 'axis') c.axis = undefined;
      if (slot === 'legend') c.legend = undefined;
      if (slot === 'values') {
        const idx = typeof indexOrField === 'number' ? indexOrField : c.values.findIndex((v) => v.field === indexOrField);
        if (idx >= 0) c.values = c.values.filter((_, i) => i !== idx);
      }
      if (slot === 'filters') {
        const idx = typeof indexOrField === 'number' ? indexOrField : c.filters.findIndex((f) => f.field === indexOrField);
        if (idx >= 0) c.filters = c.filters.filter((_, i) => i !== idx);
      }
      return { config: c };
    });
  },

  reorderSlot: (slot, fromIndex, toIndex) => {
    set((s) => {
      const c = { ...s.config };
      if (slot === 'values') {
        const arr = [...c.values];
        const [removed] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, removed);
        c.values = arr;
      }
      if (slot === 'filters') {
        const arr = [...c.filters];
        const [removed] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, removed);
        c.filters = arr;
      }
      return { config: c };
    });
  },

  setAggregation: (valuesIndex, aggregation) => {
    set((s) => {
      const values = [...s.config.values];
      if (values[valuesIndex]) values[valuesIndex] = { ...values[valuesIndex], aggregation };
      return { config: { ...s.config, values } };
    });
  },

  setDateGrouping: (grouping) => {
    set((s) => ({
      config: {
        ...s.config,
        axis: s.config.axis ? { ...s.config.axis, dateGrouping: grouping } : undefined,
      },
    }));
  },

  setSorting: (sorting) => {
    set((s) => ({ config: { ...s.config, sorting: sorting ?? undefined } }));
  },

  addFilter: (f) => {
    set((s) => ({ config: { ...s.config, filters: [...s.config.filters, f] } }));
  },

  updateFilter: (index, patch) => {
    set((s) => {
      const filters = [...s.config.filters];
      if (filters[index]) filters[index] = { ...filters[index], ...patch };
      return { config: { ...s.config, filters } };
    });
  },

  removeFilter: (index) => {
    set((s) => ({ config: { ...s.config, filters: s.config.filters.filter((_, i) => i !== index) } }));
  },

  reorderFilter: (fromIndex, toIndex) => {
    get().reorderSlot('filters', fromIndex, toIndex);
  },

  hydrateFromReportDetail: (report) => {
    set({
      meta: {
        id: report.id,
        name: report.name,
        description: report.description,
        connectionKey: report.connectionKey,
        dataSourceType: report.dataSourceType,
        dataSourceName: report.dataSourceName,
      },
    });
    try {
      const config = JSON.parse(report.configJson) as ReportConfig;
      set((_s) => ({ config: { ...DEFAULT_CONFIG, ...config } }));
    } catch {
      set((s) => ({ config: { ...s.config } }));
    }
  },

  serializeConfigJson: () => JSON.stringify(get().config),

  previewDebounced: () => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cancel = (): void => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
    };

    const execute = (): void => {
      cancel();
      const state = get();
      const { meta, config, dataSourceChecked } = state;
      if (!dataSourceChecked || !meta.connectionKey || !meta.dataSourceType || !meta.dataSourceName) return;

      timeoutId = setTimeout(async () => {
        timeoutId = null;
        set((s) => ({ ui: { ...s.ui, previewLoading: true, error: null } }));

        try {
          const configJson = JSON.stringify(config);
          const res = await reportsApi.preview({
            connectionKey: meta.connectionKey,
            dataSourceType: meta.dataSourceType,
            dataSourceName: meta.dataSourceName,
            configJson,
          });
          const rawColumns = res.columns ?? [];
          const columns = rawColumns.map((c) =>
            typeof c === 'string' ? c : (c != null && typeof c === 'object' && 'name' in c ? String((c as { name: string }).name) : String(c))
          );
          const rawRows = res.rows ?? [];
          const rows = Array.isArray(rawRows) ? rawRows : [];
          set({
            preview: { columns, rows },
            ui: { ...get().ui, previewLoading: false },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Preview failed';
          set((s) => ({ ui: { ...s.ui, previewLoading: false, error: msg } }));
        }
      }, 600);
    };

    return { execute, cancel };
  },

  saveNewReport: async () => {
    const state = get();
    const { meta, config } = state;
    if (!meta.name?.trim()) {
      get().setUi({ toast: { message: 'Name is required', variant: 'error' } });
      return null;
    }
    if (!meta.connectionKey || !meta.dataSourceType || !meta.dataSourceName) {
      get().setUi({ toast: { message: 'Connection ve data source gerekli', variant: 'error' } });
      return null;
    }
    get().setUi({ saveLoading: true });
    try {
      const body = {
        name: meta.name.trim(),
        description: meta.description,
        connectionKey: meta.connectionKey,
        dataSourceType: meta.dataSourceType,
        dataSourceName: meta.dataSourceName,
        configJson: JSON.stringify(config),
      };
      const report = await reportsApi.create(body);
      get().setUi({ saveLoading: false, toast: { message: 'Saved', variant: 'success' } });
      return report;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      get().setUi({ saveLoading: false, toast: { message: msg, variant: 'error' } });
      return null;
    }
  },

  updateReport: async () => {
    const state = get();
    const { meta, config } = state;
    if (meta.id == null) return null;
    if (!meta.name?.trim()) {
      get().setUi({ toast: { message: 'Name is required', variant: 'error' } });
      return null;
    }
    if (!meta.connectionKey || !meta.dataSourceType || !meta.dataSourceName) {
      get().setUi({ toast: { message: 'Connection ve data source gerekli', variant: 'error' } });
      return null;
    }
    get().setUi({ saveLoading: true });
    try {
      const body = {
        name: meta.name.trim(),
        description: meta.description,
        connectionKey: meta.connectionKey,
        dataSourceType: meta.dataSourceType,
        dataSourceName: meta.dataSourceName,
        configJson: JSON.stringify(config),
      };
      const report = await reportsApi.update(meta.id, body);
      get().setUi({ saveLoading: false, toast: { message: 'Updated', variant: 'success' } });
      return report;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      get().setUi({ saveLoading: false, toast: { message: msg, variant: 'error' } });
      return null;
    }
  },

  loadReportById: async (id) => {
    get().setUi({ checkLoading: true, error: null });
    try {
      const report = await reportsApi.get(id);
      get().hydrateFromReportDetail(report);
      await get().checkDataSource();
      get().setUi({ checkLoading: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load report';
      get().setUi({ checkLoading: false, error: msg });
    }
  },

  setUi: (patch) =>
    set((s) => ({ ui: { ...s.ui, ...patch } })),

  setPreview: (data) =>
    set({ preview: data }),

  reset: () => set({ ...initialState, meta: { ...defaultMeta }, ui: { ...defaultUi } }),
}));
