import { create } from 'zustand';
import { togglePrimitiveArrayItem, toggleSelectedVariableArrayItem, type SelectedVariable } from './storeUtils'; // Assuming storeUtils.ts is in the same directory

// Interface for the state managed by this store
interface FilterSelectionsState {
    selectedCountryCodes: string[];
    selectedVariables: SelectedVariable[];
    selectedYears: number[];
    selectedChapterIds: number[];
    selectedSubchapterIds: number[];
}

// Interface for the actions available in this store
interface FilterSelectionsActions {
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

    resetFilterSelections: () => void;
}

// Initial state for filter selections
const initialFilterState: FilterSelectionsState = {
    selectedCountryCodes: [],
    selectedVariables: [],
    selectedYears: [],
    selectedChapterIds: [],
    selectedSubchapterIds: [],
};

/**
 * Zustand store for managing user selections related to data filtering.
 */
export const useFilterSelectionsStore = create<FilterSelectionsState & FilterSelectionsActions>((set) => ({
    ...initialFilterState,

    toggleCountry: (code) =>
        set((state) => ({
            selectedCountryCodes: togglePrimitiveArrayItem(state.selectedCountryCodes, code),
        })),

    toggleVariable: (variable) =>
        set((state) => ({
            selectedVariables: toggleSelectedVariableArrayItem(state.selectedVariables, variable),
        })),

    toggleYear: (year) =>
        set((state) => ({
            selectedYears: togglePrimitiveArrayItem(state.selectedYears, year),
        })),

    toggleChapter: (id) =>
        set((state) => ({
            selectedChapterIds: togglePrimitiveArrayItem(state.selectedChapterIds, id),
            selectedSubchapterIds: [], // Reset subchapters when a chapter is toggled (as per original logic)
            selectedVariables: [],   // Reset variables when chapter changes (common pattern, adjust if needed)
        })),

    toggleSubchapter: (id) =>
        set((state) => ({
            selectedSubchapterIds: togglePrimitiveArrayItem(state.selectedSubchapterIds, id),
            selectedVariables: [], // Reset variables when subchapter changes (common pattern, adjust if needed)
        })),

    clearCountrySelections: () => set({ selectedCountryCodes: [] }),
    clearVariableSelections: () => set({ selectedVariables: [] }),
    clearYearSelections: () => set({ selectedYears: [] }),
    clearChapterSelections: () =>
        set({ selectedChapterIds: [], selectedSubchapterIds: [], selectedVariables: [] }), // Also clear variables
    clearSubchapterSelections: () => set({ selectedSubchapterIds: [], selectedVariables: [] }), // Also clear variables

    resetFilterSelections: () => set(initialFilterState),
}));