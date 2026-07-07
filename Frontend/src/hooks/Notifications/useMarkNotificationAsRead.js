import axios from "axios";
import { useState, useCallback } from "react";

export const useMarkNotificationAsRead = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // We pass setNotifications from our GET hook so we can instantly update the UI
    const markAsRead = useCallback(async (notificationId, setNotifications) => {
        if (!notificationId) return;

        setLoading(true);
        setError(null);

        // OPTIMISTIC UPDATE: Instantly remove the notification from the dropdown
        if (setNotifications) {
            setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
        }

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/notification/${notificationId}/read`,
                {}, // Empty body for a PATCH request
                { withCredentials: true }
            );

            return response.data;
        } catch (err) {
            console.error("Error marking notification as read: ", err);
            setError(err.response?.data?.message || "Failed to mark as read");
            // Note: If this fails, the notification is gone from the UI until they refresh. 
            // For a "read receipt", this is usually an acceptable tradeoff for UI speed.
        } finally {
            setLoading(false);
        }
    }, []);

    return { markAsRead, loading, error };
};