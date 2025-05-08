import React, { useState, useMemo } from 'react';
import { useFetchChapters } from '../../hooks/useFetchChapters'; // Adjust path
import { useSelectionStore } from '../../store/selectionStore';  // Adjust path
import type { ChapterDto } from '../../types/dto/chapter.dto';

export const ChapterSelector: React.FC = () => {
    const { data: chapters, isLoading, isError, error } = useFetchChapters();

    const selectedChapterIds = useSelectionStore((state) => state.selectedChapterIds);
    const toggleChapter = useSelectionStore((state) => state.toggleChapter);

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

    if (isLoading) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">Loading chapters...</div>;
    }

    if (isError) {
        return (
            <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                Error fetching chapters: {error?.message || 'Unknown error'}
            </div>
        );
    }

    if (!chapters || chapters.length === 0) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">No chapters available.</div>;
    }

    return (
        <div className="p-1 border border-gray-300 rounded-lg shadow-sm dark:border-slate-700 dark:bg-slate-800 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-3 px-3 pt-3 text-gray-700 dark:text-gray-300 sticky top-0 bg-white dark:bg-slate-800 z-10">Select Chapters</h3>

            {/* Search Input */}
            <div className="px-3 mb-3 sticky top-10 bg-white dark:bg-slate-800 z-10">
                <input
                    type="text"
                    placeholder="Search chapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-sky-600 dark:focus:border-sky-600"
                />
            </div>

            {(!filteredChapters || filteredChapters.length === 0) && chapters.length > 0 && (
                <div className="p-3 text-gray-500 dark:text-gray-400 flex-grow">No chapters match your search.</div>
            )}

            <div className="flex-grow overflow-y-auto space-y-1 px-3 pb-3"> {/* Scrollable list */}
                {filteredChapters.map((chapter: ChapterDto) => {
                    const isSelected = selectedChapterIds.includes(chapter.id);
                    return (
                        <div
                            key={chapter.id}
                            onClick={() => handleChapterToggle(chapter.id)}
                            title={chapter.name}
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
                            <label htmlFor={`chapter-${chapter.id}`} className="flex items-center cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    id={`chapter-${chapter.id}`}
                                    checked={isSelected}
                                    readOnly
                                    onClick={(e) => e.stopPropagation()}
                                    className="form-checkbox h-5 w-5 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-500 focus:ring-sky-500 dark:focus:ring-offset-0 dark:focus:ring-sky-600 mr-3 pointer-events-none"
                                />
                                <span className="font-medium text-sm truncate group-hover:text-clip">{chapter.name}</span>
                            </label>
                        </div>
                    );
                })}
            </div>
            {/* Optional: Display selected count/IDs if needed within the component itself */}
            {/* {selectedChapterIds.length > 0 && ( ... display logic ... )} */}
        </div>
    );
};