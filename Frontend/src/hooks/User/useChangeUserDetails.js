import { useState } from "react";
import axios from "axios";

export const useChangeUserDetails = () => {
    const [fullName, setFullName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFullNameChange = (e) => setFullName(e.target.value);

    // Accept files directly instead of relying on input id
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatar(file);
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setCoverImage(file);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (fullName.trim() !== "") {
                await axios.patch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/change-details`,
                    { fullName },
                    { headers: { "Content-Type": "application/json" }, withCredentials: true }
                );
            }

            if (avatar) {
                const formData = new FormData();
                formData.append("avatar", avatar);
                await axios.patch(
                    "${import.meta.env.VITE_API_BASE_URL}/api/v1/users/change-avatar",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
                );
            }

            if (coverImage) {
                const formData = new FormData();
                formData.append("coverImage", coverImage);
                await axios.patch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/change-coverimage`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
                );
            }

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return {
        fullName,
        avatar,
        coverImage,
        handleFullNameChange,
        handleAvatarChange,
        handleCoverImageChange,
        handleSubmit,
        loading,
        error,
        success,
    };
};