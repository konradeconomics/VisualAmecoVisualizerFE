import API_BASE_URL from "../config.ts";

interface ApiClientOptions extends RequestInit {
}

async function apiClient<T>(
    endpoint: string,
    options?: ApiClientOptions
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) { /* Ignore */ }
            console.error('API Error Response:', errorData);
            throw new Error(
                `API call failed with status ${response.status}: ${
                    errorData?.message || response.statusText
                }`
            );
        }

        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
            return undefined as T;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
}

export default apiClient;
