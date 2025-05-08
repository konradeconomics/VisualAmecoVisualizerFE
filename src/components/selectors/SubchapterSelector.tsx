import React, { useState, useMemo } from 'react';
import { useFetchSubchapters } from '../../hooks/useFetchSubchapters';
import { useSelectionStore } from '../../store/selectionStore';
import type {SubchapterDto} from '../../types/dto/subchapter.dto';


export const SubchapterSelector: React.FC = () => {
    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds);
    const selectedSubchapterIds = useSelectionStore((state) => state.selectedSubchapterIds);
    const toggleSubchapter = useSelectionStore((state) => state.toggleSubchapter);

    const {
        data: subchapters,
        isLoading,
        isError,
        errors,
    } = useFetchSubchapters(selectedChapterIds);

    const [searchTerm, setSearchTerm] = useState('');

    const handleSubchapterToggle = (id: number) => {
        toggleSubchapter(id);
    };

    const filteredSubchapters = useMemo(() => {
        if (!subchapters) return [];
        if (!searchTerm.trim()) return subchapters;

        return subchapters.filter((subchapter) =>
            subchapter.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subchapters, searchTerm]);

    const isDisabled = selectedChapterIds.length === 0;

    if (isDisabled) {
        return (
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Please select one or more chapters first.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">Loading subchapters...</div>;
    }

    if (isError && errors.length > 0) {
        return (
            <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                Error fetching subchapters: {errors[0]?.message || 'Unknown error'}
                {errors.length > 1 && ` (+${errors.length - 1} more errors)`}
            </div>
        );
    }

    if (!subchapters || subchapters.length === 0) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">No subchapters found for the selected chapter(s).</div>;
    }


    return (
        <div className="p-1 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex flex-col">
            {}
            <h3 className="text-lg font-semibold mb-3 px-3 pt-3 text-gray-700 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-800 z-10">Select Subchapters</h3>

            <div className="px-3 mb-3 sticky top-10 bg-white dark:bg-slate-800 z-10">
                <input
                    type="text"
                    placeholder="Search subchapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                />
            </div>

            {(!filteredSubchapters || filteredSubchapters.length === 0) && subchapters.length > 0 && (
                <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow">No subchapters match your search.</div>
            )}

            <div className="flex-grow overflow-y-auto space-y-1 px-3 pb-3">
                {filteredSubchapters.map((subchapter: SubchapterDto) => {
                    const isSelected = selectedSubchapterIds.includes(subchapter.id);
                    return (
                        <div
                            key={subchapter.id}
                            onClick={() => handleSubchapterToggle(subchapter.id)}
                            title={subchapter.name}
                            className={`
                p-2.5 rounded-md cursor-pointer transition-all duration-150 ease-in-out
                border flex items-center group justify-between
                ${
                                isSelected
                                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm dark:bg-sky-600 dark:border-sky-700'
                                    : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                            }
              `}
                        >
                            <label htmlFor={`subchapter-${subchapter.id}`} className="flex items-center cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    id={`subchapter-${subchapter.id}`}
                                    checked={isSelected}
                                    readOnly
                                    onClick={(e) => e.stopPropagation()}
                                    className="form-checkbox h-5 w-5 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-3 pointer-events-none"
                                />
                                <span className="font-medium text-sm truncate group-hover:text-clip">{subchapter.name}</span>
                            </label>
                        </div>
                    );
                })}
            </div>
            {}
            {selectedSubchapterIds.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 px-3 pb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedSubchapterIds.length} selected.
                    </p>
                </div>
            )}
        </div>
    );
};