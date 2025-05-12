import React from 'react';
import { useSelectionStore } from '../../store/selectionStore';
import type { PlottableChartSeries } from '../../types/PlottableChartSeries.ts'

interface ChartSeriesSelectorProps {
    allAvailableSeries: PlottableChartSeries[];
}

export const ChartSeriesSelector: React.FC<ChartSeriesSelectorProps> = ({
                                                                            allAvailableSeries,
                                                                        }) => {
    const plottedIndicatorKeys = useSelectionStore((state) => state.plottedIndicatorKeys);
    const togglePlottedIndicator = useSelectionStore((state) => state.togglePlottedIndicator);

    if (!allAvailableSeries || allAvailableSeries.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 shrink-0 border-b dark:border-slate-700 pb-3">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">Plot on Chart:</h4>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
                {allAvailableSeries.map(series => {
                    const isChecked = plottedIndicatorKeys.has(series.displayKey);
                    return (
                        <label key={series.displayKey} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePlottedIndicator(series.displayKey)}
                                className="form-checkbox h-4 w-4 text-sky-600 dark:text-sky-500 rounded border-gray-300 dark:border-slate-600 focus:ring-sky-500"
                            />
                            <span className={`dark:text-slate-200 ${series.isCalculated ? 'italic font-semibold' : ''}`}>
                {series.uiDisplayName}
              </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};