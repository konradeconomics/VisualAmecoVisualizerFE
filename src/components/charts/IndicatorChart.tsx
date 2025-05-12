import React, { useMemo } from 'react';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';
import { useSelectionStore } from '../../store/selectionStore';
import { getReadableUnit, getUnitCategory } from '../../utils/unitMapper';
import type { PlottableChartSeries } from '../../types/PlottableChartSeries';
import { ChartSeriesSelector } from './ChartSeriesSelector';
import { useChartDataPreparation } from '../../hooks/useChartDataPreparation'; // Import custom hook
import { RechartsPlot } from './RechartsPlot';
import { ChartDotToggle } from '../controls/ChartDotToggle';

export const IndicatorChart: React.FC = () => {
    const { allData: fetchedIndicatorsData, isLoading, isFetching, isError, errors } = useFetchSelectedIndicators();
    const plottedIndicatorKeys = useSelectionStore((state) => state.plottedIndicatorKeys);
    const allCalculatedSeries = useSelectionStore((state) => state.calculatedSeries);

    const allAvailableSeriesForSelection = useMemo((): PlottableChartSeries[] => {
        const fetchedAsPlottable: PlottableChartSeries[] = (fetchedIndicatorsData || []).map(ind => {
            const readableUnit = getReadableUnit(ind.unitCode, ind.unitDescription);
            return {
                ...ind,
                displayKey: `${ind.countryCode}-${ind.variableCode}`,
                isCalculated: false,
                readableUnit: readableUnit,
                category: getUnitCategory(readableUnit),
                uiDisplayName: `${ind.countryName} - ${ind.variableName} (${readableUnit})`,
            };
        });
        const calculatedAsPlottable: PlottableChartSeries[] = (allCalculatedSeries || []).map(calc => {
            const readableUnit = getReadableUnit(calc.unitCode, calc.unitDescription);
            return {
                ...calc,
                displayKey: calc.variableCode,
                isCalculated: true,
                readableUnit: readableUnit,
                category: getUnitCategory(readableUnit),
                uiDisplayName: `${calc.variableName} (${readableUnit}) [Calc]`,
            };
        });
        return [...fetchedAsPlottable, ...calculatedAsPlottable];
    }, [fetchedIndicatorsData, allCalculatedSeries]);

    const indicatorsToPlot = useMemo((): PlottableChartSeries[] => {
        return allAvailableSeriesForSelection.filter(series =>
            plottedIndicatorKeys.has(series.displayKey)
        );
    }, [allAvailableSeriesForSelection, plottedIndicatorKeys]);

    // Use the custom hook for complex data prep
    const {
        unitInfoForPlotting,
        yAxisConfig,
        pivotedChartData
    } = useChartDataPreparation(indicatorsToPlot);

    // ----- Loading/Error States -----
    if (isLoading && !isFetching && allAvailableSeriesForSelection.length === 0 ) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chart data...</div>;
    }
    if (isError && !isLoading && errors) {
        const firstError = errors.find(e => e !== null);
        return <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded">Error: {firstError?.message || 'Unknown error fetching data'}</div>;
    }
    if (allAvailableSeriesForSelection.length === 0 && !isLoading && !isFetching && !isError) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">No indicators available. Make selections in filters.</div>;
    }

    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[500px] md:h-[600px] w-full flex flex-col">
            {allAvailableSeriesForSelection.length > 0 && (
                <ChartSeriesSelector
                    allAvailableSeries={allAvailableSeriesForSelection}
                />
            )}

            <div className="mb-2 shrink-0 flex justify-start">
                <ChartDotToggle />
            </div>

            {isFetching && (<div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400 shrink-0">Updating chart...</div>)}

            <div className="flex-grow min-h-0">
                {indicatorsToPlot.length > 0 && pivotedChartData.length > 0 && yAxisConfig && yAxisConfig.length > 0 ? (
                    <RechartsPlot
                        pivotedData={pivotedChartData}
                        yAxisConfig={yAxisConfig}
                        seriesInfoForLines={unitInfoForPlotting}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {allAvailableSeriesForSelection.length > 0
                            ? 'Select indicator(s) from the list above to plot.'
                            : 'No data available. Please make selections in filters.'}
                    </div>
                )}
            </div>
        </div>
    );
};