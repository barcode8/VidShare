import React, { useEffect } from 'react';
import { LuListVideo } from 'react-icons/lu';
import Sidebar from '../Sidebar/Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';

const Playlist = () => {
    const { user } = useAuth();
    const { getUserPlaylists, loading, error, userPlaylists } = useGetUserPlaylists();

    useEffect(() => {
        if (user?._id) {
            getUserPlaylists(user._id);
        }
    }, [user?._id]);

    return (
        <div className="flex min-h-screen bg-black w-full pt-20">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                    <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                        <LuListVideo size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Playlists</h1>
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-red-900/30 p-8">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 animate-pulse">
                                <div className="h-4 w-2/3 bg-zinc-800 rounded mb-4"></div>
                                <div className="h-3 w-full bg-zinc-800 rounded mb-2"></div>
                                <div className="h-3 w-4/5 bg-zinc-800 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : userPlaylists?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <LuListVideo size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No playlists yet</h2>
                        <p className="text-zinc-400 text-center max-w-md">
                            You haven’t created any playlists yet. New playlists will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPlaylists?.map((playlist) => (
                            <div
                                key={playlist._id}
                                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-pink-500/40"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">{playlist.name}</h2>
                                            <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                                                {playlist.description || 'No description yet'}
                                            </p>
                                        </div>
                                        <div className="rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-sm font-medium text-pink-400">
                                            {playlist.videos?.length || 0}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
                                        <span>
                                            {playlist.videos?.length || 0} video{(playlist.videos?.length || 0) === 1 ? '' : 's'}
                                        </span>
                                        {playlist.createdAt ? (
                                            <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Playlist;
