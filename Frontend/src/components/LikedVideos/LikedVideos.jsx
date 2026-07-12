import React from 'react';
import { Link } from 'react-router-dom';
import { useGetLikedVideos } from '../../hooks/Likes/useGetLikedVideos.js';
import VideoCard from '../VideoCard/VideoCard.jsx'
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import Sidebar from '../Sidebar/Sidebar.jsx';
import BottomNav from '../BottomNav/BottomNav.jsx';
import { LuThumbsUp } from 'react-icons/lu';

const LikedVideos = () => {
    const { likedVideos, loading, error } = useGetLikedVideos();

    return (
        <div className="flex min-h-screen bg-black w-full pt-20 pb-16 md:pb-0">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                
                {/* Header Area matching WatchHistory style */}
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                    <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                        <LuThumbsUp size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
                </div>

                {/* Content Area with standard repo inline ternaries */}
                {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-red-900/30 p-8">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, index) => (
                            <VideoSkeleton key={index} />
                        ))}
                    </div>
                ) : likedVideos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <LuThumbsUp size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No liked videos yet</h2>
                        <p className="text-zinc-400 text-center max-w-md mb-6">
                            You haven't liked any videos yet. Videos you like will show up here.
                        </p>
                        <Link 
                            to="/"
                            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                            Explore Videos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {likedVideos?.map((video) => (
                            <VideoCard 
                                key={video._id} 
                                video={video} 
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <BottomNav />
        </div>
    );
};

export default LikedVideos;