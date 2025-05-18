import React, { useState, useMemo } from 'react';
import { useFetchChapters } from '../../hooks/useFetchChapters';
import { useFilterSelectionsStore} from "../../store/filterSelectionStore.ts";

import type { ChapterDto } from '../../types/dto/chapter.dto';

export const ChapterSelector: React.FC = () => {
    const { data: chapters, isLoading, isError, error } = useFetchChapters();
    const selectedChapterIds = useFilterSelectionsStore((state) => state.selectedChapterIds);
    const toggleChapter = useFilterSelectionsStore((state) => state.toggleChapter);
    const [searchTerm, setSearchTerm] = useState('');

    const handleChapterToggle = (id: number) => {
        toggleChapter(id);
    };

    const filteredChapters = useMemo(() => {
        if (!chapters) return [];
        if (!searchTerm.trim()) return chapters;
        return chapters.filter((chapter) =>
            chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [chapters, searchTerm]);

    const renderContent = () => {
        if (isLoading) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">Loading chapters...</div>;
        if (isError) return <div className="p-3 text-sm text-center text-red-500">Error: {error?.message || 'Unknown error'}</div>;
        if (!chapters || chapters.length === 0) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No chapters available.</div>;
        if (filteredChapters.length === 0 && searchTerm) return <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">No chapters match search.</div>;

        return filteredChapters.map((chapter: ChapterDto) => {
            const isSelected = selectedChapterIds.includes(chapter.id);
            return (
                <div
                    key={chapter.id}
                    onClick={() => handleChapterToggle(chapter.id)}
                    title={chapter.name}
                    className={`p-2.5 rounded-md cursor-pointer border flex items-center group justify-between text-sm transition-all duration-150 ease-in-out ${
                        isSelected
                            ? 'bg-sky-500 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-700'
                            : 'bg-white hover:bg-sky-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <label htmlFor={`chapter-${chapter.id}`} className="flex items-center cursor-pointer w-full truncate">
                        <input type="checkbox" id={`chapter-${chapter.id}`} checked={isSelected} readOnly onClick={(e) => e.stopPropagation()} className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 dark:border-slate-500 mr-3 pointer-events-none"/>
                        <span className="font-medium truncate group-hover:text-clip">{chapter.name}</span>
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
                    placeholder="Search chapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
            {selectedChapterIds.length > 0 && (
                <div className="p-2 border-t dark:border-slate-700 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {selectedChapterIds.length} selected
                </div>
            )}
        </div>
    );
};