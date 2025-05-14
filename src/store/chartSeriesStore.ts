import { create } from 'zustand';
import type { CalculatedSeriesDto } from '../types/dto/calculatedSeries.dto';
import type { IndicatorSeriesKey } from './storeUtils';

// Interface for the state managed by this store
interface ChartSeriesState {
    plottedIndicatorKeys: Set<IndicatorSeriesKey>;
    calculatedSeries: CalculatedSeriesDto[];
}

// Interface for the actions available in this store
interface ChartSeriesActions {
    togglePlottedIndicator: (key: IndicatorSeriesKey) => void;
    setPlottedIndicators: (keys: Set<IndicatorSeriesKey>) => void;
    addCalculatedSeries: (series: CalculatedSeriesDto) => void;
    removeCalculatedSeries: (variableCode: string) => void;
    clearAllCalculatedSeries: () => void; // This will also clear them from plottedIndicatorKeys
    resetChartSeriesStore: () => void;
}

// Initial state for chart series data
const initialChartSeriesState: ChartSeriesState = {
    plottedIndicatorKeys: new Set(),
    calculatedSeries: [],
};

/**
 * Zustand store for managing chart series, including plotted indicators and calculated series.
 */
export const useChartSeriesStore = create<ChartSeriesState & ChartSeriesActions>((set) => ({
    ...initialChartSeriesState,

    togglePlottedIndicator: (key) =>
        set((state) => {
            const newKeys = new Set(state.plottedIndicatorKeys);
            if (newKeys.has(key)) {
                newKeys.delete(key);
            } else {
                newKeys.add(key);
            }
            return { plottedIndicatorKeys: newKeys };
        }),

    setPlottedIndicators: (keys) => set({ plottedIndicatorKeys: new Set(keys) }),

    addCalculatedSeries: (series) =>
        set((state) => ({
            calculatedSeries: [
                ...state.calculatedSeries.filter(cs => cs.variableCode !== series.variableCode),
                series,
            ],
        })),

    removeCalculatedSeries: (variableCodeToRemove) =>
        set((state) => {
            const newPlottedKeys = new Set(state.plottedIndicatorKeys);
            newPlottedKeys.delete(variableCodeToRemove);
            return {
                calculatedSeries: state.calculatedSeries.filter(
                    (series) => series.variableCode !== variableCodeToRemove
                ),
                plottedIndicatorKeys: newPlottedKeys,
            };
        }),

    clearAllCalculatedSeries: () =>
        set((state) => {
            const newPlottedKeys = new Set(state.plottedIndicatorKeys);
            state.calculatedSeries.forEach(cs => newPlottedKeys.delete(cs.variableCode));
            return {
                calculatedSeries: [],
                plottedIndicatorKeys: newPlottedKeys,
            };
        }),

    resetChartSeriesStore: () => set(initialChartSeriesState),
}));