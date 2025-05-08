import { create } from 'zustand';

interface MultiSelectionState {
    // Core Data Dimensions for Graphing
    selectedCountryCodes: string[];
    selectedVariableCodes: string[];
    selectedYears: number[];

    // Navigational Selectors for Convenience
    selectedChapterIds: number[];
    selectedSubchapterIds: number[];

    // Actions to manage selections
    toggleCountry: (code: string) => void;
    toggleVariable: (code: string) => void;
    toggleYear: (year: number) => void;

    toggleChapter: (id: number) => void;
    toggleSubchapter: (id: number) => void;

    // Actions to clear selections for a specific category
    clearCountrySelections: () => void;
    clearVariableSelections: () => void;
    clearYearSelections: () => void;
    clearChapterSelections: () => void;
    clearSubchapterSelections: () => void;

    resetAllSelections: () => void;
}

const toggleArrayItem = <T>(array: T[], item: T): T[] =>
    array.includes(item) ? array.filter((i) => i !== item) : [...array, item];

export const useSelectionStore = create<MultiSelectionState>((set) => ({
    selectedCountryCodes: [],
    selectedVariableCodes: [],
    selectedYears: [],
    selectedChapterIds: [],
    selectedSubchapterIds: [],

    // --- Actions for Core Data Dimensions ---
    toggleCountry: (code) =>
        set((state) => ({
            selectedCountryCodes: toggleArrayItem(state.selectedCountryCodes, code),
        })),

    toggleVariable: (code) =>
        set((state) => ({
            selectedVariableCodes: toggleArrayItem(state.selectedVariableCodes, code),
        })),

    toggleYear: (year) =>
        set((state) => ({
            selectedYears: toggleArrayItem(state.selectedYears, year),
        })),

    // --- Actions for Navigational Selectors ---
    toggleChapter: (id) =>
        set((state) => {
            const newSelectedChapterIds = toggleArrayItem(state.selectedChapterIds, id);
            return {
                selectedChapterIds: newSelectedChapterIds,
                selectedSubchapterIds: [], // Subchapters depend directly on chapters
            };
        }),

    toggleSubchapter: (id) =>
        set((state) => {
            return {
                selectedSubchapterIds: toggleArrayItem(state.selectedSubchapterIds, id),
            };
        }),

    clearCountrySelections: () => set({ selectedCountryCodes: [] }),
    clearVariableSelections: () => set({ selectedVariableCodes: [] }),
    clearYearSelections: () => set({ selectedYears: [] }),

    clearChapterSelections: () =>
        set({
            selectedChapterIds: [],
            selectedSubchapterIds: [],
        }),

    clearSubchapterSelections: () =>
        set({
            selectedSubchapterIds: [],
        }),

    resetAllSelections: () =>
        set({
            selectedCountryCodes: [],
            selectedVariableCodes: [],
            selectedYears: [],
            selectedChapterIds: [],
            selectedSubchapterIds: [],
        }),
}));