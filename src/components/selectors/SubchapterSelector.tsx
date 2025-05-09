import React, { useState, useMemo } from 'react';
import { useFetchSubchapters } from '../../hooks/useFetchSubchapters';
import { useSelectionStore } from '../../store/selectionStore';
import type {SubchapterDto} from '../../types/dto/subchapter.dto';


export const SubchapterSelector: React.FC = () => {
    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds);
    const selectedSubchapterIds = useSelectionStore((state) => state.selectedSubchapterIds);
    const toggleSubchapter = useSelectionStore((state) => state.toggleSubchapter);

    const { data: subchapters, isLoading, isError, errors } = useFetchSubchapters(selectedChapterIds);
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

    const renderContent = () => {
        if (isDisabled) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">Select chapter(s) first.</div>;
        if (isLoading) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">Loading subchapters...</div>;
        if (isError && errors?.length > 0) return <div className="p-3 text-sm text-center text-red-500 flex-grow flex items-center justify-center">Error: {errors[0]?.message || 'Unknown error'}</div>;
        if (!subchapters || subchapters.length === 0) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No subchapters for selection.</div>;
        if (filteredSubchapters.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No subchapters match search.</div>;

        return filteredSubchapters.map((subchapter: SubchapterDto) => {
            const isSelected = selectedSubchapterIds.includes(subchapter.id);
            return (
                <div
                    key={subchapter.id}
                    onClick={() => handleSubchapterToggle(subchapter.id)}
                    title={subchapter.name}
                    className={`p-2.5 rounded-md cursor-pointer border flex items-center group justify-between text-sm transition-all duration-150 ease-in-out ${
                        isSelected
                            ? 'bg-sky-500 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-700'
                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <label htmlFor={`subchapter-${subchapter.id}`} className="flex items-center cursor-pointer w-full truncate">
                        <input type="checkbox" id={`subchapter-${subchapter.id}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 dark:border-slate-500 mr-3 pointer-events-none"/>
                        <span className="font-medium truncate group-hover:text-clip">{subchapter.name}</span>
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
                    placeholder="Search subchapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isDisabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-50"
                />
            </div>
            <div className="flex-grow overflow-y-auto px-3 pb-3 space-y-1
                max-h-[20rem]     // Base: 320px
                md:max-h-[24rem]  // Medium: 384px
                lg:max-h-[28rem]  // Large: 448px
                xl:max-h-[32rem]  // Extra Large: 512px
                ">
                {renderContent()}
            </div>
            {selectedSubchapterIds.length > 0 && (
                <div className="p-2 border-t dark:border-slate-700 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {selectedSubchapterIds.length} selected
                </div>
            )}
        </div>
    );
};