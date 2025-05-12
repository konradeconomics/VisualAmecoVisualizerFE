import type { YearValueDto } from './dto/yearValue.dto';
import { type UnitCategory } from '../utils/unitMapper';

export interface PlottableChartSeries {
    displayKey: string;        // Unique key for selection state & Recharts dataKey (e.g., CCODE-VCODE or generated CALC-VCODE)
    isCalculated: boolean;     // Flag to distinguish type

    // Common fields from IndicatorDto & CalculatedSeriesDto needed for display & processing
    variableCode: string;      // Original or generated
    variableName: string;      // Original or user-defined for calculated
    unitCode: string;          // Original or synthetic
    unitDescription: string;   // Original or user-defined
    countryCode: string;       // e.g., "DEU" or "CALC"
    countryName: string;       // e.g., "Germany" or "Calculated"
    values: YearValueDto[];    // The time-series data

    // Fields derived for UI convenience during mapping
    uiDisplayName: string;     // For the "Plot on Chart" selector list: "Country - Variable (Readable Unit) [Calc]"
    readableUnit: string;      // Processed unit string using getReadableUnit
    category: UnitCategory;    // Processed unit category using getUnitCategory
}

export interface ChartDataPoint {
    year: number;
    [seriesKey: string]: number | undefined;
}

export interface YAxisConfigEntry {
    yAxisId: string;
    orientation: 'left' | 'right';
    unitTypeLabel: UnitCategory | string;
    axisColor: string;
    lineStrokeDasharray?: string;
}

export interface LineRenderInfo {
    key: string;
    readableUnit: string;
    category: UnitCategory;
    indicator: PlottableChartSeries;
}