import apiClient from './apiClient';
import type { ChapterDto } from '../types/dto/chapter.dto';

/**
 * Fetches a list of all available chapters.
 * Corresponds to: GET /api/chapters
 */
export const fetchChapters = async (): Promise<ChapterDto[]> => {
    return apiClient<ChapterDto[]>('/chapters');
};
