import React, { useState, useMemo } from 'react';
import { useFilteredVariables } from '../../hooks/useFetchVariables';
import { useSelectionStore } from '../../store/selectionStore';
import type { VariableDto } from '../../types/dto/variable.dto';

export const VariableSelector: React.FC = () => {
    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds); // Needed for isDisabled logic
    const selectedSubchapterIds = useSelectionStore((state) => state.selectedSubchapterIds);
    const selectedVariableCodes = useSelectionStore((state) => state.selectedVariableCodes);
    const toggleVariable = useSelectionStore((state) => state.toggleVariable);

    const {
        data: availableVariables,
        isLoading,
        isError,
        errors,
        isFetchingBasedOn // Optional: 'chapters' | 'subchapters' | 'none'
    } = useFilteredVariables(); // No arguments passed here

    const [searchTerm, setSearchTerm] = useState('');

    const handleVariableToggle = (variableCode: string) => {
        toggleVariable(variableCode);
    };

    // Filter AVAILABLE variables based on search term
    const filteredAvailableVariables = useMemo(() => {
        const variablesToFilter = availableVariables ?? []; // Handle undefined case
        if (!searchTerm.trim()) return variablesToFilter;

        return variablesToFilter.filter((variable) =>
            variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variable.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableVariables, searchTerm]);

    const isDisabled = selectedChapterIds.length === 0 && selectedSubchapterIds.length === 0;

    // ----- UI Rendering -----

    if (isDisabled) {
        return (
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex flex-col">
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center flex-grow flex items-center justify-center">
                    Please select one or more chapters or subchapters first.
                </div>
            </div>
        );
    }

    // Helper function to render status messages based on hook state
    const renderStatusMessage = () => {
        if (isLoading) {
            const fetchBase = isFetchingBasedOn === 'chapters' || isFetchingBasedOn === 'subchapters'
                ? ` for selected ${isFetchingBasedOn}`
                : '';
            return <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow">Loading variables{fetchBase}...</div>;
        }
        if (isError) {
            return (
                <div className="p-3 text-red-600 bg-red-100 border border-red-400 rounded text-sm dark:bg-red-900 dark:text-red-200 dark:border-red-700 flex-grow">
                    Error fetching variables: {errors?.[0]?.message || 'Unknown error'}
                    {errors && errors.length > 1 && ` (+${errors.length - 1} more errors)`}
                </div>
            );
        }
        if (!isLoading && !isError) {
            if (!availableVariables || availableVariables.length === 0) {
                return <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow">No variables found for the current selection.</div>;
            }
            if (filteredAvailableVariables.length === 0 && searchTerm) {
                return <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow">No variables match your search.</div>;
            }
        }
        return null;
    };


    return (
        <div className="border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex flex-col">
            {/* --- Part 1: Variable Discovery/Selection --- */}
            <div className="p-1 flex flex-col h-1/2 border-b dark:border-slate-700 overflow-hidden">
                <h4 className="text-md font-semibold mb-2 px-3 pt-2 text-gray-600 dark:text-gray-400 shrink-0">Available Variables</h4>
                <div className="px-3 mb-2 shrink-0">
                    <input
                        type="text"
                        placeholder="Search available variables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                    />
                </div>

                {/* Render status message OR the list */}
                <div className="flex-grow overflow-y-auto space-y-1 px-3 pb-3">
                    {renderStatusMessage() ?? ( // If status message is null, render the list
                        filteredAvailableVariables.map((variable: VariableDto) => {
                            const isSelectedInStore = selectedVariableCodes.includes(variable.code);
                            return (
                                <div
                                    key={variable.code}
                                    onClick={() => handleVariableToggle(variable.code)}
                                    title={`${variable.name} (${variable.code}) - Unit: ${variable.unit}`} // Corrected title attribute
                                    className={`
                                        p-2 rounded-md cursor-pointer transition-all duration-150 ease-in-out
                                        border flex items-center group justify-between text-sm
                                        ${
                                        isSelectedInStore // Use a different variable name to avoid conflict if needed
                                            ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-sky-600 dark:border-sky-700'
                                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                                    }
                                    `}
                                >
                                    <label htmlFor={`variable-${variable.code}`} className="flex items-center cursor-pointer w-full truncate">
                                        <input
                                            type="checkbox"
                                            id={`variable-${variable.code}`}
                                            checked={isSelectedInStore}
                                            readOnly
                                            onClick={(e) => e.stopPropagation()}
                                            className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-2 pointer-events-none"
                                        />
                                        <span className="font-medium truncate group-hover:text-clip">{variable.name}</span>
                                    </label>
                                    <span className={`text-xs ml-2 shrink-0 ${isSelectedInStore ? 'text-sky-100' : 'text-gray-400 dark:text-slate-400'}`}>({variable.code})</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* --- Part 2: Display Selected Variables --- */}
            <div className="p-1 flex flex-col h-1/2 overflow-hidden">
                <h4 className="text-md font-semibold mb-2 px-3 pt-2 text-gray-600 dark:text-gray-400 shrink-0">Selected Variables for Graph</h4>
                {selectedVariableCodes.length === 0 && (
                    <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">
                        No variables selected yet.
                    </div>
                )}
                {selectedVariableCodes.length > 0 && (
                    <div className="flex-grow overflow-y-auto space-y-1 px-3 pb-3">
                        {selectedVariableCodes.map((code) => (
                            <div key={code} className="flex items-center justify-between p-2 border-b dark:border-slate-700 text-sm">
                                <span className="dark:text-slate-200 truncate" title={code}>{code}</span> {/* Added title for potential overflow */}
                                <button
                                    onClick={() => handleVariableToggle(code)} // Deselect
                                    title={`Remove ${code}`}
                                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 text-xs font-medium shrink-0" // Prevent button text from shrinking
                                >
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