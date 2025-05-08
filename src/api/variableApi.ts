import apiClient from './apiClient';
import type { VariableDto } from '../types/dto/variable.dto'; // Adjust path if needed

/**
 * Fetches a list of variables for a SINGLE subchapter ID.
 * Corresponds to: GET /api/variables?subchapterId={id}
 */
export const fetchVariablesBySubchapter = async (
    subchapterId: number
): Promise<VariableDto[]> => {
    if (!subchapterId) {
        return Promise.resolve([]);
    }
    // Log the specific API call being made
    console.log(`Workspaceing variables for subchapterId: ${subchapterId}`);
    return apiClient<VariableDto[]>(`/variables?subchapterId=${subchapterId}`);
};

/**
 * Fetches a list of variables for a SINGLE chapter ID.
 * Corresponds to: GET /api/variables?chapterId={id}
 */
export const fetchVariablesByChapter = async (
    chapterId: number
): Promise<VariableDto[]> => {
    if (!chapterId) {
        return Promise.resolve([]);
    }
    // Log the specific API call being made
    console.log(`Workspaceing variables for chapterId: ${chapterId}`);
    return apiClient<VariableDto[]>(`/variables?chapterId=${chapterId}`);
};