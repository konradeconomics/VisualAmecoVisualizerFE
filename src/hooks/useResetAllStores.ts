import { useFilterSelectionsStore} from "../store/filterSelectionStore.ts";
import { useChartSeriesStore } from '../store/chartSeriesStore.ts';       
import { useChartUISettingsStore } from '../store/chartUISettingsStore.ts';

/**
 * Custom hook that provides a function to reset all relevant application state
 * by calling the reset actions from individual Zustand stores.
 * @returns A function that, when called, resets all stores.
 */
export const useResetAllStores = () => {
    const resetFilters = useFilterSelectionsStore((state) => state.resetFilterSelections);
    const resetChartSeries = useChartSeriesStore((state) => state.resetChartSeriesStore);
    const resetChartUI = useChartUISettingsStore((state) => state.resetChartUISettings);

    /**
     * Calls the reset function for each relevant Zustand store.
     */
    const resetAll = () => {
        resetFilters();
        resetChartSeries();
        resetChartUI();
        console.log("All application stores have been reset."); // Optional: for debugging
    };

    return resetAll;
};