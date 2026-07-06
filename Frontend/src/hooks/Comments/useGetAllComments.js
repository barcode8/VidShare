import axios from "axios";
import { useEffect, useState, useCallback } from "react";

export const useGetAllComments = (videoId, limit = 10) => {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // CRITICAL: Reset state if the user clicks a recommended video
    useEffect(() => {
        setComments([]);
        setPage(1);
        setHasMore(true);
        setError(null);
    }, [videoId]);

    const fetchComments = useCallback(async () => {
        if (!videoId || loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/comments/${videoId}?page=${page}&limit=${limit}`,
                { withCredentials: true }
            );

            const docs = response.data?.data?.docs || [];
            const hasNextPage = response.data?.data?.hasNextPage || false;

            setComments((prev) => {
                // If page is 1, replace array (handles video switching). Otherwise, append.
                const combined = page === 1 ? docs : [...prev, ...docs];
                // Deduplicate by _id to prevent Strict Mode double-renders
                return Array.from(new Map(combined.map(comment => [comment._id, comment])).values());
            });

            setHasMore(hasNextPage);
        } catch (err) {
            console.error("Error fetching comments: ", err);
            setError(err.response?.data?.message || "Failed to load comments");
        } finally {
            setLoading(false);
        }
    }, [videoId, page, hasMore, limit]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    return { comments, setComments, loading, error, hasMore, loadMore };
};