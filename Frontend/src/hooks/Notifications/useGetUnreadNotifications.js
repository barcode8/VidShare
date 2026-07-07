import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const useGetUnreadNotifications = (limit = 10) => {
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Fetch Historical Notifications (Standard HTTP)
    const fetchNotifications = useCallback(async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification?page=${page}&limit=${limit}`,
                { withCredentials: true } 
            );

            const docs = response.data?.data?.docs || [];
            const hasNextPage = response.data?.data?.hasNextPage || false;

            setNotifications((prev) => {
                const combined = page === 1 ? docs : [...prev, ...docs];
                return Array.from(new Map(combined.map(notif => [notif._id, notif])).values());
            });

            setHasMore(hasNextPage);
        } catch (err) {
            console.error("Error fetching notifications: ", err);
            setError(err.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, limit]);

    // Trigger the historical fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // THE REAL-TIME SSE LISTENER 
    useEffect(() => {
        // EventSource is native to JavaScript (No axios needed for this part)
        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/stream`, 
            { withCredentials: true } // This sends our JWT cookies to the protected route
        );

        // Whenever the backend shouts down the pipe (res.write), this triggers
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Ignore the initial heartbeat we set up in the backend
            if (data.type === "connected") {
                console.log("SSE Connection Established");
                return;
            }

            // If it's a real notification, snap it to the very top of the list!
            setNotifications(prev => [data, ...prev]);
        };

        eventSource.onerror = (err) => {
            console.error("SSE Stream Error:", err);
            eventSource.close(); 
        };

        // THE MOST IMPORTANT PART: The Cleanup Function
        // If the user logs out or leaves the page, React runs this to politely hang up the phone.
        return () => {
            eventSource.close();
        };
    }, []); // Empty dependency array ensures this pipe only opens ONCE when the app mounts

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    return { notifications, setNotifications, loading, error, hasMore, loadMore };
};