import axios from "axios";
import { useState } from "react";

export const useAddCommentReply = () => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    const handleSubmit = async (e, commentId) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const data = {
            content: content
        };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/comments/c/${commentId}/replies`, 
                data, 
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            );

            setSuccess(true);
            setContent("");
            return response.data; // Useful if the UI needs to instantly append the new reply
        } catch (err) {
            console.error("Error adding reply:", err);
            setError(err.response?.data?.message || err.message || "Failed to add the reply");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { content, setContent, handleChange, handleSubmit, loading, error, success };
};