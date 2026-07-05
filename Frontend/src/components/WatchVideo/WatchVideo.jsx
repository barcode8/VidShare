import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LuThumbsUp, LuThumbsDown, LuShare2, LuPlus } from 'react-icons/lu';
import { useWatchVideo } from '../../hooks/Video/useWatchVideo.js';
import VideoCard from '../VideoCard/VideoCard.jsx';
import { useLikeVideos } from '../../hooks/Likes/useLikeVideo.js';
import CommentCard from '../CommentCard/CommentCard.jsx';
import { useGetAllComments } from '../../hooks/Comments/useGetAllComments.js';
import CommentSkeleton from '../Skeleton/CommentSkeleton.jsx';
import { useAddComment } from '../../hooks/Comments/useAddComment.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToggleSubscription } from '../../hooks/Subscription/useToggleSubscription.js';
import { useGetUserPlaylists } from '../../hooks/Playlist/useGetUserPlaylists.js';
import { useCreatePlaylist } from '../../hooks/Playlist/useCreatePlaylist.js';
import { useAddVideoToPlaylist } from '../../hooks/Playlist/useAddVideoToPlaylist.js';
import PlaylistSaveModal from '../PlaylistModal/PlaylistSaveModal.jsx';
import { useRecordView } from '../../hooks/Views/useRecordView.js';

export default function WatchVideo() {
    const { videoId } = useParams();
    const { user } = useAuth();
    const { video, setVideo, recommendedVideos, loading, error } = useWatchVideo(videoId);
    const { toggleVideoLike, isToggling, toggleError } = useLikeVideos();
    const { toggleSubscription, isToggling: isSubscribing, toggleError: subscriptionError } = useToggleSubscription();
    
    // Initialize the View Recording hook
    const { recordView } = useRecordView();
    // Create a mutable reference lock to ensure the API call only fires once per video view
    const hasLoggedView = useRef(false);

    const { 
        comments, 
        setComments, 
        loading: commentsLoading, 
        error: commentsError 
    } = useGetAllComments(videoId);

    const {
        content: newCommentContent,
        handleChange: handleCommentChange,
        handleSubmit: handleCommentSubmit,
        loading: isAddingComment,
        error: addCommentError
    } = useAddComment();

    const { getUserPlaylists, loading: userPlaylistsLoading, error: userPlaylistsError, userPlaylists } = useGetUserPlaylists();
    const { formData: playlistForm, handleChange: handlePlaylistChange, handleSubmit: handleCreatePlaylist, loading: creatingPlaylist, error: createPlaylistError, success: createPlaylistSuccess, createdPlaylist } = useCreatePlaylist();
    const { addVideoToPlaylist, loading: addingToPlaylist, error: addToPlaylistError, success: addToPlaylistSuccess } = useAddVideoToPlaylist();

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [modalMessage, setModalMessage] = useState('');

    // --- LOCAL STATE OVERRIDES FOR OPTIMISTIC UI (Subscriptions) ---
    const [localIsSubscribed, setLocalIsSubscribed] = useState(false);
    const [localSubCount, setLocalSubCount] = useState(0);

    // Extracting owner details safely
    const ownerData = video ? (
        Array.isArray(video.ownerDetails) ? video.ownerDetails[0] :
        video.ownerDetails ||
        (typeof video.owner === 'object' ? video.owner : null) ||
        {}
    ) : {};

    // Sync local state when the video API finishes loading
    useEffect(() => {
        if (ownerData) {
            setLocalIsSubscribed(ownerData.isSubscribed || false);
            setLocalSubCount(ownerData.subscribersCount || 0);
        }
    }, [video]); 

    // Reset the view lock if the URL changes (e.g., user clicks a recommended video)
    useEffect(() => {
        hasLoggedView.current = false;
    }, [videoId]);

    // Handlers
    const handleTimeUpdate = (e) => {
        // If the view has already been recorded for this video, do nothing
        if (hasLoggedView.current) return;

        const currentTime = e.target.currentTime;
        const VIEW_THRESHOLD = 10; // Trigger view count after 10 seconds of watch time
        

        if (currentTime >= VIEW_THRESHOLD && video?._id) {
            // Lock it so it doesn't fire continuously
            hasLoggedView.current = true;
            recordView(video._id);
        }
    };

    const handleLikeToggle = async (e) => {
        e.stopPropagation(); 
        if (!video?._id || isToggling) return;

        const resultData = await toggleVideoLike(video._id);
        
        if (resultData) {
            setVideo(prev => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }));
        }
    };

    const handleSubscribeToggle = async () => {
        if (!ownerData?._id) return; 

        const result = await toggleSubscription(ownerData._id);

        if (result) {
            setLocalIsSubscribed(result.isSubscribed);
            setLocalSubCount(prev => result.isSubscribed ? prev + 1 : prev - 1);
        }
    };

    const openPlaylistModal = () => {
        setModalMessage('');
        setIsPlaylistModalOpen(true);
    };

    const closePlaylistModal = () => {
        setIsPlaylistModalOpen(false);
        setSelectedPlaylistId(null);
        setModalMessage('');
    };

    const handlePlaylistSelect = (playlistId) => {
        setSelectedPlaylistId(playlistId);
        setModalMessage('');
    };

    const handleAddVideo = async () => {
        if (!video?._id) {
            setModalMessage('Video data is not available yet.');
            return;
        }

        if (!selectedPlaylistId) {
            setModalMessage('Please select a playlist first.');
            return;
        }

        setModalMessage('');
        const result = await addVideoToPlaylist(video._id, selectedPlaylistId);

        if (result) {
            setModalMessage('Video added to playlist successfully.');
        }
    };

    useEffect(() => {
        if (user?._id) {
            getUserPlaylists(user._id);
        }
    }, [user?._id]);

    useEffect(() => {
        if (createPlaylistSuccess && createdPlaylist) {
            setSelectedPlaylistId(createdPlaylist._id);
            setModalMessage(`Playlist "${createdPlaylist.name}" created. Select it to save the video.`);
            if (user?._id) {
                getUserPlaylists(user._id);
            }
        }
    }, [createPlaylistSuccess, createdPlaylist, user?._id]);

    useEffect(() => {
        if (addToPlaylistSuccess) {
            setModalMessage('Video added to playlist successfully.');
        }
    }, [addToPlaylistSuccess]);

    const avatarUrl = ownerData?.avatar || `https://ui-avatars.com/api/?name=${ownerData?.username || 'User'}&background=random`;
    const channelName = ownerData?.fullName || ownerData?.username || "Unknown Channel";
    const channelUsername = ownerData?.username || "unknown";

    return (
        <div className="bg-black min-h-screen pt-20 pb-15 px-4 sm:px-6 lg:px-10 xl:px-16 font-roboto">
            {loading ? (
                // SKELETON LOADER STATE 
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full max-w-[1700px] mx-auto justify-between animate-pulse">
                    <div className="flex-1 min-w-0 max-w-[1280px]">
                        <div className="w-full rounded-xl bg-zinc-900 aspect-video"></div>
                        <div className="h-8 bg-zinc-900 rounded w-3/4 mt-6"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 bg-zinc-900 rounded w-32"></div>
                                    <div className="h-3 bg-zinc-900 rounded w-24"></div>
                                </div>
                                <div className="w-24 h-10 md:h-11 rounded-full bg-zinc-900 ml-2"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-32 h-10 rounded-full bg-zinc-900"></div>
                                <div className="w-24 h-10 rounded-full bg-zinc-900"></div>
                            </div>
                        </div>
                        <div className="mt-6 bg-zinc-900 rounded-xl h-24 w-full"></div>
                    </div>
                    <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col gap-4 pb-12">
                        <div className="h-6 bg-zinc-900 rounded w-24 mb-2"></div>
                        <div className="flex flex-col gap-3">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-row gap-3">
                                    <div className="w-40 aspect-video rounded-xl bg-zinc-900 shrink-0"></div>
                                    <div className="flex flex-col gap-2 w-full mt-1">
                                        <div className="h-4 bg-zinc-900 rounded w-full"></div>
                                        <div className="h-4 bg-zinc-900 rounded w-2/3"></div>
                                        <div className="h-3 bg-zinc-900 rounded w-1/2 mt-2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : error || !video ? (
                // ERROR / NOT FOUND STATE
                <div className="flex flex-col items-center justify-center h-[50vh] text-white">
                    <p className="text-xl text-red-500 mb-4">{error || "Video not found"}</p>
                    <Link to="/" className="text-purple-400 hover:text-purple-300 underline">Return Home</Link>
                </div>
            ) : (
                // SUCCESS STATE: MAIN CONTENT 
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full max-w-[1700px] mx-auto justify-between">
                    
                    <div className="flex-1 min-w-0 max-w-[1280px]">
                        <div className="relative w-full rounded-xl overflow-hidden bg-zinc-900 aspect-video">
                            <video 
                                src={video.videoFile} 
                                poster={video.thumbnail} 
                                controls 
                                autoPlay 
                                onTimeUpdate={handleTimeUpdate} // <-- Added listener here
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <h1 className="text-xl md:text-2xl font-bold text-white mt-4 line-clamp-2">{video.title}</h1>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                            <div className="flex items-center gap-4">
                                <Link to={`/channel/${channelUsername}`}>
                                    <img src={avatarUrl} alt={channelUsername} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-zinc-800" />
                                </Link>
                                <div>
                                    <Link to={`/channel/${channelUsername}`}>
                                        <h3 className="text-white font-bold text-sm md:text-base hover:text-pink-500 transition-colors">{channelName}</h3>
                                    </Link>
                                    <p className="text-zinc-400 text-xs md:text-sm">{localSubCount} subscribers</p>
                                </div>
                                
                                <div className="flex flex-col">
                                    <button 
                                        onClick={handleSubscribeToggle}
                                        disabled={isSubscribing}
                                        className={`ml-2 w-32 py-2 rounded-full transition-all font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed group ${
                                            localIsSubscribed 
                                                ? "bg-zinc-800 text-white border border-zinc-700 hover:bg-red-600/90 hover:border-red-600 hover:text-white shadow-none" 
                                                : "bg-white hover:bg-zinc-200 text-black shadow-md"
                                        }`}
                                    >
                                        {isSubscribing ? (
                                            "Wait..."
                                        ) : localIsSubscribed ? (
                                            <>
                                                <span className="block group-hover:hidden">Subscribed</span>
                                                <span className="hidden group-hover:block">Unsubscribe</span>
                                            </>
                                        ) : (
                                            "Subscribe"
                                        )}
                                    </button>
                                    {subscriptionError && <span className="text-red-500 text-xs mt-1 ml-4">{subscriptionError}</span>}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                                    <div className="flex bg-zinc-900 rounded-full items-center text-sm font-medium">
                                        <button onClick={handleLikeToggle} disabled={isToggling} className={`flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-l-full transition-colors border-r border-zinc-700 ${video.isLiked ? 'text-pink-500' : 'text-white'} ${isToggling ? 'opacity-80' : ''}`}>
                                            <LuThumbsUp size={18} fill={video.isLiked ? "currentColor" : "none"} />
                                            {video.likesCount || 0}
                                        </button>
                                        <button className="flex items-center px-4 py-2 hover:bg-zinc-800 rounded-r-full transition-colors text-white">
                                            <LuThumbsDown size={18} />
                                        </button>
                                    </div>
                                    <button onClick={openPlaylistModal} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm whitespace-nowrap">
                                        <LuPlus size={18} /> Save
                                    </button>
                                    <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm whitespace-nowrap">
                                        <LuShare2 size={18} /> Share
                                    </button>
                                </div>
                                {toggleError && <span className="text-xs text-red-500 font-medium px-2">{toggleError}</span>}
                            </div>
                        </div>

                        <div onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className={`mt-6 bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-xl p-4 cursor-pointer text-sm ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                            <div className="font-bold text-white mb-2">
                                {video.views || 0} views • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}
                            </div>
                            <p className={`text-zinc-300 whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                                {video.description || "No description provided."}
                            </p>
                        </div>

                        {/* COMMENTS SECTION */}
                        <div className="mt-8 pt-6 border-t border-zinc-800">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {comments?.length || 0} Comments
                            </h2>
                            
                            <form 
                                onSubmit={(e) => handleCommentSubmit(e, videoId)} 
                                className="flex gap-4 mb-8 items-start"
                            >
                                <img 
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=random`} 
                                    alt={user?.username || "My Avatar"} 
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-800 shrink-0 mt-1"
                                />
                                <div className="flex flex-col w-full gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add a comment..." 
                                        value={newCommentContent}
                                        onChange={handleCommentChange}
                                        disabled={isAddingComment}
                                        className="w-full bg-transparent border-b border-zinc-700 focus:border-white outline-none py-2 text-white text-base transition-colors disabled:opacity-50"
                                    />
                                    
                                    {newCommentContent.trim().length > 0 && (
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button 
                                                type="submit" 
                                                disabled={isAddingComment}
                                                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400 disabled:shadow-none text-white font-bold py-1.5 px-5 rounded-full text-sm transition-all shadow-[0_0_10px_rgba(147,51,234,0.2)]"
                                            >
                                                {isAddingComment ? "Posting..." : "Comment"}
                                            </button>
                                        </div>
                                    )}
                                    
                                    {addCommentError && <p className="text-red-500 text-xs mt-1">{addCommentError}</p>}
                                </div>
                            </form>
                            
                            {/* Comments List Rendering */}
                            {commentsLoading ? (
                                <div className="flex flex-col gap-4">
                                    {[...Array(5)].map((_, index) => (
                                        <CommentSkeleton key={index} />
                                    ))}
                                </div>
                            ) : commentsError ? (
                                <div className="text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    {commentsError}
                                </div>
                            ) : comments?.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {comments.map(comment => (
                                        <CommentCard 
                                            key={comment._id} 
                                            comment={comment} 
                                            onCommentDeleted={(deletedId) => {
                                                setComments(prev => prev.filter(c => c._id !== deletedId));
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-zinc-400 text-sm italic bg-zinc-900/50 p-4 rounded-lg text-center">
                                    No comments yet. Be the first to share your thoughts!
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col gap-4 pb-12">
                        <h3 className="text-white font-bold text-lg mb-2">Up Next</h3>
                        <div className="flex flex-col gap-3">
                            {recommendedVideos?.map((recVideo) => (
                                <VideoCard key={recVideo._id} video={recVideo} hideAvatar={true} layout="horizontal" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <PlaylistSaveModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                playlistItems={userPlaylists}
                selectedPlaylistId={selectedPlaylistId}
                onSelectPlaylist={handlePlaylistSelect}
                onSave={handleAddVideo}
                saveLoading={addingToPlaylist}
                modalMessage={modalMessage}
                userPlaylistsLoading={userPlaylistsLoading}
                userPlaylistsError={userPlaylistsError}
                playlistForm={playlistForm}
                onPlaylistFormChange={handlePlaylistChange}
                onCreatePlaylistSubmit={handleCreatePlaylist}
                creatingPlaylist={creatingPlaylist}
                addToPlaylistError={addToPlaylistError}
                createPlaylistError={createPlaylistError}
            />
        </div>
    );
}