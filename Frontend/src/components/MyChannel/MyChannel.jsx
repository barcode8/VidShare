import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LuPencil, LuTrash2, LuEyeOff, LuEye, LuX } from 'react-icons/lu';
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import { formatDuration } from '../../utils/formatTime.js';
import Sidebar from '../Sidebar/Sidebar.jsx';
import { useTogglePublish } from '../../hooks/Video/useTogglePublish.js';
import { useDeleteVideo } from '../../hooks/Video/useDeleteVideo.js';
import { useDashboard } from '../../hooks/Dashboard/useDashboard.js';

// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// Reusable Custom Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmStyle, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-purple-950/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">{title}</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                            >
                                <LuX size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
                        
                        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${confirmStyle}`}
                            >
                                {isLoading ? 'Processing...' : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function MyChannel() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { togglePublish, isToggling } = useTogglePublish();
    const { deleteVideo, loading: isDeleting, error: deleteError } = useDeleteVideo();

    // Modal States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, videoId: null });
    const [visibilityModal, setVisibilityModal] = useState({ isOpen: false, video: null });

    useEffect(() => {
        const fetchMyVideos = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/v1/videos?userId=${user?._id}`,
                    { withCredentials: true }
                );
                if (response.data?.success) {
                    setVideos(response.data.data.docs || []);
                }
            } catch (error) {
                console.error("Error fetching channel videos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyVideos();
        }
    }, [user]);

    // Visibility Handlers
    const openVisibilityModal = (video) => {
        setVisibilityModal({ isOpen: true, video });
    };

    const confirmToggleVisibility = async () => {
        const video = visibilityModal.video;
        if (!video) return;

        const newStatus = await togglePublish(video._id);
        if (newStatus !== null) {
            setVideos(videos.map(v => v._id === video._id ? { ...v, isPublished: newStatus } : v));
        }
        setVisibilityModal({ isOpen: false, video: null });
    };

    // Delete Handlers
    const openDeleteModal = (videoId) => {
        setDeleteModal({ isOpen: true, videoId });
    };

    const confirmDelete = async () => {
        const videoId = deleteModal.videoId;
        if (!videoId) return;

        const data = await deleteVideo(videoId);
        if (data) {
            setVideos(videos.filter(v => v._id !== videoId));
        }
        setDeleteModal({ isOpen: false, videoId: null });
    };

    if (!user) return null;

    return (
        <div className="flex bg-black min-h-screen pt-20 font-roboto">
            <Sidebar />

            <motion.main 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto h-[calc(100vh-64px)] text-white relative"
            >
                {/* Banner Section */}
                <motion.div variants={fadeUp} className="w-full h-40 md:h-56 lg:h-72 bg-zinc-900 relative">
                    {user?.coverImage ? (
                        <img
                            src={user.coverImage}
                            alt="Channel Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-900/30 to-pink-900/30" />
                    )}
                </motion.div>

                {/* Profile Info Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-10">
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/150'}
                            alt="Channel Avatar"
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black object-cover bg-zinc-900"
                        />
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">{user?.fullName || user?.username}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-[#a1a1aa] text-sm font-medium">
                                <span>@{user?.username}</span>
                                <span>•</span>
                                <span>{videos.length} Videos</span>
                            </div>
                        </div>
                        <div className="md:pb-0">
                            <Link to="/change-details">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-zinc-800 text-white font-medium px-6 py-2 rounded-full hover:bg-zinc-700 transition-colors"
                                >
                                    Customize Channel
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    <hr className="border-[#18181b] mb-10" />

                    {/* Display Delete Error if it occurs */}
                    {deleteError && (
                        <motion.div variants={fadeUp} className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
                            {deleteError}
                        </motion.div>
                    )}

                    {/* Videos Section */}
                    <div className="pb-12">
                        <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white">Manage Videos</h2>
                            <Link to="/upload">
                                <button className="text-sm bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-pink-500 hover:text-pink-400 font-medium transition-colors">
                                    + Upload New Video
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => <VideoSkeleton key={i} />)
                            ) : videos.length > 0 ? (
                                videos.map((video) => (
                                    <motion.div
                                        key={video._id}
                                        variants={fadeUp}
                                        className="group bg-[#09090b] rounded-xl overflow-hidden border border-[#18181b] hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)] transition-all duration-300"
                                    >
                                        <div className="relative aspect-video">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10">
                                                <Link to={`/edit-video/${video._id}`} state={{ video }}>
                                                    <button className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full text-white transition-transform hover:scale-110">
                                                        <LuPencil size={20} />
                                                    </button>
                                                </Link>
                                                <button 
                                                    onClick={() => openVisibilityModal(video)}
                                                    className="p-3 bg-zinc-600 hover:bg-zinc-500 rounded-full text-white transition-transform hover:scale-110"
                                                >
                                                    {video.isPublished ? <LuEye size={20} /> : <LuEyeOff size={20} />}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => openDeleteModal(video._id)}
                                                    className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-transform hover:scale-110"
                                                >
                                                    <LuTrash2 size={20} />
                                                </button>
                                            </div>

                                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                                                {formatDuration(video.duration)}
                                            </span>
                                            {!video.isPublished && (
                                                <span className="absolute top-2 left-2 bg-[#27272a]/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-[#3f3f46]">
                                                    <LuEyeOff size={12} /> Draft
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white font-semibold line-clamp-2 text-sm mb-2 group-hover:text-purple-400 transition-colors">
                                                {video.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                                                <span>{video.views || 0} views</span>
                                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div variants={fadeUp} className="col-span-full flex flex-col items-center justify-center py-20 bg-[#09090b] rounded-2xl border border-zinc-800 border-dashed">
                                    <h3 className="text-xl font-bold text-white mb-2">No videos uploaded</h3>
                                    <p className="text-[#a1a1aa] mb-6 text-sm">Upload a video to start filling up your channel</p>
                                    <Link to="/upload">
                                        <button className="bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-2.5 rounded-full text-white font-bold hover:scale-105 transition-transform">
                                            Upload Video
                                        </button>
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.main>

            {/* Modals */}
            <ConfirmationModal
                isOpen={visibilityModal.isOpen}
                onClose={() => setVisibilityModal({ isOpen: false, video: null })}
                onConfirm={confirmToggleVisibility}
                isLoading={isToggling}
                title="Change Visibility"
                message={`Your video is currently ${visibilityModal.video?.isPublished ? 'Public' : 'Hidden'}. Would you like to make it ${visibilityModal.video?.isPublished ? 'Hidden' : 'Public'}?`}
                confirmText={visibilityModal.video?.isPublished ? "Make Hidden" : "Make Public"}
                confirmStyle="bg-zinc-600 hover:bg-zinc-500"
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, videoId: null })}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Video"
                message="Are you absolutely sure you want to delete this video? This action is permanent and cannot be undone."
                confirmText="Yes, Delete Video"
                confirmStyle="bg-red-600 hover:bg-red-500"
            />
        </div>
    );
}