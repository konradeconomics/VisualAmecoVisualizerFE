import type { YearValueDto} from './yearValue.dto';
import type { UnitCategory} from "../../utils/unitMapper.ts";

export interface CalculatedSeriesDto {
    variableCode: string;      // Unique generated code, e.g., "CALC-COUNTRYA-VAR1-DIVIDE-COUNTRYB-VAR2"
    variableName: string;      // User-defined or auto-generated, e.g., "GDP per Capita"
    unitCode: string;          // Can be a synthetic code like "RATIO", "CALC_UNIT" or derived
    unitDescription: string;   // User-defined or derived, e.g., "EUR / Person", "Ratio"
    countryCode: string;       // Can be "CALC", or derived if both source series are same country
    countryName: string;       // e.g., "Calculated Series" or specific country name
    values: YearValueDto[];    // The calculated {year, amount} pairs
    category: UnitCategory;    // Derived from its new unitDescription for Y-axis assignment

    sourceSeriesAKey?: string;
    sourceSeriesBKey?: string;
    operation?: string; // e.g., "divide", "subtract"
    isCalculated: true; // Flag to distinguish from fetched IndicatorDto
}