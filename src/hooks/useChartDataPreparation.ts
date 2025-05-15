import { useMemo } from 'react';
import type { PlottableChartSeries, ChartDataPoint, YAxisConfigEntry, LineRenderInfo } from '../types/PlottableChartSeries';
import type { UnitCategory } from '../utils/unitMapper';
import { useThemeStore } from '../store/themeStore';

const HIERARCHICAL_LINE_STYLES: (string | undefined)[] = [
    undefined, '5 5', '1 5', '10 2 2 2', '3 7',
];
const DEFAULT_AXIS_LINE_STYLE = undefined;
const MAX_Y_AXES_TO_DISPLAY = 4;

interface ChartDataPreparationResult {
    unitInfoForPlotting: LineRenderInfo[];
    yAxisConfig: YAxisConfigEntry[];
    pivotedChartData: ChartDataPoint[];
}

export const useChartDataPreparation = (
    indicatorsToPlot: PlottableChartSeries[]
): ChartDataPreparationResult => {
    const { theme } = useThemeStore();

    const unitInfoForPlotting = useMemo((): LineRenderInfo[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        return indicatorsToPlot.map(series => ({
            key: series.displayKey,
            readableUnit: series.readableUnit,
            category: series.category,
            indicator: series,
        }));
    }, [indicatorsToPlot]);

    const yAxisConfig = useMemo((): YAxisConfigEntry[] => {
        if (!unitInfoForPlotting || unitInfoForPlotting.length === 0) {
            return [{
                yAxisId: 'left0',
                orientation: 'left' as const,
                unitTypeLabel: 'Value',
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE
            }];
        }

        const orderedUniqueCategories: UnitCategory[] = [];
        unitInfoForPlotting.forEach(info => {
            if (!orderedUniqueCategories.includes(info.category)) {
                orderedUniqueCategories.push(info.category);
            }
        });

        const configs: YAxisConfigEntry[] = [];

        orderedUniqueCategories.forEach((category, index) => {
            if (configs.length >= MAX_Y_AXES_TO_DISPLAY) return;

            let assignedOrientation: 'left' | 'right';
            
            if (index % 2 === 0) { 
                assignedOrientation = 'left';
            } else {
                assignedOrientation = 'right';
            }

            configs.push({
                yAxisId: category,
                orientation: assignedOrientation,
                unitTypeLabel: category,
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: HIERARCHICAL_LINE_STYLES[index % HIERARCHICAL_LINE_STYLES.length]
            });
        });

        if (configs.length === 0) {
            return [{
                yAxisId: 'left0',
                orientation: 'left' as const,
                unitTypeLabel: 'Value',
                axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
                lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE
            }];
        }
        return configs;
    }, [unitInfoForPlotting, theme]);

    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];

        const yearMap = new Map<number, ChartDataPoint>();
        indicatorsToPlot.forEach(series => {
            series.values.forEach(valuePoint => {
                if (!yearMap.has(valuePoint.year)) {
                    yearMap.set(valuePoint.year, { year: valuePoint.year });
                }
            });
        });

        indicatorsToPlot.forEach(series => {
            const seriesKey: string = series.displayKey;
            series.values.forEach(valuePoint => {
                const yearDataPoint = yearMap.get(valuePoint.year);
                if (yearDataPoint) {
                    yearDataPoint[seriesKey] = valuePoint.amount;
                }
            });
        });
        return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
    }, [indicatorsToPlot]);

    return {
        unitInfoForPlotting,
        yAxisConfig,
        pivotedChartData,
    };
};