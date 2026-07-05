import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Sidebar/Sidebar.jsx';
import VideoCard from '../VideoCard/VideoCard.jsx';
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import { useUserProfile } from '../../hooks/User/useUserProfile.js';
import { useToggleSubscription } from '../../hooks/Subscription/useToggleSubscription.js';
import { useDashboard } from '../../hooks/Dashboard/useDashboard.js';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';

// --- Framer Motion Variants ---
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
};

const tabContentFade = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function UserProfile() {
    const { username } = useParams();
    
    const { 
        loading: profileLoading, 
        error: profileError, 
        channel, 
        isSubscribed: initialIsSubscribed, 
        videoLoading, 
        videoError, 
        channelVideos 
    } = useUserProfile(username);

    const { toggleSubscription, isToggling, toggleError } = useToggleSubscription();

    const { 
        loading: dashLoading, 
        error: dashError, 
        dashboardData, 
        getDashboardData 
    } = useDashboard();
    
    // --- Playlists Hook Integration ---
    const {
        getUserPlaylists,
        loading: playlistsLoading,
        error: playlistsError,
        success: playlistsSuccess,
        userPlaylists
    } = useGetUserPlaylists();
    
    const [activeTab, setActiveTab] = useState("videos");
    const [localIsSubscribed, setLocalIsSubscribed] = useState(false);
    const [localSubCount, setLocalSubCount] = useState(0);

    useEffect(() => {
        if (channel) {
            setLocalIsSubscribed(initialIsSubscribed);
            setLocalSubCount(channel.subscribersCount || 0);
        }
    }, [channel, initialIsSubscribed]);

    const handleSubscribeToggle = async () => {
        if (!channel?._id) return;
        const result = await toggleSubscription(channel._id);
        if (result) {
            setLocalIsSubscribed(result.isSubscribed);
            setLocalSubCount(prev => result.isSubscribed ? prev + 1 : prev - 1);
        }
    };

    const handleAboutClick = () => {
        setActiveTab("about");
        if (!dashboardData && channel?._id) {
            getDashboardData(channel._id);
        }
    };

    const handlePlaylistsClick = () => {
        setActiveTab("playlists");
        // Only fetch if we haven't successfully fetched yet to save network requests
        if (!playlistsSuccess && channel?._id) {
            getUserPlaylists(channel._id);
        }
    };

    return (
        <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
            <Sidebar />

            <div className="flex-1 overflow-y-auto pb-10">
                {profileError && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500 text-lg font-medium bg-red-500/10 px-6 py-3 rounded-lg">
                            {profileError}
                        </p>
                    </div>
                )}

                {profileLoading && (
                    <div className="w-full animate-pulse">
                        <div className="w-full h-48 md:h-72 bg-zinc-800"></div>
                        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 flex gap-6">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-800 shrink-0"></div>
                            <div className="flex-1 mt-4">
                                <div className="h-8 bg-zinc-800 rounded w-1/3 mb-3"></div>
                                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                )}

                {!profileLoading && !profileError && channel && (
                    <motion.div 
                        variants={staggerContainer} 
                        initial="hidden" 
                        animate="visible" 
                        className="w-full"
                    >
                        {/* 1. The Banner */}
                        <motion.div variants={fadeUp} className="w-full h-48 md:h-72 bg-zinc-800 relative">
                            {channel.coverImage ? (
                                <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    No Cover Image
                                </div>
                            )}
                        </motion.div>

                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            {/* 2. Avatar and Channel Info */}
                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-6">
                                <img 
                                    src={channel.avatar || 'https://via.placeholder.com/150'} 
                                    alt={channel.fullName} 
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0f0f0f] object-cover bg-zinc-900 shrink-0 shadow-xl" 
                                />
                                
                                <div className="flex-1 text-center sm:text-left mt-2 sm:mt-4">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                        {channel.fullName}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-zinc-400 font-medium text-sm sm:text-base">
                                        <span>@{channel.username}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{localSubCount?.toLocaleString()} subscribers</span>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-6 shrink-0 flex flex-col items-center sm:items-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubscribeToggle}
                                        disabled={isToggling}
                                        className={`w-36 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed group ${
                                            localIsSubscribed 
                                                ? "bg-zinc-800 text-white border border-zinc-700 hover:bg-red-600/90 hover:border-red-600 hover:text-white" 
                                                : "bg-white hover:bg-zinc-200 text-black"
                                        }`}
                                    >
                                        {isToggling ? (
                                            "Wait..."
                                        ) : localIsSubscribed ? (
                                            <>
                                                <span className="block group-hover:hidden">Subscribed</span>
                                                <span className="hidden group-hover:block">Unsubscribe</span>
                                            </>
                                        ) : (
                                            "Subscribe"
                                        )}
                                    </motion.button>
                                    
                                    {toggleError && (
                                        <span className="text-red-500 text-xs mt-2 text-center w-full">{toggleError}</span>
                                    )}
                                </div>
                            </motion.div>

                            {/* 3. Navigation Tabs */}
                            <motion.div variants={fadeUp} className="mt-8 border-b border-zinc-800 relative">
                                <nav className="flex gap-8 px-2 relative z-10">
                                    <button 
                                        onClick={() => setActiveTab("videos")}
                                        className={`pb-3 font-medium px-1 transition-colors relative ${
                                            activeTab === "videos" ? "text-white" : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        Videos
                                        {activeTab === "videos" && (
                                            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                        )}
                                    </button>
                                    <button 
                                        onClick={handlePlaylistsClick}
                                        className={`pb-3 font-medium px-1 transition-colors relative ${
                                            activeTab === "playlists" ? "text-white" : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        Playlists
                                        {activeTab === "playlists" && (
                                            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleAboutClick}
                                        className={`pb-3 font-medium px-1 transition-colors relative ${
                                            activeTab === "about" ? "text-white" : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        About
                                        {activeTab === "about" && (
                                            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                        )}
                                    </button>
                                </nav>
                            </motion.div>

                            {/* 4. Dynamic Content Area */}
                            <motion.div variants={fadeUp} className="mt-6">
                                <AnimatePresence mode="wait">
                                    
                                    {/* VIDEOS TAB */}
                                    {activeTab === "videos" && (
                                        <motion.div key="videos" variants={tabContentFade} initial="hidden" animate="enter" exit="exit">
                                            {videoError && (
                                                <div className="py-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                                                    {videoError}
                                                </div>
                                            )}

                                            {videoLoading && !videoError && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                                    {Array(6).fill(0).map((_, i) => (
                                                        <VideoSkeleton key={i} />
                                                    ))}
                                                </div>
                                            )}

                                            {!videoLoading && !videoError && channelVideos && (
                                                <>
                                                    {channelVideos.length > 0 ? (
                                                        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                                                            {channelVideos.map((video) => (
                                                                <motion.div key={video._id} variants={fadeUp}>
                                                                    <VideoCard video={video} hideAvatar={true} />
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className="text-lg font-medium text-zinc-400">This channel has no videos.</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* PLAYLISTS TAB */}
                                    {activeTab === "playlists" && (
                                        <motion.div key="playlists" variants={tabContentFade} initial="hidden" animate="enter" exit="exit">
                                            {playlistsError && (
                                                <div className="py-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                                                    {playlistsError}
                                                </div>
                                            )}

                                            {playlistsLoading && !playlistsError && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {Array(3).fill(0).map((_, i) => (
                                                        <div key={i} className="h-36 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800"></div>
                                                    ))}
                                                </div>
                                            )}

                                            {!playlistsLoading && !playlistsError && (
                                                <>
                                                    {userPlaylists?.length > 0 ? (
                                                        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {userPlaylists.map((playlist) => (
                                                                <motion.div key={playlist._id} variants={fadeUp} whileHover={{ y: -4 }}>
                                                                    <Link 
                                                                        to={`/playlists/${playlist._id}`} 
                                                                        className="block h-full bg-[#121212] border border-zinc-800 p-6 rounded-2xl flex flex-col transition-all hover:bg-zinc-900 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 group"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-3 gap-4">
                                                                            <h3 className="text-white font-bold text-lg line-clamp-1 break-all group-hover:text-pink-100 transition-colors">
                                                                                {playlist.name}
                                                                            </h3>
                                                                            <span className="bg-pink-500/10 text-pink-500 border border-pink-500/20 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                                                                                {playlist.videos?.length || 0}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                                            {playlist.description || "No description provided."}
                                                                        </p>
                                                                        <div className="mt-auto flex justify-between items-center text-xs text-zinc-500 font-medium pt-4 border-t border-zinc-800/50">
                                                                            <span>{playlist.videos?.length || 0} videos</span>
                                                                            <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                    </Link>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                                                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                            </svg>
                                                            <p className="text-lg font-medium text-zinc-400">This channel has no playlists.</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ABOUT TAB */}
                                    {activeTab === "about" && (
                                        <motion.div key="about" variants={tabContentFade} initial="hidden" animate="enter" exit="exit" className="max-w-5xl">
                                            <h2 className="text-xl font-bold mb-6 text-white px-2">Channel Stats</h2>
                                            
                                            {dashLoading && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {[...Array(4)].map((_, i) => (
                                                        <div key={i} className="h-28 bg-zinc-800/50 rounded-xl animate-pulse"></div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {dashError && (
                                                <p className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{dashError}</p>
                                            )}
                                            
                                            {!dashLoading && !dashError && dashboardData && (
                                                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    
                                                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#181818] border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-[#222]">
                                                        <span className="text-zinc-400 text-sm font-medium mb-1">Subscribers</span>
                                                        <span className="text-3xl font-bold text-white">{dashboardData.totalSubscribers?.toLocaleString() || 0}</span>
                                                    </motion.div>

                                                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#181818] border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-[#222]">
                                                        <span className="text-zinc-400 text-sm font-medium mb-1">Videos</span>
                                                        <span className="text-3xl font-bold text-white">{dashboardData.totalVideos?.toLocaleString() || 0}</span>
                                                    </motion.div>

                                                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#181818] border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-[#222]">
                                                        <span className="text-zinc-400 text-sm font-medium mb-1">Total Views</span>
                                                        <span className="text-3xl font-bold text-white">{dashboardData.totalViews?.toLocaleString() || 0}</span>
                                                    </motion.div>

                                                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#181818] border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-[#222]">
                                                        <span className="text-zinc-400 text-sm font-medium mb-1">Total Likes</span>
                                                        <span className="text-3xl font-bold text-white">{dashboardData.totalLikes?.toLocaleString() || 0}</span>
                                                    </motion.div>

                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}