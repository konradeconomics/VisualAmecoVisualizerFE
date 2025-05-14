import { useQueries } from '@tanstack/react-query';
import {
    fetchVariablesBySubchapter,
    fetchVariablesByChapter,
} from '../api/variableApi';
import type { VariableDto } from '../types/dto/variable.dto';
import { useFilterSelectionsStore} from "../store/filterSelectionStore.ts";

export interface UseFilteredVariablesResult {
    data: VariableDto[];
    isLoading: boolean;
    isError: boolean;
    errors: Error[];
    fetchStatus: 'idle' | 'fetching' | 'error' | 'success';
    isFetchingBasedOn: 'chapters' | 'subchapters' | 'none';
}

export const useFilteredVariables = (): UseFilteredVariablesResult => {
    const chapterIds = useFilterSelectionsStore((state) => state.selectedChapterIds);
    const subchapterIds = useFilterSelectionsStore((state) => state.selectedSubchapterIds);

    let queryOptions: any[] = []; // Use 'any' for query options array flexibility with useQueries
    let isFetchingBasedOn: 'chapters' | 'subchapters' | 'none' = 'none';

    if (subchapterIds.length > 0) {
        isFetchingBasedOn = 'subchapters';
        queryOptions = subchapterIds.map((id) => ({
            queryKey: ['variables', 'subchapter', id], // Unique key per subchapter
            queryFn: () => fetchVariablesBySubchapter(id),
            enabled: !!id,
            staleTime: 1000 * 60 * 5,
        }));
    }
    else if (chapterIds.length > 0) {
        isFetchingBasedOn = 'chapters';
        queryOptions = chapterIds.map((id) => ({
            queryKey: ['variables', 'chapter', id], // Unique key per chapter
            queryFn: () => fetchVariablesByChapter(id),
            enabled: !!id,
            staleTime: 1000 * 60 * 5,
        }));
    }

    const results = useQueries({
        queries: queryOptions,
    });

    const isLoading = results.some((result) => result.isLoading || result.isFetching); // Consider isFetching too
    const isError = results.some((result) => result.isError);
    const errors = results
        .map((result) => result.error)
        .filter((error): error is Error => error != null);

    const combinedData = results
        .filter((result) => result.isSuccess && result.data)
        .flatMap((result) => result.data as VariableDto[]);

    const uniqueData = Array.from(
        new Map(combinedData.map((item) => [item.code, item])).values()
    );

    uniqueData.sort((a, b) => a.name.localeCompare(b.name));

    let fetchStatus: UseFilteredVariablesResult['fetchStatus'] = 'idle';
    if (queryOptions.length === 0) {
        fetchStatus = 'idle';
    } else if (isLoading) {
        fetchStatus = 'fetching';
    } else if (isError) {
        fetchStatus = 'error';
    } else {
        fetchStatus = 'success';
    }
    
    return { data: uniqueData, isLoading, isError, errors, fetchStatus, isFetchingBasedOn };
};