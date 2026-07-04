import React from 'react';
import { LuX } from 'react-icons/lu';

export default function PlaylistSaveModal({
    isOpen,
    onClose,
    playlistItems = [],
    selectedPlaylistId,
    onSelectPlaylist,
    onSave,
    saveLoading,
    modalMessage,
    userPlaylistsLoading,
    userPlaylistsError,
    playlistForm,
    onPlaylistFormChange,
    onCreatePlaylistSubmit,
    creatingPlaylist,
    addToPlaylistError,
    createPlaylistError
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-purple-950/40" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Save to playlist</h2>
                        <p className="mt-1 text-sm text-zinc-400">Add this video to one of your playlists or create a new one.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <LuX size={20} />
                    </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Your playlists</h3>
                                    <p className="text-sm text-zinc-500">Select an existing playlist to save this video.</p>
                                </div>
                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
                                    {playlistItems?.length || 0}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3 max-h-[320px] overflow-y-auto pr-1">
                                {userPlaylistsLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(4)].map((_, index) => (
                                            <div key={index} className="h-16 rounded-3xl bg-zinc-900 animate-pulse" />
                                        ))}
                                    </div>
                                ) : userPlaylistsError ? (
                                    <div className="rounded-3xl border border-red-600/20 bg-red-600/10 p-4 text-sm text-red-200">
                                        {userPlaylistsError}
                                    </div>
                                ) : playlistItems?.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-5 text-sm text-zinc-400">
                                        You don’t have any playlists yet. Create one on the right to save this video.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {playlistItems.map((playlist) => (
                                            <button
                                                key={playlist._id}
                                                type="button"
                                                onClick={() => onSelectPlaylist(playlist._id)}
                                                className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${selectedPlaylistId === playlist._id ? 'border-pink-500 bg-pink-500/10 text-white shadow-sm shadow-pink-500/10' : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-pink-500/40 hover:bg-zinc-900/90'}`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white line-clamp-1">{playlist.name}</h4>
                                                        <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{playlist.description || 'No description'}</p>
                                                    </div>
                                                    <span className="text-xs text-zinc-400">{playlist.videos?.length || 0}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                            <h3 className="text-lg font-semibold text-white">Status</h3>
                            <p className="mt-2 text-sm text-zinc-400">{modalMessage || 'Select a playlist and tap save.'}</p>
                            {addToPlaylistError && <p className="mt-3 rounded-2xl bg-red-600/10 p-3 text-sm text-red-300">{addToPlaylistError}</p>}
                            {createPlaylistError && <p className="mt-3 rounded-2xl bg-red-600/10 p-3 text-sm text-red-300">{createPlaylistError}</p>}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                        <h3 className="text-lg font-semibold text-white">Create playlist</h3>
                        <p className="mt-2 text-sm text-zinc-500">Make a new playlist without leaving the modal.</p>

                        <form onSubmit={onCreatePlaylistSubmit} className="mt-5 space-y-4">
                            <label className="block text-sm font-medium text-zinc-300">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={playlistForm.name || ''}
                                onChange={onPlaylistFormChange}
                                placeholder="Playlist name"
                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-500"
                                required
                            />

                            <label className="block text-sm font-medium text-zinc-300">Description</label>
                            <textarea
                                id="description"
                                rows="3"
                                value={playlistForm.description || ''}
                                onChange={onPlaylistFormChange}
                                placeholder="Optional description"
                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-500"
                            />

                            <button
                                type="submit"
                                disabled={creatingPlaylist}
                                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {creatingPlaylist ? 'Creating...' : 'Create playlist'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saveLoading || !selectedPlaylistId}
                        className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saveLoading ? 'Saving...' : 'Save video'}
                    </button>
                </div>
            </div>
        </div>
    );
}
