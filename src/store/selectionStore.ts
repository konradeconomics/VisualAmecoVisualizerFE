import { create } from 'zustand';
import type { CalculatedSeriesDto } from '../types/dto/calculatedSeries.dto';
//import type { IndicatorDto} from "../types/dto/indicator.dto.ts";

type SelectedVariable = { code: string; name: string };
type IndicatorSeriesKey = string;

interface ChartInteractionState {
    plottedIndicatorKeys: Set<IndicatorSeriesKey>;
    calculatedSeries: CalculatedSeriesDto[];
    
    showDotsOnLines: boolean;

    togglePlottedIndicator: (key: IndicatorSeriesKey) => void;
    setPlottedIndicators: (keys: Set<IndicatorSeriesKey>) => void; // For setting defaults or clearing
    addCalculatedSeries: (series: CalculatedSeriesDto) => void;
    removeCalculatedSeries: (variableCode: string) => void;
    clearAllCalculatedSeries: () => void;
}

interface MultiSelectionState {
    selectedCountryCodes: string[];
    selectedVariables: SelectedVariable[];
    selectedYears: number[];
    selectedChapterIds: number[];
    selectedSubchapterIds: number[];
    
    plottedIndicatorKeys: Set<IndicatorSeriesKey>;
    calculatedSeries: CalculatedSeriesDto[];
    
    toggleCountry: (code: string) => void;
    toggleVariable: (variable: SelectedVariable) => void;
    toggleYear: (year: number) => void;
    toggleChapter: (id: number) => void;
    toggleSubchapter: (id: number) => void;

    clearCountrySelections: () => void;
    clearVariableSelections: () => void;
    clearYearSelections: () => void;
    clearChapterSelections: () => void;
    clearSubchapterSelections: () => void;
    resetAllSelections: () => void;

    addCalculatedSeries: (series: CalculatedSeriesDto) => void;
    removeCalculatedSeries: (variableCode: string) => void; // Remove by its unique variableCode
    clearAllCalculatedSeries: () => void;
    
    toggleShowDotsOnLines: () => void;
}

const toggleVariableArrayItem = (
    array: SelectedVariable[],
    itemToAddOrRemove: SelectedVariable
): SelectedVariable[] => {
    const exists = array.some((item) => item.code === itemToAddOrRemove.code);
    if (exists) {
        return array.filter((item) => item.code !== itemToAddOrRemove.code);
    } else {
        return [...array, itemToAddOrRemove];
    }
};

const togglePrimitiveArrayItem = <T>(array: T[], item: T): T[] =>
    array.includes(item) ? array.filter((i) => i !== item) : [...array, item];

export const useSelectionStore = create<MultiSelectionState & ChartInteractionState>((set) => ({
    selectedCountryCodes: [],
    selectedVariables: [],
    selectedYears: [],
    selectedChapterIds: [],
    selectedSubchapterIds: [],

    showDotsOnLines: true,

    plottedIndicatorKeys: new Set(),
    calculatedSeries: [],

    toggleCountry: (code) =>
        set((state) => ({
            selectedCountryCodes: togglePrimitiveArrayItem(state.selectedCountryCodes, code),
        })),

    toggleVariable: (variable) =>
        set((state) => ({
            selectedVariables: toggleVariableArrayItem(state.selectedVariables, variable),
        })),

    toggleYear: (year) =>
        set((state) => ({
            selectedYears: togglePrimitiveArrayItem(state.selectedYears, year),
        })),

    toggleChapter: (id) =>
        set((state) => ({
            selectedChapterIds: togglePrimitiveArrayItem(state.selectedChapterIds, id),
            selectedSubchapterIds: [],
        })),

    toggleSubchapter: (id) =>
        set((state) => ({
            selectedSubchapterIds: togglePrimitiveArrayItem(state.selectedSubchapterIds, id),
        })),

    clearCountrySelections: () => set({ selectedCountryCodes: [] }),
    clearVariableSelections: () => set({ selectedVariables: [] }),
    clearYearSelections: () => set({ selectedYears: [] }),
    clearChapterSelections: () =>
        set({ selectedChapterIds: [], selectedSubchapterIds: [] }),
    clearSubchapterSelections: () => set({ selectedSubchapterIds: [] }),
    resetAllSelections: () =>
        set({
            selectedCountryCodes: [],
            selectedVariables: [],
            selectedYears: [],
            selectedChapterIds: [],
            selectedSubchapterIds: [],
            plottedIndicatorKeys: new Set(),
            calculatedSeries: [],
        }),

    togglePlottedIndicator: (key: string) =>
        set((state) => {
            const newKeys = new Set(state.plottedIndicatorKeys);
            if (newKeys.has(key)) {
                newKeys.delete(key);
            } else {
                newKeys.add(key);
            }
            return { plottedIndicatorKeys: newKeys };
        }),

    setPlottedIndicators: (keys: Iterable<string> | null | undefined) => set({ plottedIndicatorKeys: new Set(keys) }),

    addCalculatedSeries: (series) =>
        set((state) => ({
            calculatedSeries: [
                ...state.calculatedSeries.filter(cs => cs.variableCode !== series.variableCode),
                series,
            ],
        })),

    removeCalculatedSeries: (codeToRemove) =>
        set((state) => ({
            calculatedSeries: state.calculatedSeries.filter(
                (series) => series.variableCode !== codeToRemove
            ),
        })),

    clearAllCalculatedSeries: () => set(state => {
        const newPlottedKeys = new Set(state.plottedIndicatorKeys);
        state.calculatedSeries.forEach(cs => newPlottedKeys.delete(cs.variableCode));
        return {
            calculatedSeries: [],
            plottedIndicatorKeys: newPlottedKeys
        };
    }),

    toggleShowDotsOnLines: () =>
        set((state) => ({
            showDotsOnLines: !state.showDotsOnLines,
        })),
}));