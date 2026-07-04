import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LuListVideo } from 'react-icons/lu';
import Sidebar from '../Sidebar/Sidebar.jsx';
import VideoCard from '../VideoCard/VideoCard.jsx';
import { useGetPlaylistById } from '../../hooks/Playlist/useGetPlaylistById.js';

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const { getPlaylistById, loading, error, playlist } = useGetPlaylistById();

    useEffect(() => {
        if (playlistId) {
            getPlaylistById(playlistId);
        }
    }, [playlistId]);

    return (
        <div className="flex min-h-screen bg-black w-full pt-20">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-zinc-800">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                                <LuListVideo size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{playlist?.name || 'Playlist'}</h1>
                                <p className="text-sm text-zinc-400">{playlist?.description || 'No description available'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-800 w-fit"
                        >
                            ← Back to playlists
                        </button>
                    </div>
                    <div className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-pink-400">
                        {(playlist?.totalVideos ?? playlist?.videos?.length) || 0} video{(playlist?.totalVideos ?? playlist?.videos?.length) === 1 ? '' : 's'}
                    </div>
                </div>

                {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-red-900/30 p-8">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 animate-pulse">
                                <div className="h-40 bg-zinc-800 rounded-xl mb-4"></div>
                                <div className="h-4 bg-zinc-800 rounded mb-3"></div>
                                <div className="h-3 bg-zinc-800 rounded w-4/5"></div>
                            </div>
                        ))}
                    </div>
                ) : !playlist ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-zinc-800 p-8">
                        <LuListVideo size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Playlist not found</h2>
                        <p className="text-zinc-400 text-center max-w-md">
                            We couldn’t load this playlist. It may have been removed or the link is invalid.
                        </p>
                    </div>
                ) : playlist.videos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <LuListVideo size={48} className="text-zinc-600 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">This playlist is empty</h2>
                        <p className="text-zinc-400 text-center max-w-md">
                            Add videos to this playlist to see them here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playlist.videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistDetail;
