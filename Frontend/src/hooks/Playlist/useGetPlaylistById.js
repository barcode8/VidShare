import axios from "axios";
import { useState } from "react";

export const useGetPlaylistById = ()=>{

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [playlist, setPlaylist] = useState(null)

    const getPlaylistById = async (playlistId)=>{
        setError(null)
        setLoading(true)

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/playlist/${playlistId}`,{
                withCredentials : true
            })

            const payload = res.data.data;
            const playlistData = Array.isArray(payload) ? payload[0] : payload;
            setPlaylist(playlistData || null)
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to fetch playlist";
            console.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false)
        }
    }

    return {getPlaylistById, loading, error, playlist}
}