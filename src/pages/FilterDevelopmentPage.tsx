import React from 'react';
import { ChapterSelector } from '../components/selectors/ChapterSelector';
import { SubchapterSelector } from '../components/selectors/SubchapterSelector';
import {VariableSelector} from "../components/selectors/VariableSelector.tsx";
import { CountrySelector } from '../components/selectors/CountrySelector';
import { YearSelector } from '../components/selectors/YearSelector';

import { useSelectionStore } from '../store/selectionStore';
import {IndicatorDataTable} from "../components/display/IndicatorDataTable.tsx";

export const FilterDevelopmentPage: React.FC = () => {
    const resetAllSelections = useSelectionStore((state) => state.resetAllSelections);

    const handleResetAll = () => {
        resetAllSelections();
        console.log('All selections have been reset.');
    };

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-slate-900">
            <header className="mb-4 pb-4 border-b dark:border-slate-700 shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Filter Components</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Interactive Data Selection Panel
                </p>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6 lg:items-start">
                {/* Column 1: Chapter -> Subchapter -> Variable */}
                <div className="lg:w-3/5 flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Chapters</h2>
                        <ChapterSelector />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Subchapters</h2>
                        <SubchapterSelector />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 truncate shrink-0">Variables</h2>
                        <VariableSelector />
                    </div>
                </div>

                {/* Column 2: Countries and Years */}
                <div className="lg:w-2/5 flex flex-col gap-4 md:gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Countries</h2>
                        <CountrySelector />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 shrink-0">Years</h2>
                        <YearSelector />
                    </div>
                    {/* Display area for the Indicator Data Table */}
                    <div className="mt-4"> {/* Add some margin if needed */}
                        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Indicator Data</h2>
                        <IndicatorDataTable />
                    </div>
                </div>
            </div>

            <footer className="mt-auto pt-4 border-t dark:border-slate-700 flex justify-end space-x-2 shrink-0">
                {/* Updated "Reset All" button */}
                <button
                    onClick={handleResetAll}
                    className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 rounded"
                >
                    Reset All
                </button>
                <button className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">
                    Apply Filters {/* Still non-functional for now */}
                </button>
            </footer>
        </div>
    );
};