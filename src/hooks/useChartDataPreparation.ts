import { useMemo } from 'react';
import type { PlottableChartSeries, ChartDataPoint, YAxisConfigEntry, LineRenderInfo } from '../types/PlottableChartSeries';
import type { UnitCategory } from '../utils/unitMapper';
import { useThemeStore } from '../store/themeStore';

const HIERARCHICAL_LINE_STYLES: (string | undefined)[] = [
    undefined, '5 5', '1 5', '10 2 2 2', '3 7',
];
const DEFAULT_AXIS_LINE_STYLE = undefined;

interface ChartDataPreparationResult {
    unitInfoForPlotting: LineRenderInfo[];
    yAxisConfig: YAxisConfigEntry[];
    pivotedChartData: ChartDataPoint[];
}

export const useChartDataPreparation = (
    indicatorsToPlot: PlottableChartSeries[]
): ChartDataPreparationResult => {
    const { theme } = useThemeStore(); // Assuming theme affects axis colors

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
                yAxisId: 'left0', orientation: 'left' as const,
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
        let leftAxesCount = 0;
        let rightAxesCount = 0;
        const maxAxesPerSide = 1; // Or 2 if you want to support up to 4 axes

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

        if (configs.length === 0) {
            return [{ yAxisId: 'left0', orientation: 'left' as const, unitTypeLabel: 'Value', axisColor: theme === 'dark' ? '#9ca3af' : '#6b7280', lineStrokeDasharray: DEFAULT_AXIS_LINE_STYLE }];
        }
        return configs;
    }, [unitInfoForPlotting, theme]);

    const pivotedChartData = useMemo((): ChartDataPoint[] => {
        if (!indicatorsToPlot || indicatorsToPlot.length === 0) return [];
        const yearMap = new Map<number, ChartDataPoint>();
        indicatorsToPlot.forEach(s => {
            s.values.forEach(val => {
                if (!yearMap.has(val.year)) { yearMap.set(val.year, { year: val.year }); }
            });
        });
        indicatorsToPlot.forEach(s => {
            const seriesKey: string = s.displayKey;
            s.values.forEach(val => {
                const yearDataPoint = yearMap.get(val.year);
                if (yearDataPoint) { yearDataPoint[seriesKey] = val.amount; }
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