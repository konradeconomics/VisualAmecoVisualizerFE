import React, { useState, useMemo } from 'react';
import { useFilteredVariables } from '../../hooks/useFetchVariables';
import { useSelectionStore } from '../../store/selectionStore';
import type { VariableDto } from '../../types/dto/variable.dto';

type SelectedVariable = { code: string; name: string };

export const VariableSelector: React.FC = () => {
    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds); // For isDisabled logic
    const selectedSubchapterIds = useSelectionStore((state) => state.selectedSubchapterIds);
    const selectedVariables = useSelectionStore((state) => state.selectedVariables);
    const toggleVariable = useSelectionStore((state) => state.toggleVariable);

    const { data: availableVariables, isLoading, isError, errors } = useFilteredVariables();
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

    const renderAvailableVarsStatus = () => {
        if (isDisabled) return null; // Main disabled message handled by component return
        if (isLoading) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">Loading variables...</div>;
        if (isError) return <div className="p-3 text-sm text-center text-red-500 flex-grow flex items-center justify-center">Error: {errors?.[0]?.message || 'Unknown error'}</div>;
        if ((!availableVariables || availableVariables.length === 0)) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No variables for current selection.</div>;
        if (filteredAvailableVariables.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No variables match search.</div>;
        return null;
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
            <div className="flex-1 flex flex-col min-h-0 border-b dark:border-slate-700"> {/* Allows this section to take half height */}
                <div className="p-3 shrink-0">
                    <input type="text" placeholder="Search available variables..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm ..."/>
                </div>
                <div className="flex-grow overflow-y-auto max-h-40 md:max-h-48 px-3 pb-3 space-y-1"> {/* LIST AREA with max-h */}
                    {renderAvailableVarsStatus() ?? filteredAvailableVariables.map((variable: VariableDto) => {
                        const isSelected = isVariableSelectedInStore(variable.code);
                        return (
                            <div key={variable.code} onClick={() => handleVariableToggle({ code: variable.code, name: variable.name })} title={`${variable.name} (${variable.code}) - Unit: ${variable.unit}`}
                                 className={`p-2.5 rounded-md cursor-pointer border flex items-center group justify-between text-sm ... ${isSelected ? 'bg-sky-500 ...' : 'bg-white ...'}`}>
                                <label htmlFor={`available-var-${variable.code}`} className="flex items-center cursor-pointer w-full truncate">
                                    <input type="checkbox" id={`available-var-${variable.code}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-5 w-5 ... mr-3 pointer-events-none"/>
                                    <span className="font-medium truncate group-hover:text-clip">{variable.name}</span>
                                </label>
                                <span className={`text-xs ml-2 shrink-0 ${isSelected ? 'text-sky-100' : 'text-gray-400 dark:text-slate-400'}`}>({variable.code})</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Part 2: Selected Variables */}
            <div className="flex-1 flex flex-col min-h-0"> {/* Allows this section to take half height */}
                <h4 className="text-md font-semibold p-3 border-b dark:border-slate-700 shrink-0 text-gray-700 dark:text-gray-300">Selected Variables for Graph</h4>
                {selectedVariables.length === 0 && (
                    <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No variables selected.</div>
                )}
                {selectedVariables.length > 0 && (
                    <div className="flex-grow overflow-y-auto max-h-40 md:max-h-48 px-3 pt-2 pb-3 space-y-1"> {/* LIST AREA with max-h */}
                        {selectedVariables.map((selectedVar: SelectedVariable) => (
                            <div key={selectedVar.code} className="flex items-center justify-between p-2 border-b dark:border-slate-700 text-sm">
                                <span className="dark:text-slate-200 truncate" title={`${selectedVar.name} (${selectedVar.code})`}>{selectedVar.name} ({selectedVar.code})</span>
                                <button onClick={() => handleVariableToggle(selectedVar)} title={`Remove ${selectedVar.name}`} className="ml-2 text-red-500 ..."> (Remove) </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};