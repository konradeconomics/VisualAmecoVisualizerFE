import React, { useState, useMemo } from 'react';
import { useFilteredVariables } from '../../hooks/useFetchVariables';
import { useSelectionStore } from '../../store/selectionStore';
import type { VariableDto } from '../../types/dto/variable.dto';

type SelectedVariable = { code: string; name: string };

export const VariableSelector: React.FC = () => {
    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds);
    const selectedSubchapterIds = useSelectionStore((state) => state.selectedSubchapterIds);
    const selectedVariables = useSelectionStore((state) => state.selectedVariables);
    const toggleVariable = useSelectionStore((state) => state.toggleVariable);

    const {
        data: availableVariables,
        isLoading,
        isError,
        errors,
        // fetchStatus, // Keep these if your hook returns them
        // isFetchingBasedOn
    } = useFilteredVariables();

    const [searchTerm, setSearchTerm] = useState('');

    const handleVariableToggle = (variable: SelectedVariable) => toggleVariable(variable);

    const filteredAvailableVariables = useMemo(() => {
        const varsToFilter = availableVariables ?? [];
        if (!searchTerm.trim()) return varsToFilter;
        return varsToFilter.filter((v) =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableVariables, searchTerm]);

    const isDisabled = selectedChapterIds.length === 0 && selectedSubchapterIds.length === 0;

    const isVariableSelectedInStore = (code: string): boolean => selectedVariables.some(v => v.code === code);

    const renderAvailableVarsContent = () => {
        if (isDisabled) return null; // Outer component handles disabled state
        if (isLoading) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">Loading variables...</div>;
        if (isError) return <div className="p-3 text-sm text-center text-red-500 flex-grow flex items-center justify-center">Error: {errors?.[0]?.message || 'Unknown error'}</div>;
        if ((!availableVariables || availableVariables.length === 0)) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No variables for current selection.</div>;
        if (filteredAvailableVariables.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No variables match search.</div>;

        return filteredAvailableVariables.map((variable: VariableDto) => {
            const isSelected = isVariableSelectedInStore(variable.code);
            return (
                <div
                    key={variable.code}
                    onClick={() => handleVariableToggle({ code: variable.code, name: variable.name })}
                    title={`${variable.name} (${variable.code}) - Unit: ${variable.unit}`}
                    className={`p-2 rounded-md cursor-pointer border flex items-center group justify-between text-sm transition-all duration-150 ease-in-out ${
                        isSelected
                            ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-sky-600 dark:border-sky-700'
                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <label htmlFor={`available-var-${variable.code}`} className="flex items-center cursor-pointer w-full truncate">
                        <input type="checkbox" id={`available-var-${variable.code}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-2 pointer-events-none"/>
                        <span className="font-medium truncate group-hover:text-clip">{variable.name}</span>
                    </label>
                    <span className={`text-xs ml-2 shrink-0 ${isSelected ? 'text-sky-100' : 'text-gray-400 dark:text-slate-400'}`}>({variable.code})</span>
                </div>
            );
        });
    };


    if (isDisabled) {
        return (
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex flex-col items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-center">Please select chapter(s) and subchapter(s) first.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg shadow-sm flex flex-col bg-white dark:bg-slate-800 overflow-hidden h-full dark:border-slate-700">
            {/* Part 1: Available Variables */}
            <div className="flex-1 flex flex-col min-h-0 p-1 border-b dark:border-slate-700"> {/* Parent section */}
                <h4 className="text-md font-semibold mb-2 px-3 pt-2 text-gray-600 dark:text-gray-400 shrink-0">Available Variables</h4>
                <div className="px-3 mb-2 shrink-0"> {/* Search bar container */}
                    <input
                        type="text"
                        placeholder="Search available variables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                    />
                </div>
                {/* Scrollable area for available variables list or status messages */}
                <div className="flex-grow overflow-y-auto max-h-60 space-y-1 px-3 pb-1"> {/* Example: max-h-60 (15rem or 240px) */}
                    {renderAvailableVarsContent()}
                </div>
            </div>

            {/* Part 2: Selected Variables */}
            <div className="flex-1 flex flex-col min-h-0 p-1"> {/* Parent section */}
                <h4 className="text-md font-semibold mb-2 px-3 pt-3 text-gray-600 dark:text-gray-400 shrink-0">Selected Variables for Graph</h4>

                {selectedVariables.length === 0 && (
                    <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">
                        No variables selected.
                    </div>
                )}
                {selectedVariables.length > 0 && (
                    // Scrollable area for selected variables list
                    <div className="flex-grow overflow-y-auto max-h-48 space-y-1 px-3 pb-3"> {/* Example: max-h-48 (12rem or 192px) */}
                        {selectedVariables.map((selectedVar: SelectedVariable) => (
                            <div key={selectedVar.code} className="flex items-center justify-between p-2 border-b dark:border-slate-700 text-sm">
                                <span className="dark:text-slate-200 truncate" title={`${selectedVar.name} (${selectedVar.code})`}>
                                    {selectedVar.name} ({selectedVar.code})
                                </span>
                                <button onClick={() => handleVariableToggle(selectedVar)} title={`Remove ${selectedVar.name}`} className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 text-xs font-medium shrink-0">
                                    (Remove)
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};