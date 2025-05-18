import React from 'react';
import { useFilterSelectionsStore } from "../../store/filterSelectionStore.ts";
import type { SelectedVariable } from '../../store/storeUtils';

const SelectionTag: React.FC<{
    label: string;
    value: string | number;
    onRemove: () => void;
}> = ({ label, value, onRemove }) => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-700 dark:text-sky-100 mr-2 mb-2">
    {label}: {value}
        <button
            onClick={onRemove}
            className="ml-1.5 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-sky-500 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-600 hover:text-sky-600 dark:hover:text-sky-100 focus:outline-none focus:bg-sky-500 focus:text-white"
            title={`Remove ${label}: ${value}`}
        >
      <span className="sr-only">Remove</span>
      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </span>
);

export const CurrentSelectionsDisplay: React.FC = () => {
    const {
        selectedCountryCodes,
        selectedChapterIds,
        selectedSubchapterIds,
        selectedVariables,
        selectedYears,
        toggleCountry,
        toggleChapter,
        toggleSubchapter,
        toggleVariable,
        toggleYear,
    } = useFilterSelectionsStore();

    const hasSelections =
        selectedCountryCodes.length > 0 ||
        selectedChapterIds.length > 0 ||
        selectedSubchapterIds.length > 0 ||
        selectedVariables.length > 0 ||
        selectedYears.length > 0;

    if (!hasSelections) {
        return (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-md dark:border-slate-700">
                No filters currently applied. Open "Filters" to make selections.
            </div>
        );
    }

    return (
        <div className="p-3 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Filters:</h4>
            <div className="flex flex-wrap">
                {selectedCountryCodes.map((code) => (
                    <SelectionTag
                        key={`country-${code}`}
                        label="Country"
                        value={code}
                        onRemove={() => toggleCountry(code)}
                    />
                ))}
                {selectedChapterIds.map((id) => (
                    <SelectionTag
                        key={`chapter-${id}`}
                        label="Chapter"
                        value={id}
                        onRemove={() => toggleChapter(id)}
                    />
                ))}
                {selectedSubchapterIds.map((id) => (
                    <SelectionTag
                        key={`subchapter-${id}`}
                        label="Subchapter"
                        value={id}
                        onRemove={() => toggleSubchapter(id)}
                    />
                ))}
                {selectedVariables.map((variable : SelectedVariable) => (
                    <SelectionTag
                        key={`variable-${variable.code}`}
                        label="Variable"
                        value={`${variable.name} (${variable.code})`}
                        onRemove={() => toggleVariable(variable)}
                    />
                ))}
                {selectedYears.map((year) => (
                    <SelectionTag
                        key={`year-${year}`}
                        label="Year"
                        value={year}
                        onRemove={() => toggleYear(year)}
                    />
                ))}
            </div>
        </div>
    );
};