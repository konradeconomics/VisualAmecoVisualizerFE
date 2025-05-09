import React, { useState, useMemo } from 'react';
import { useSelectionStore } from '../../store/selectionStore';

const generateYears = (start: number, end: number): number[] => {
    const years = [];
    for (let year = end; year >= start; year--) {
        years.push(year);
    }
    return years;
};

export const YearSelector: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => generateYears(1960, currentYear + 5), [currentYear]);

    const selectedYears = useSelectionStore((state) => state.selectedYears);
    const toggleYear = useSelectionStore((state) => state.toggleYear);
    const [searchTerm, setSearchTerm] = useState('');

    const handleYearToggle = (year: number) => {
        toggleYear(year);
    };

    const filteredYears = useMemo(() => {
        if (!searchTerm.trim()) return availableYears;
        return availableYears.filter((year) =>
            year.toString().includes(searchTerm)
        );
    }, [availableYears, searchTerm]);

    return (
        // Main component wrapper - NO h-full, allowing intrinsic height based on content
        <div className="p-1 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 flex flex-col">
            {/* Header part (Title + Search) - should not grow */}
            <div className="shrink-0">
                <h3 className="text-lg font-semibold mb-3 px-3 pt-3 text-gray-700 dark:text-gray-300">Select Years</h3>
                <div className="px-3 mb-3">
                    <input
                        type="text"
                        placeholder="Search years (e.g., 2020)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                    />
                </div>
            </div>

            {/* Scrollable List Area - constrained height */}
            {filteredYears.length === 0 && searchTerm && (
                <div className="p-3 text-gray-500 dark:text-gray-400">No years match your search.</div>
            )}
            <div className="overflow-y-auto space-y-1 px-3 pb-3 max-h-60"> {/* FIXED MAX HEIGHT HERE */}
                {filteredYears.map((year) => {
                    const isSelected = selectedYears.includes(year);
                    return (
                        <div
                            key={year}
                            onClick={() => handleYearToggle(year)}
                            title={year.toString()}
                            className={`p-2.5 rounded-md cursor-pointer transition-all duration-150 ease-in-out border flex items-center group justify-between text-sm ${
                                isSelected
                                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-sky-600 dark:border-sky-700'
                                    : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            <label htmlFor={`year-${year}`} className="flex items-center cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    id={`year-${year}`}
                                    checked={isSelected}
                                    readOnly
                                    onClick={(e) => e.stopPropagation()}
                                    className="form-checkbox h-5 w-5 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-3 pointer-events-none"
                                />
                                <span className="font-medium">{year}</span>
                            </label>
                        </div>
                    );
                })}
            </div>

            {/* Footer part (Selected summary) - should not grow */}
            {selectedYears.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 px-3 pb-2 shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedYears.length} year(s) selected: {selectedYears.sort((a,b) => a-b).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
};