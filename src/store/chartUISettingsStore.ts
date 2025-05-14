import { create } from 'zustand';
import type { IndicatorSeriesKey, YAxisId } from './storeUtils'; // Assuming storeUtils.ts

// Interface for the state managed by this store
interface ChartUISettingsState {
    showDotsOnLines: boolean;
    customSeriesNames: Record<IndicatorSeriesKey, string>;
    customYAxisLabels: Record<YAxisId, string>;
}

// Interface for the actions available in this store
interface ChartUISettingsActions {
    toggleShowDotsOnLines: () => void;
    setCustomSeriesName: (seriesKey: IndicatorSeriesKey, customName: string) => void;
    clearCustomSeriesName: (seriesKey: IndicatorSeriesKey) => void;
    setCustomYAxisLabel: (yAxisId: YAxisId, label: string) => void;
    clearCustomYAxisLabel: (yAxisId: YAxisId) => void;
    resetChartUISettings: () => void;
}

// Initial state for chart UI settings
const initialChartUISettingsState: ChartUISettingsState = {
    showDotsOnLines: true,
    customSeriesNames: {},
    customYAxisLabels: {},
};

/**
 * Zustand store for managing UI settings and customizations for charts.
 */
export const useChartUISettingsStore = create<ChartUISettingsState & ChartUISettingsActions>((set) => ({
    ...initialChartUISettingsState,

    toggleShowDotsOnLines: () =>
        set((state) => ({
            showDotsOnLines: !state.showDotsOnLines,
        })),

    setCustomSeriesName: (seriesKey, customName) =>
        set((state) => {
            const newCustomNames = { ...state.customSeriesNames };
            if (customName.trim() === '') { // If name is empty, clear it
                delete newCustomNames[seriesKey];
            } else {
                newCustomNames[seriesKey] = customName;
            }
            return { customSeriesNames: newCustomNames };
        }),

    clearCustomSeriesName: (seriesKey) =>
        set((state) => {
            const newCustomNames = { ...state.customSeriesNames };
            delete newCustomNames[seriesKey];
            return { customSeriesNames: newCustomNames };
        }),

    setCustomYAxisLabel: (yAxisId, label) =>
        set((state) => {
            const newCustomLabels = { ...state.customYAxisLabels };
            if (label.trim() === '') { // If label is empty, clear it
                delete newCustomLabels[yAxisId];
            } else {
                newCustomLabels[yAxisId] = label;
            }
            return { customYAxisLabels: newCustomLabels };
        }),

    clearCustomYAxisLabel: (yAxisId) =>
        set((state) => {
            const newCustomLabels = { ...state.customYAxisLabels };
            delete newCustomLabels[yAxisId];
            return { customYAxisLabels: newCustomLabels };
        }),

    resetChartUISettings: () => set(initialChartUISettingsState),
}));