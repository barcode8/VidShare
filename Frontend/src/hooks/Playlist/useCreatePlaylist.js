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

    const handleChange = (e) => {
        //So here what we are doing is that basically whenever onChange is triggered, the object would be set to empty and if we proceed normally with just asignment of one specific attribute that was changed, we would have one valid property and 2 empty ones, hence we use the spread command alongside prev which basically allows us to append the last valid entries of the object and then modify the value of whatever attribute the user targets
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)

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
                withCredentials: true//Not using will cause the request to exclude the cookie, which the backend will then reject because of CORS
            })
            setSuccess(true)
            setFormData({})
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
    
    return { formData, handleChange, handleSubmit, loading, error, success }
}