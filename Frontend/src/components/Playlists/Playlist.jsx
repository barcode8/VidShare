import React, { useEffect, useState } from 'react';
import { LuListVideo, LuPlus, LuX } from 'react-icons/lu';
import Sidebar from '../Sidebar/Sidebar.jsx';
import BottomNav from '../BottomNav/BottomNav.jsx';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';
import { useCreatePlaylist } from '../../hooks/Playlist/useCreatePlaylist.js';
import { useDeletePlaylist } from '../../hooks/Playlist/useDeletePlaylist.js';

const Playlist = () => {
    const navigate = useNavigate(); 
    const { user } = useAuth();
    const { getUserPlaylists, loading: playlistLoading, error: playlistError, userPlaylists } = useGetUserPlaylists();
    const { formData, handleChange, handleSubmit, loading: creatingPlaylist, error: createError, success: createSuccess } = useCreatePlaylist();
    const { deletePlaylist, loading: deletingPlaylist, error: deleteError } = useDeletePlaylist();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const displayError = playlistError || createError || deleteError;
    const isLoading = playlistLoading || creatingPlaylist;

    useEffect(() => {
        if (user?._id) {
            getUserPlaylists(user._id);
        }
    }, [user?._id]);

    useEffect(() => {
        if (createSuccess && user?._id) {
            getUserPlaylists(user._id);
            setIsCreateModalOpen(false);
        }
    }, [createSuccess, user?._id]);

    const handleDeleteClicked = (playlist) => {
        setDeleteTarget(playlist);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeletingId(deleteTarget._id);
        const response = await deletePlaylist(deleteTarget._id);
        setDeletingId(null);
        setShowDeleteModal(false);
        setDeleteTarget(null);

        if (response && user?._id) {
            getUserPlaylists(user._id);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    return (
        <div className="flex min-h-screen bg-black w-full pt-20 pb-16 md:pb-0">
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-full text-pink-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                            <LuListVideo size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Playlists</h1>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
                    >
                        <LuPlus size={16} />
                        Create Playlist
                    </button>
                </div>

                {displayError ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-zinc-900/20 rounded-2xl border border-red-900/30 p-8">
                        <p className="text-red-500 text-lg">{displayError}</p>
                    </div>
                ) : isLoading ? (
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
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
                        >
                            Create your first playlist
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPlaylists?.map((playlist) => (
                            <div
                                key={playlist._id}
                                onClick={() => navigate(`/playlists/${playlist._id}`)}
                                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-pink-500/40 cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="relative block flex-1">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">{playlist.name}</h2>
                                            <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                                                {playlist.description || 'No description yet'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex-shrink-0">
                                        <span className="inline-flex h-8 min-w-[56px] items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 text-sm font-medium text-pink-400 transition-opacity duration-200 group-hover:opacity-0">
                                            {playlist.videos?.length || 0}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleDeleteClicked(playlist);
                                            }}
                                            disabled={deletingPlaylist && deletingId === playlist._id}
                                            className="absolute inset-0 hidden items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 px-3 text-xs font-semibold text-white transition duration-200 group-hover:flex disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingPlaylist && deletingId === playlist._id ? 'Deleting...' : 'Delete'}
                                        </button>
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
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />

            {/* Create Playlist Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                    <div
                        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-purple-950/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Create playlist</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                <LuX size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                await handleSubmit(e);
                            }}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">
                                    Playlist name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Morning Vibes"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-300">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add a short description"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingPlaylist}
                                    className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {creatingPlaylist ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-purple-950/30" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Delete playlist</h2>
                            <button
                                onClick={handleCancelDelete}
                                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                <LuX size={18} />
                            </button>
                        </div>
                        <div className="mt-4 rounded-2xl bg-zinc-950 p-4 border border-zinc-800">
                            <p className="text-sm text-zinc-300">
                                Are you sure you want to delete <span className="font-semibold text-white">{deleteTarget?.name}</span>?
                            </p>
                            <p className="mt-2 text-sm text-zinc-500">
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deletingPlaylist && deletingId === deleteTarget?._id}
                                className="rounded-full bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingPlaylist && deletingId === deleteTarget?._id ? 'Deleting...' : 'Delete playlist'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;