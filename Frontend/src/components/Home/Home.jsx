import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Sidebar from '../Sidebar/Sidebar.jsx';
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import VideoCard from '../VideoCard/VideoCard.jsx';

// Animation variants for the staggering effect
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Delays each child animation by 0.1s
            delayChildren: 0.2    // Small delay before the first animation starts
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.4, ease: "easeOut" } 
    }
};

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/videos`);
                if (response.data?.success) {
                    setVideos(response.data.data.docs || []);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="flex bg-black min-h-screen pt-20 font-roboto">
            <Sidebar />

            <motion.main 
                className="flex-1 overflow-y-auto h-[calc(100vh-64px)]"
                initial="hidden"
                animate="visible"
            >
                <div className="p-6 md:p-10"> 
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12"
                    >
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <VideoSkeleton key={i} />)
                        ) : videos.length > 0 ? (
                            videos.map((video) => (
                                <motion.div key={video._id} variants={itemVariants}>
                                    <VideoCard video={video} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500"
                            >
                                <p className="text-xl font-medium">No videos found</p>
                                <p className="text-sm">Be the first one to upload a video!</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
}