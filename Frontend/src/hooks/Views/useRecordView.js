import { useState } from "react";
import axios from "axios";

export const useRecordView = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const recordView = async (videoId) => {
        setLoading(true);
        setError(null);
        try {
            // Adjust the URL path based on your axios instance/setup
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/view/${videoId}`,
                {},
                {withCredentials : true}
            );
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record view");
        } finally {
            setLoading(false);
        }
    };

    return { recordView, loading, error };
};