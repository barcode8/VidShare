import { useState, useCallback } from "react";
import axios from "axios";

export const useAddVideoToWatchHistory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addToHistory = useCallback(async (videoId) => {
        if (!videoId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/add/${videoId}`,
                {}, // Empty body because the controller only needs the URL param
                { withCredentials: true } // Crucial for verifyJwt middleware
            );

            return response.data;
        } catch (err) {
            console.error("Error adding video to watch history: ", err);
            setError(err.response?.data?.message || "Failed to update watch history");
        } finally {
            setLoading(false);
        }
    }, []);

    return { addToHistory, loading, error };
};