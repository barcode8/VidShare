// src/hooks/Comments/useGetCommentReplies.js
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

export const useGetCommentReplies = (commentId, limit = 10) => {
    const [replies, setReplies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Reset state if the parent comment ID changes
    useEffect(() => {
        setReplies([]);
        setPage(1);
        setHasMore(true);
        setError(null);
    }, [commentId]);

    const fetchReplies = useCallback(async () => {
        if (!commentId || loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/comments/c/${commentId}/replies?page=${page}&limit=${limit}`,
                { withCredentials: true }
            );

            const docs = response.data?.data?.docs || [];
            const hasNextPage = response.data?.data?.hasNextPage || false;

            setReplies((prev) => {
                // If page is 1, replace array. Otherwise, append.
                const combined = page === 1 ? docs : [...prev, ...docs];
                // Deduplicate by _id to prevent Strict Mode double-renders
                return Array.from(new Map(combined.map(reply => [reply._id, reply])).values());
            });

            setHasMore(hasNextPage);
        } catch (err) {
            console.error("Error fetching replies: ", err);
            setError(err.response?.data?.message || "Failed to load replies");
        } finally {
            setLoading(false);
        }
    }, [commentId, page, hasMore, limit]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    return { replies, setReplies, loading, error, hasMore, loadMore };
};