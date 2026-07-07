import { useState, useEffect } from "react";
import axios from "axios";

export const useWatchHistory = ()=>{
    const [watchHistory, setWatchHistory] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        const fetchWatchHistory = async ()=>{
            setLoading(true)
            setError(null)

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/watch-history`,{
                    withCredentials : true
                })
                const historyData = response.data.data || []
                setWatchHistory(historyData.reverse())
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch watch history");
            } finally {
                setLoading(false)
            }
        }

        fetchWatchHistory()
    },[])

    return {loading, error, watchHistory}
}