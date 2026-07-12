import { useState } from "react";
import axios from "axios";

/* This file's main functions include-
 */

export const useUploadVideo = ()=>{

    const [formData, setFormData] = useState({
        title : "",
        description : "",
    })

    //Manage file states and UI
    const [videoFile, setVideoFile] = useState(null)
    const [thumbnail, setThumbnailFile] = useState(null)
    const [draftId, setDraftId] = useState(null)
    const [dragActive, setDragActive] = useState(null)

    //Manage request states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    //Handle text input changes
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    //Initialize video to get draft id from backend
    const initVideo = async (file)=>{
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            setError("File size exceeds the 100MB limit. Please select a smaller video.");
            return; // Abort the upload process
        }

        // Clear any previous errors if the new file is valid
        setError(null);
        setVideoFile(file)

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/videos/init`,
                {},
                {withCredentials : true}
            )
            setDraftId(res.data.data.videoId);
        } catch (err) {
            console.error("Failed to initialize video upload:", err);
            setError("Failed to generate a video ID. Please try again.");
        }
    }

    // Drag and Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            initVideo(e.dataTransfer.files[0]);
        }
    };

    const handleVideoSelect = (e)=>{
        if(e.target.files && e.target.files[0]){
            initVideo(e.target.files[0])
        }
    }

    const handleThumbnailSelect = (e)=>{
        if(e.target.files && e.target.files[0]){
            setThumbnailFile(e.target.files[0])
        }
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();

        const data = new FormData();

        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("videoFile", videoFile);
        if (thumbnail) {
            data.append("thumbnail", thumbnail);
        }

        setError(null);
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/videos/${draftId || ""}`, data, {
                headers:{
                    "Content-Type": "multipart/form-data",
                },
                withCredentials : true
            })

            setSuccess(true)
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred during upload";
            console.error(errorMessage);
            setError(errorMessage);
        }finally{
            setLoading(false)
        }
    }

    const clearVideo = () => {
        setVideoFile(null);
        setDraftId(null);
    };

    return {
        formData,
        videoFile,
        thumbnail,
        draftId,
        dragActive,
        loading,
        error,
        success,
        handleChange,
        handleDrag,
        handleDrop,
        handleVideoSelect,
        handleThumbnailSelect,
        handleSubmit,
        clearVideo
    };
}