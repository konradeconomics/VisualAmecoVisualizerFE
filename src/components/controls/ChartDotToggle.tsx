import React from 'react';
import { useSelectionStore } from '../../store/selectionStore';

export const ChartDotToggle: React.FC = () => {
    const showDotsOnLines = useSelectionStore((state) => state.showDotsOnLines);
    const toggleShowDotsOnLines = useSelectionStore((state) => state.toggleShowDotsOnLines);

    return (
        <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400">
            <input
                type="checkbox"
                checked={showDotsOnLines}
                onChange={toggleShowDotsOnLines}
                className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-600 focus:ring-sky-500 focus:ring-offset-0"
            />
            <span>Show Data Points</span>
        </label>
    );
};