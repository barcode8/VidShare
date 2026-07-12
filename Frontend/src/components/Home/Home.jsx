import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../Sidebar/Sidebar.jsx';
import BottomNav from '../BottomNav/BottomNav.jsx';
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import VideoCard from '../VideoCard/VideoCard.jsx';
import { useGetVideos } from '../../hooks/Video/useGetVideos.js';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, 
            delayChildren: 0.2    
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
    const { videos, loading, hasMore, loadMore } = useGetVideos(10);

    return (
        // Added pb-16 md:pb-0 to ensure the bottom nav doesn't cover content
        <div className="flex bg-black min-h-screen pt-20 pb-16 md:pb-0 font-roboto">
            <Sidebar />

            <motion.main 
                className="flex-1 overflow-y-auto h-[calc(100vh-64px)]"
                initial="hidden"
                animate="visible"
            >
                <div className="p-4 sm:p-6 md:p-10"> 
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12"
                    >
                        {videos.length > 0 ? (
                            videos.map((video) => (
                                <motion.div key={video._id} variants={itemVariants}>
                                    <VideoCard video={video} />
                                </motion.div>
                            ))
                        ) : (
                            !loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500"
                                >
                                    <p className="text-xl font-medium">No videos found</p>
                                    <p className="text-sm">Be the first one to upload a video!</p>
                                </motion.div>
                            )
                        )}

                        {loading && (
                            Array(6).fill(0).map((_, i) => (
                                <VideoSkeleton key={`skeleton-${i}`} />
                            ))
                        )}
                    </motion.div>

                    {hasMore && !loading && videos.length > 0 && (
                        <div className="flex justify-center mt-12 mb-6">
                            <button 
                                onClick={loadMore}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-6 rounded-full transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}

                    {!hasMore && videos.length > 0 && (
                        <div className="flex justify-center mt-12 mb-6 text-zinc-500 text-sm">
                            <p>You've reached the end!</p>
                        </div>
                    )}
                </div>
            </motion.main>
            
            {/* Render the mobile bottom navigation */}
            <BottomNav />
        </div>
    );
}