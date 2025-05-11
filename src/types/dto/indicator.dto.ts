import type {YearValueDto} from './yearValue.dto';

export interface IndicatorDto {
    variableCode: string;
    variableName: string;
    unitCode: string;
    unitDescription: string;
    subchapterName: string;
    chapterName: string;
    countryCode: string;
    countryName: string;
    values: YearValueDto[];
}
