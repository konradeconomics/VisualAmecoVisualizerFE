import type {YearValueDto} from './yearValue.dto';

export interface IndicatorDto {
    variableCode: string;
    variableName: string;
    unit: string;
    subchapterName: string;
    chapterName: string;
    countryCode: string;
    countryName: string;
    values: YearValueDto[];
}
