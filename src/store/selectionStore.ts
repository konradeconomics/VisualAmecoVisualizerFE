import { create } from 'zustand';

type SelectedVariable = { code: string; name: string };

interface MultiSelectionState {
    selectedCountryCodes: string[];
    selectedVariables: SelectedVariable[];
    selectedYears: number[];
    selectedChapterIds: number[];
    selectedSubchapterIds: number[];

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

export const useSelectionStore = create<MultiSelectionState>((set) => ({
    selectedCountryCodes: [],
    selectedVariables: [], // **** CHANGED: Initialize as empty array for objects ****
    selectedYears: [],
    selectedChapterIds: [],
    selectedSubchapterIds: [],

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
    clearVariableSelections: () => set({ selectedVariables: [] }), // **** CHANGED ****
    clearYearSelections: () => set({ selectedYears: [] }),
    clearChapterSelections: () =>
        set({ selectedChapterIds: [], selectedSubchapterIds: [] }),
    clearSubchapterSelections: () => set({ selectedSubchapterIds: [] }),
    resetAllSelections: () =>
        set({
            selectedCountryCodes: [],
            selectedVariables: [], // **** CHANGED ****
            selectedYears: [],
            selectedChapterIds: [],
            selectedSubchapterIds: [],
        }),
}));