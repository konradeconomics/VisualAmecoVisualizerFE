import { useQueries } from '@tanstack/react-query';
import { fetchSubchaptersByChapter } from '../api/subchapterApi';
import type {SubchapterDto} from '../types/dto/subchapter.dto';

export interface UseFetchSubchaptersResult {
    data: SubchapterDto[];
    isLoading: boolean;
    isError: boolean;
    errors: Error[];
}

export const useFetchSubchapters = (
    chapterIds: number[]
): UseFetchSubchaptersResult => {

    const queryOptions = chapterIds.map((id) => ({
        queryKey: ['subchapters', id],
        queryFn: () => fetchSubchaptersByChapter(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60,
    }));

    const results = useQueries({
        queries: queryOptions,
    });

    const isLoading = results.some((result) => result.isLoading);
    const isError = results.some((result) => result.isError);
    const errors = results
        .map((result) => result.error)
        .filter((error): error is Error => error != null);

    const combinedData = results
        .filter((result) => result.isSuccess && result.data)
        .flatMap((result) => result.data as SubchapterDto[]);

    const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());

    return { data: uniqueData, isLoading, isError, errors };
};