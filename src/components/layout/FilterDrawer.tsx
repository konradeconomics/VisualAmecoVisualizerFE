import React from 'react';
import { ChapterSelector } from '../selectors/ChapterSelector';
import { SubchapterSelector } from '../selectors/SubchapterSelector';
import { VariableSelector } from '../selectors/VariableSelector';
import { CountrySelector } from '../selectors/CountrySelector';
import { YearSelector } from '../selectors/YearSelector';
import { useResetAllStores} from "../../hooks/useResetAllStores.ts";

interface FilterDrawerProps {
    onCloseDrawer: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ onCloseDrawer }) => {
    const resetAllApplicationStores = useResetAllStores();
    const handleResetAll = () => {
        resetAllApplicationStores();
    };
    const handleApplyFilters = () => onCloseDrawer();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-xl"> {/* Ensure bg and shadow are on this root */}
            <header className="p-4 border-b dark:border-slate-700 shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Filter Data</h1>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Select criteria to update visualizations
                    </p>
                </div>
                <button onClick={onCloseDrawer} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700" title="Close Filters">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>

            {/* Scrollable area for ALL filter components, stacked vertically */}
            <div className="flex-grow p-4 md:p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Chapters</h2>
                    <ChapterSelector />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Subchapters</h2>
                    <SubchapterSelector />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Variables</h2>
                    <VariableSelector />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Countries</h2>
                    <CountrySelector />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Years</h2>
                    <YearSelector />
                </div>
            </div>

            <footer className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2 shrink-0">
                <button onClick={handleResetAll} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 rounded">
                    Reset All
                </button>
                <button onClick={handleApplyFilters} className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">
                    Apply & Close
                </button>
            </footer>
        </div>
    );
};