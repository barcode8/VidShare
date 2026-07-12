import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuListPlus, LuEllipsisVertical, LuShare2 } from 'react-icons/lu';
import { formatDuration } from '../../utils/formatTime.js';
import PlaylistSaveModal from '../PlaylistModal/PlaylistSaveModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';
import { useCreatePlaylist } from '../../hooks/Playlist/useCreatePlaylist.js';
import { useAddVideoToPlaylist } from '../../hooks/Playlist/useAddVideoToPlaylist.js';

export default function VideoCard({ video, hideAvatar = false, layout = "vertical" }) {
    const isHorizontal = layout === "horizontal";
    const channelUrl = `/channel/${video.ownerDetails?.username || ""}`;

    // --- State for Menus and Modals ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [modalMessage, setModalMessage] = useState("");

    // --- Hooks ---
    const { user } = useAuth();
    const { getUserPlaylists, loading: userPlaylistsLoading, error: userPlaylistsError, userPlaylists } = useGetUserPlaylists();
    const { formData, handleChange, handleSubmit, loading: creatingPlaylist, error: createPlaylistError, success: createSuccess } = useCreatePlaylist();
    const { addVideoToPlaylist, loading: saveLoading, error: addToPlaylistError } = useAddVideoToPlaylist();

    useEffect(() => {
        if (isPlaylistModalOpen && user?._id) {
            getUserPlaylists(user._id);
        }
    }, [isPlaylistModalOpen, user?._id]);

    useEffect(() => {
        if (createSuccess && user?._id) {
            getUserPlaylists(user._id);
        }
    }, [createSuccess, user?._id]);

    // --- Handlers ---
    const handleSaveToPlaylist = async () => {
        if (!selectedPlaylistId) {
            setModalMessage("Please select a playlist first.");
            return;
        }
        const success = await addVideoToPlaylist(video._id, selectedPlaylistId);
        if (success) {
            setModalMessage("Video added to playlist successfully!");
            setTimeout(() => {
                setIsPlaylistModalOpen(false);
                setModalMessage("");
                setSelectedPlaylistId(null);
            }, 1500);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
        const url = `${window.location.origin}/watch/${video._id}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
        setIsShareModalOpen(true);
        setTimeout(() => setIsShareModalOpen(false), 2000);
    };

    return (
        <div className={`group flex ${isHorizontal ? 'flex-row gap-3' : 'flex-col gap-4'}`}>
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className={`relative aspect-video rounded-xl overflow-hidden bg-zinc-900 block shrink-0 ${isHorizontal ? 'w-40' : 'w-full'}`}>
                <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={video.title} />
                <span className={`absolute bg-black/90 text-white font-bold rounded-md ${isHorizontal ? 'bottom-1 right-1 text-[10px] px-1.5 py-0.5' : 'bottom-3 right-3 text-xs px-2 py-1'}`}>
                    {formatDuration(video.duration)}
                </span>
            </Link>

            {/* Details */}
            <div
                className={`flex flex-1 min-w-0 ${isHorizontal ? 'gap-0 px-0' : 'gap-4 px-1'
                    }`}
            >
                {!hideAvatar && !isHorizontal && (
                    <Link to={channelUrl} className="shrink-0">
                        <img src={video.ownerDetails?.avatar || 'https://via.placeholder.com/150'} className="h-11 w-11 rounded-full object-cover border border-zinc-800" alt="avatar" />
                    </Link>
                )}

                <div className="flex flex-col overflow-hidden flex-1 pr-2">
                    <Link to={`/watch/${video._id}`}>
                        <h3 className={`text-white font-bold leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors ${isHorizontal ? 'text-sm' : 'text-base'}`}>
                            {video.title}
                        </h3>
                    </Link>
                    <Link to={channelUrl} className={`text-zinc-400 hover:text-white transition-colors block w-fit ${isHorizontal ? 'text-xs mt-1' : 'text-sm mt-1.5'}`}>
                        {video.ownerDetails?.username || "Unknown Channel"}
                    </Link>
                    <p className={`text-zinc-500 ${isHorizontal ? 'text-[11px] mt-0.5' : 'text-sm'}`}>
                        {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Kebab Menu */}
                <div className="relative shrink-0 pt-1">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                        <LuEllipsisVertical size={20} />
                    </button>

                    {isMenuOpen && <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />}

                    {isMenuOpen && (
                        <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-xl shadow-black/50">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false); setIsPlaylistModalOpen(true); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                <LuListPlus size={18} /> Add to playlist
                            </button>
                            <button onClick={handleShare} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                <LuShare2 size={18} /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* SHARE LINK COPIED MODAL */}
            <AnimatePresence>
                {isShareModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-zinc-800 text-white text-sm sm:text-base font-medium px-6 py-4 rounded-2xl shadow-2xl border border-zinc-700 text-center"
                        >
                            Link copied
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Playlist Save Modal Instance */}
            {isPlaylistModalOpen && (
                <PlaylistSaveModal
                    isOpen={isPlaylistModalOpen}
                    onClose={() => { setIsPlaylistModalOpen(false); setModalMessage(""); }}
                    playlistItems={userPlaylists}
                    selectedPlaylistId={selectedPlaylistId}
                    onSelectPlaylist={setSelectedPlaylistId}
                    onSave={handleSaveToPlaylist}
                    saveLoading={saveLoading}
                    modalMessage={modalMessage}
                    userPlaylistsLoading={userPlaylistsLoading}
                    userPlaylistsError={userPlaylistsError}
                    playlistForm={formData}
                    onPlaylistFormChange={handleChange}
                    onCreatePlaylistSubmit={async (e) => { e.preventDefault(); await handleSubmit(e); }}
                    creatingPlaylist={creatingPlaylist}
                    addToPlaylistError={addToPlaylistError}
                    createPlaylistError={createPlaylistError}
                />
            )}
        </div>
    );
}