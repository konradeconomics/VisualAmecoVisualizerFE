import { useQuery } from '@tanstack/react-query';
import { fetchChapters } from '../api/chapterApi';
import type { ChapterDto } from '../types/dto/chapter.dto';

export const CHAPTERS_QUERY_KEY = ['chapters'];

export const useFetchChapters = () => {
    return useQuery<ChapterDto[], Error>({
        queryKey: CHAPTERS_QUERY_KEY,
        queryFn: fetchChapters,
        staleTime: 1000 * 60 * 60,
    });
};