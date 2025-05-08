import apiClient from './apiClient';
import type {SubchapterDto} from '../types/dto/subchapter.dto';

/**
 * Fetches a list of subchapters for a SINGLE chapter ID.
 * Corresponds to: GET /api/subchapters?chapterId={id}
 */
export const fetchSubchaptersByChapter = async (
    chapterId: number
): Promise<SubchapterDto[]> => {
    if (!chapterId) {
        return Promise.resolve([]);
    }
    return apiClient<SubchapterDto[]>(`/subchapters?chapterId=${chapterId}`);
};