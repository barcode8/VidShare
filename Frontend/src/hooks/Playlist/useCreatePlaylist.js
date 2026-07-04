import axios from "axios";
import { useState } from "react";

export const useCreatePlaylist = ()=>{
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [createdPlaylist, setCreatedPlaylist] = useState(null)

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        setSuccess(false)
        setCreatedPlaylist(null)

        const data = {
            name : formData.name,
            description : formData.description
        }

        try {
            setLoading(true)

            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/playlist`, data, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            setSuccess(true)
            setCreatedPlaylist(res.data.data)
            setFormData({ name: "", description: "" })
        } catch (error) {
            const trimmedError = {
                statusCode: error.response?.status,
                message: error.response?.data?.message || "An error occurred"
            }
            console.log(trimmedError)
            setError(trimmedError.message);
        } finally {
            setLoading(false)
        }
    }
    
    return { formData, handleChange, handleSubmit, loading, error, success, createdPlaylist }
}