import React, { useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useFetchSelectedIndicators } from '../../hooks/useFetchIndicator';
import { useThemeStore } from '../../store/themeStore';
import { getReadableUnit, getUnitCategory, type UnitCategory } from '../../utils/unitMapper';
import {useSelectionStore} from "../../store/selectionStore.ts";
import type {YearValueDto} from "../../types/dto/yearValue.dto.ts";

type IndicatorSeriesKey = string; // Typically a unique string identifier for a series

interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined; // Dynamic keys for each series amount
}

interface PlottableChartSeries {
    displayKey: string;        // Unique key for selection state & Recharts dataKey (e.g., CCODE-VCODE or CALC-VCODE)
    isCalculated: boolean;     // Flag to distinguish type

    // Common fields from IndicatorDto & CalculatedSeriesDto needed for display & processing
    variableCode: string;      // Original or generated
    variableName: string;      // Original or user-defined for calculated
    unitCode: string;          // Original or synthetic
    unitDescription: string;   // Original or user-defined
    countryCode: string;       // e.g., "DEU" or "CALC"
    countryName: string;       // e.g., "Germany" or "Calculated"
    values: YearValueDto[];    // The time-series data

    uiDisplayName: string;     // For the "Plot on Chart" selector list: "Country - Variable (Readable Unit) [Calc]"
    readableUnit: string;      // Processed unit string using getReadableUnit
    category: UnitCategory;    // Processed unit category using getUnitCategory
}

const LINE_COLORS = [
    '#0ea5e9', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6',
    '#3b82f6', '#a855f7', '#d946ef', '#84cc16', '#64748b', '#78716c', '#06b6d4', '#f59e0b',
];

const HIERARCHICAL_LINE_STYLES: (string | undefined)[] = [
    undefined,       // 1st Y-axis group: Solid
    '5 5',           // 2nd Y-axis group: Dashed
    '1 5',           // 3rd Y-axis group: Dotted
    '10 2 2 2',      // 4th Y-axis group: Dash-dot-dot
    '3 7',
];
const DEFAULT_AXIS_LINE_STYLE = undefined; // Solid

export const IndicatorSimpleChart: React.FC = () => {
    const {
        allData: fetchedIndicatorsData,
        isLoading,
        isFetching,
        isError,
        errors,
    } = useFetchSelectedIndicators();

    const { theme } = useThemeStore();

    // Get chart interaction state from Zustand
    const plottedIndicatorKeys = useSelectionStore((state) => state.plottedIndicatorKeys);
    const togglePlottedIndicator = useSelectionStore((state) => state.togglePlottedIndicator);
    const setPlottedIndicators = useSelectionStore((state) => state.setPlottedIndicators);
    const allCalculatedSeries = useSelectionStore((state) => state.calculatedSeries);

    // Combine fetched and calculated series into a single list with a unified structure
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
                category: getUnitCategory(readableUnit), // Ensure CalculatedSeriesDto has a unitDescription to derive category
                uiDisplayName: `${calc.variableName} (${readableUnit}) [Calc]`,
            };
        });

        return [...fetchedAsPlottable, ...calculatedAsPlottable];
    }, [fetchedIndicatorsData, allCalculatedSeries]);

    useEffect(() => {
        if (allAvailableSeriesForSelection.length > 0 && plottedIndicatorKeys.size === 0) {
            const firstSeriesKey = allAvailableSeriesForSelection[0].displayKey;
            setPlottedIndicators(new Set([firstSeriesKey]));
        } else if (allAvailableSeriesForSelection.length === 0 && plottedIndicatorKeys.size > 0) {
            setPlottedIndicators(new Set());
        }
    }, [allAvailableSeriesForSelection, plottedIndicatorKeys, setPlottedIndicators]);

    const indicatorsToPlot = useMemo((): PlottableChartSeries[] => {
        return allAvailableSeriesForSelection.filter(series =>
            plottedIndicatorKeys.has(series.displayKey)
        );
    }, [allAvailableSeriesForSelection, plottedIndicatorKeys]);

    const unitInfoForPlottedIndicators = useMemo(() => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        // Each item in indicatorsToPlot is already PlottableChartSeries
        return indicatorsToPlot.map(series => ({
            key: series.displayKey,
            readableUnit: series.readableUnit,
            category: series.category,
            indicator: series,
        }));
    }, [indicatorsToPlot]);

    const yAxisConfig = useMemo(() => {
        if (!unitInfoForPlottedIndicators || unitInfoForPlottedIndicators.length === 0) {
            return [{
                yAxisId: 'left0', orientation: 'left' as const,
                unitTypeLabel: 'Value',
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE
            }];
        }
        const orderedUniqueCategories: UnitCategory[] = [];
        unitInfoForPlottedIndicators.forEach(info => {
            if (!orderedUniqueCategories.includes(info.category)) {
                orderedUniqueCategories.push(info.category);
            }
        });
        const configs: Array<{ yAxisId: string; orientation: 'left' | 'right'; unitTypeLabel: UnitCategory; axisColor: string; lineStrokeDasharray?: string; }> = [];
        let leftAxesCount = 0;
        let rightAxesCount = 0;
        const maxAxesPerSide = 1;

        orderedUniqueCategories.forEach((category, index) => {
            if (configs.length >= (maxAxesPerSide * 2)) return;
            let assignedOrientation: 'left' | 'right';
            if (leftAxesCount < maxAxesPerSide) {
                assignedOrientation = 'left'; leftAxesCount++;
            } else if (rightAxesCount < maxAxesPerSide) {
                assignedOrientation = 'right'; rightAxesCount++;
            } else {
                assignedOrientation = 'left';
            }
            configs.push({
                yAxisId: category,
                orientation: assignedOrientation,
                unitTypeLabel: category,
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: HIERARCHICAL_LINE_STYLES[index % HIERARCHICAL_LINE_STYLES.length]
            });
        });
        if (configs.length === 0) { /* fallback */ }
        return configs.length > 0 ? configs : [{ yAxisId: 'left0', orientation: 'left' as const, unitTypeLabel: 'Value', axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280', lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE }];
    }, [unitInfoForPlottedIndicators, theme]);

    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        const yearMap = new Map<number, ChartDataPoint>();
        indicatorsToPlot.forEach(s => {
            s.values.forEach(val => {
                if (!yearMap.has(val.year)) { yearMap.set(val.year, { year: val.year }); }
            });
        });
        indicatorsToPlot.forEach(s => {
            const seriesKey: IndicatorSeriesKey = s.displayKey;
            s.values.forEach(val => {
                const yearDataPoint = yearMap.get(val.year);
                if (yearDataPoint) { yearDataPoint[seriesKey] = val.amount; }
            });
        });
        return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    }, [indicatorsToPlot]);

    const tooltipContentStyle = useMemo(() => (theme === 'dark' ? { backgroundColor: 'rgba(50, 50, 50, 0.85)', border: '1px solid #4A5568', borderRadius: '0.375rem', color: '#e2e8f0' } : { backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #cbd5e0', borderRadius: '0.375rem', color: '#1a202c' }), [theme]);
    const tooltipTextStyle = useMemo(() => (theme === 'dark' ? { color: '#e2e8f0' } : { color: '#1a202c' }), [theme]);

    // ----- Loading/Error States -----
    if (isLoading && !isFetching && allAvailableSeriesForSelection.length === 0 ) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chart data...</div>;
    }
    if (isError && !isLoading && errors) { // Check errors exists
        const firstError = errors.find(e => e !== null); // Ensure errors array is used correctly
        return <div className="p-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded">Error: {firstError?.message || 'Unknown error fetching data'}</div>;
    }
    if (allAvailableSeriesForSelection.length === 0 && !isLoading && !isFetching && !isError) {
        return <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">No indicators available. Make selections in filters.</div>;
    }

    return (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800 h-[500px] md:h-[600px] w-full flex flex-col">
            {/* UI for selecting which indicators (fetched & calculated) to plot */}
            {allAvailableSeriesForSelection.length > 0 && (
                <div className="mb-4 shrink-0 border-b dark:border-slate-700 pb-3">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">Plot on Chart:</h4>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
                        {allAvailableSeriesForSelection.map(series => { // series is PlottableChartSeries
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
                                        {series.uiDisplayName} {/* Use the pre-formatted display name */}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {isFetching && (<div className="p-1 text-xs text-center text-sky-600 dark:text-sky-400 shrink-0">Updating chart...</div>)}

            <div className="flex-grow min-h-0">
                {indicatorsToPlot.length > 0 && pivotedChartData.length > 0 && yAxisConfig && yAxisConfig.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pivotedChartData} margin={{ top: 40, right: yAxisConfig.some(ax=>ax.orientation === 'right') ? 60 : 20, left: yAxisConfig.some(ax=>ax.orientation === 'left') ? 60 : 5, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#e2e8f0"} />
                            <XAxis dataKey="year" dy={10} tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }} stroke={theme === 'dark' ? '#64748b' : '#d1d5db'} label={{ value: "Year", position: "insideBottom", offset: -15, fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#374151' }} />

                            {yAxisConfig.map(axis => (
                                <YAxis
                                    key={axis.yAxisId} yAxisId={axis.yAxisId} orientation={axis.orientation}
                                    stroke={axis.axisColor}
                                    strokeDasharray={axis.lineStrokeDasharray}
                                    tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits:1}) : value}
                                    tick={{ fontSize: 10, fill: axis.axisColor }}
                                    label={{ value: axis.unitTypeLabel, angle: 0, position: 'top', dy: -10, style: { textAnchor: 'middle', fontSize: 12, fill: axis.axisColor }}}
                                    width={55}
                                />
                            ))}

                            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipTextStyle} itemStyle={tooltipTextStyle} cursor={{ stroke: theme === 'dark' ? '#4A5568' : '#cbd5e0', strokeWidth: 1 }}/>
                            <Legend verticalAlign="top" wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c', maxHeight: '60px', overflowY: 'auto' }}/>

                            {/* unitInfoForPlottedIndicators now contains PlottableChartSeries objects as info.indicator */}
                            {unitInfoForPlottedIndicators.map((info, index) => {
                                const seriesKey = info.key; // This is the displayKey, used as dataKey for the Line
                                const axisConfigForThisLine = yAxisConfig.find(ax => ax.unitTypeLabel === info.category);
                                const lineYAxisId = axisConfigForThisLine?.yAxisId || (yAxisConfig[0]?.yAxisId || 'left0');
                                const lineStyleDashArray = axisConfigForThisLine?.lineStrokeDasharray;

                                return (
                                    <Line
                                        key={seriesKey} yAxisId={lineYAxisId} type="monotone" dataKey={seriesKey}
                                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                        strokeDasharray={lineStyleDashArray}
                                        strokeWidth={info.indicator.isCalculated ? 2.5 : 2} // Example: calculated lines thicker
                                        activeDot={{ r: 6, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        dot={{ r: 3, strokeWidth: 0, fill: LINE_COLORS[index % LINE_COLORS.length] }}
                                        name={info.indicator.uiDisplayName} // Use the pre-formatted name for legend
                                        connectNulls={true}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
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