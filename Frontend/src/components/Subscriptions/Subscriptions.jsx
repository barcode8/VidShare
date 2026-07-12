import React from 'react';
import { Link } from 'react-router-dom';
import { LuSquarePlay, LuUserPlus } from 'react-icons/lu';
import { useGetSubscribedChannels } from '../../hooks/Subscription/useGetSubscribedChannels.js';
import Sidebar from '../Sidebar/Sidebar.jsx';
import BottomNav from '../BottomNav/BottomNav.jsx';

export default function Subscriptions() {
    const { subscribedChannels, loading, error } = useGetSubscribedChannels();

    return (
        <div className="flex min-h-screen bg-black w-full pt-20 pb-16 md:pb-0 font-roboto">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                
                {/* Header Area matching your other pages */}
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                    <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                        <LuSquarePlay size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
                </div>

                {/* Content Area */}
                {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-red-900/30 p-8">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center animate-pulse">
                                <div className="w-24 h-24 rounded-full bg-zinc-800 mb-4"></div>
                                <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-zinc-800 rounded-full w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : subscribedChannels?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <LuUserPlus size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No subscriptions yet</h2>
                        <p className="text-zinc-400 text-center max-w-md mb-6">
                            You haven't subscribed to any channels yet. Discover new creators and subscribe to fill your feed.
                        </p>
                        <Link 
                            to="/"
                            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 font-medium"
                        >
                            Explore Channels
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {subscribedChannels?.map((sub) => {
                            const channel = sub.channelDetails;
                            const avatarUrl = channel?.avatar || `https://ui-avatars.com/api/?name=${channel?.username || 'U'}&background=random`;

                            return (
                                <Link 
                                    key={sub._id} 
                                    to={`/channel/${channel?.username}`}
                                    className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(147,51,234,0.15)] group"
                                >
                                    <div className="relative mb-4">
                                        <img 
                                            src={avatarUrl} 
                                            alt={channel?.username} 
                                            className="w-24 h-24 rounded-full object-cover border-2 border-transparent group-hover:border-purple-500 transition-colors bg-zinc-800" 
                                        />
                                    </div>
                                    <h3 className="text-white font-bold text-lg line-clamp-1 group-hover:text-purple-400 transition-colors">
                                        {channel?.fullName || channel?.username}
                                    </h3>
                                    <p className="text-zinc-400 text-sm mb-5">
                                        @{channel?.username}
                                    </p>
                                    <span className="w-full bg-zinc-800 group-hover:bg-purple-600/20 group-hover:text-purple-300 text-zinc-300 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        View Channel
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}