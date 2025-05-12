import React, {useState, useEffect, useRef} from 'react';
import { useSelectionStore } from '../../store/selectionStore';
import type { PlottableChartSeries } from '../../types/PlottableChartSeries'; 
import {Check, Edit3, Trash2, X} from 'lucide-react';

interface EditableSeriesNameProps {
    series: PlottableChartSeries;
}

interface EditableSeriesNameProps {
    series: PlottableChartSeries; 
}

export const EditableSeriesName: React.FC<EditableSeriesNameProps> = ({ series }) => {
    const customNameFromStore = useSelectionStore(
        (state) => state.customSeriesNames[series.displayKey]
    );
    const setCustomStoreName = useSelectionStore((state) => state.setCustomSeriesName);
    const clearCustomStoreName = useSelectionStore((state) => state.clearCustomSeriesName);

    const effectiveDisplayName = customNameFromStore || series.uiDisplayName;

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(effectiveDisplayName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isEditing) {
            setEditText(effectiveDisplayName);
        }
    }, [effectiveDisplayName, isEditing]);

    const handleEdit = () => {
        setEditText(effectiveDisplayName);
        setIsEditing(true);
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        const trimmedEditText = editText.trim();
        if (trimmedEditText && trimmedEditText !== series.uiDisplayName) {
            setCustomStoreName(series.displayKey, trimmedEditText);
        } else if (trimmedEditText === series.uiDisplayName && customNameFromStore) {
            clearCustomStoreName(series.displayKey);
        } else if (!trimmedEditText && customNameFromStore) {
            clearCustomStoreName(series.displayKey);
        }
        else if (!trimmedEditText && !customNameFromStore) {
        }


        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
        } else if (event.key === 'Escape') {
            handleCancel();
        }
    };

    const handleClearCustomName = () => {
        clearCustomStoreName(series.displayKey);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center space-x-1 w-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="form-input py-0.5 px-1 text-xs dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100 rounded-sm border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 flex-grow min-w-0"
                />
                <button onClick={handleSave} title="Save name" className="p-0.5 rounded hover:bg-green-100 dark:hover:bg-green-700 shrink-0">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                </button>
                <button onClick={handleCancel} title="Cancel edit" className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-700 shrink-0">
                    <X size={14} className="text-red-600 dark:text-red-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-1 group w-full truncate" title={effectiveDisplayName}>
      <span className={`dark:text-slate-200 ${series.isCalculated ? 'italic' : ''} truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 py-0.5`}> {/* Added py-0.5 for similar height to input */}
          {effectiveDisplayName}
      </span>
            <button
                onClick={handleEdit}
                title="Edit series name"
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600 transition-opacity shrink-0"
            >
                <Edit3 size={12} className="text-gray-500 dark:text-gray-400" />
            </button>
            {customNameFromStore && (
                <button
                    onClick={handleClearCustomName}
                    title="Revert to default name"
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-100 dark:hover:bg-red-700 transition-opacity shrink-0"
                >
                    <Trash2 size={12} className="text-red-500 dark:text-red-400" />
                </button>
            )}
        </div>
    );
};