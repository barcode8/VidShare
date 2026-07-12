import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuListPlus, LuEllipsisVertical, LuShare2 } from 'react-icons/lu';
import { formatDuration } from '../../utils/formatTime.js';
import PlaylistSaveModal from '../PlaylistModal/PlaylistSaveModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';
import { useCreatePlaylist } from '../../hooks/Playlist/useCreatePlaylist.js';
import { useAddVideoToPlaylist } from '../../hooks/Playlist/useAddVideoToPlaylist.js';

export default function SearchVideoCard({ video }) {
    // Pre-compute the URL to handle potentially missing data gracefully
    const channelUrl = `/channel/${video.ownerDetails?.username || ""}`;

    // --- State for Menu and Modal ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [modalMessage, setModalMessage] = useState("");

    // --- Share Modal State ---
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // --- Hooks ---
    const { user } = useAuth();
    const { getUserPlaylists, loading: userPlaylistsLoading, error: userPlaylistsError, userPlaylists } = useGetUserPlaylists();
    const { formData, handleChange, handleSubmit, loading: creatingPlaylist, error: createPlaylistError, success: createSuccess } = useCreatePlaylist();
    const { addVideoToPlaylist, loading: saveLoading, error: addToPlaylistError } = useAddVideoToPlaylist();

    // Fetch playlists when the modal is opened
    useEffect(() => {
        if (isModalOpen && user?._id) {
            getUserPlaylists(user._id);
        }
    }, [isModalOpen, user?._id]);

    // Refresh playlists if a new one is successfully created from within the modal
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
                setIsModalOpen(false);
                setModalMessage("");
                setSelectedPlaylistId(null);
            }, 1500);
        }
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsModalOpen(true);
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
        <div className="group flex flex-col md:flex-row gap-4 md:gap-6 cursor-pointer mb-6">
            
            {/* Scaled way up for desktop (up to 500px wide) */}
            <Link 
                to={`/watch/${video._id}`} 
                className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 block shrink-0 w-full sm:w-[400px] md:w-[450px] lg:w-[500px]"
            >
                <img 
                    src={video.thumbnail} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={video.title} 
                />
                <span className="absolute bg-black/90 text-white font-bold rounded-md bottom-2 right-2 text-xs px-2 py-1">
                    {formatDuration(video.duration)}
                </span>
            </Link>
            
            {/* Scaled up font sizes to match the bigger thumbnail */}
            <div className="flex flex-col mt-2 md:mt-0 pt-1 w-full max-w-2xl relative">
                
                {/* Title & Menu Flex Wrapper */}
                <div className="flex justify-between items-start gap-4">
                    <Link to={`/watch/${video._id}`} className="flex-1 pr-2">
                        <h3 className="text-white font-medium text-lg md:text-xl leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors">
                            {video.title}
                        </h3>
                    </Link>

                    {/* Kebab Menu */}
                    <div className="relative shrink-0 pt-1">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <LuEllipsisVertical size={20} />
                        </button>

                        {/* Invisible overlay to close menu when clicking outside */}
                        {isMenuOpen && (
                            <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }}
                            />
                        )}

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-xl shadow-black/50">
                                <button
                                    onClick={handleOpenModal}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                >
                                    <LuListPlus size={18} />
                                    Add to playlist
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                >
                                    <LuShare2 size={18} />
                                    Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <p className="text-zinc-400 text-xs md:text-sm mt-1">
                    {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                </p>
                
                {/* Channel Info inline with larger avatar */}
                <div className="flex items-center gap-3 mt-4 w-fit">
                    {/* Avatar Link */}
                    <Link to={channelUrl} className="shrink-0">
                        <img 
                            src={video.ownerDetails?.avatar || 'https://via.placeholder.com/150'} 
                            className="h-8 w-8 rounded-full object-cover" 
                            alt="avatar"
                        />
                    </Link>
                    
                    {/* Username Link */}
                    <Link 
                        to={channelUrl} 
                        className="text-zinc-400 hover:text-white transition-colors text-sm"
                    >
                        {video.ownerDetails?.username || "Unknown Channel"}
                    </Link>
                </div>

                {/* Description Snippet */}
                <p className="text-zinc-500 text-xs md:text-sm mt-4 line-clamp-1 md:line-clamp-2 hidden sm:block">
                    {video.description || "No description available for this video."}
                </p>
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
            {isModalOpen && (
                <PlaylistSaveModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalMessage("");
                    }}
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
                    onCreatePlaylistSubmit={async (e) => {
                        e.preventDefault();
                        await handleSubmit(e);
                    }}
                    creatingPlaylist={creatingPlaylist}
                    addToPlaylistError={addToPlaylistError}
                    createPlaylistError={createPlaylistError}
                />
            )}
        </div>
    );
}