import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useGetVideos = (limit = 10) => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = useCallback(async () => {
        if (loading || !hasMore) return; 
        
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/videos?page=${page}&limit=${limit}`);
            const docs = response.data?.data?.docs || [];
            const hasNextPage = response.data?.data?.hasNextPage || false;

            setVideos((prev) => {
                const combined = [...prev, ...docs];
                return Array.from(new Map(combined.map(video => [video._id, video])).values());
            });
            
            setHasMore(hasNextPage);
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, limit]); 

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    return { videos, loading, hasMore, loadMore };
};