import React from 'react';
import { useWatchHistory } from '../../hooks/User/useWatchHistory.js';
import VideoCard from '../VideoCard/VideoCard.jsx';
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import { LuHistory } from 'react-icons/lu';
import Sidebar from '../Sidebar/Sidebar.jsx';

const WatchHistory = () => {
    const { loading, error, watchHistory } = useWatchHistory();

    return (
        <div className="flex min-h-screen bg-black w-full pt-20">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
                
                {/* Header Area */}
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                    <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                        <LuHistory size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Watch History</h1>
                </div>

                {/* Content Area */}
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
                ) : watchHistory?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <LuHistory size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No watch history</h2>
                        <p className="text-zinc-400 text-center max-w-md">
                            You haven't watched any videos yet. Videos you watch will show up here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {watchHistory?.map((video) => (
                            <VideoCard 
                                key={video._id} 
                                video={video} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchHistory;