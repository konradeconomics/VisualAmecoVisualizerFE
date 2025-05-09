import React, { useState, useMemo } from 'react';
import { useSelectionStore } from '../../store/selectionStore';

const generateYears = (start: number, end: number): number[] => {
    const years = [];
    for (let year = end; year >= start; year--) { years.push(year); }
    return years;
};

export const YearSelector: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => generateYears(1960, currentYear + 5), [currentYear]);
    const selectedYears = useSelectionStore((state) => state.selectedYears);
    const toggleYear = useSelectionStore((state) => state.toggleYear);
    const [searchTerm, setSearchTerm] = useState('');

    const handleYearToggle = (year: number) => toggleYear(year);

    const filteredYears = useMemo(() => {
        if (!searchTerm.trim()) return availableYears;
        return availableYears.filter((year) => year.toString().includes(searchTerm));
    }, [availableYears, searchTerm]);

    const renderContent = () => {
        if (filteredYears.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No years match search.</div>;
        if (availableYears.length === 0) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No years available.</div>; // Should not happen with generated years

        return filteredYears.map((year) => {
            const isSelected = selectedYears.includes(year);
            return (
                <div
                    key={year}
                    onClick={() => handleYearToggle(year)}
                    title={year.toString()}
                    className={`p-2.5 rounded-md cursor-pointer border flex items-center group justify-between text-sm transition-all duration-150 ease-in-out ${
                        isSelected
                            ? 'bg-sky-500 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-700'
                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <label htmlFor={`year-${year}`} className="flex items-center cursor-pointer w-full">
                        <input type="checkbox" id={`year-${year}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 dark:border-slate-500 mr-3 pointer-events-none"/>
                        <span className="font-medium">{year}</span>
                    </label>
                </div>
            );
        });
    };

    return (
        <div className="border rounded-lg shadow-sm flex flex-col bg-white dark:bg-slate-800 overflow-hidden dark:border-slate-700">
            <div className="p-3 shrink-0"> {/* Search bar area */}
                <input
                    type="text"
                    placeholder="Search years (e.g., 2020)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
            </div>
            <div className="flex-grow overflow-y-auto max-h-60 space-y-1 px-3 pb-3"> {/* LIST AREA with max-h-60 */}
                {renderContent()}
            </div>
            {selectedYears.length > 0 && (
                <div className="p-2 border-t dark:border-slate-700 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {selectedYears.length} year(s) selected: {selectedYears.sort((a, b) => a - b).join(', ')}
                </div>
            )}
        </div>
    );
};