import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuEllipsisVertical, LuPencil, LuTrash2, LuThumbsUp } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDeleteComment } from '../../hooks/Comments/useDeleteComment.js';
import { useUpdateComment } from '../../hooks/Comments/useUpdateComment.js';
import { useLikeComment } from '../../hooks/Likes/useLikeComment.js';
import { useGetCommentReplies } from '../../hooks/Comments/useGetCommentReplies.js';
import { useAddCommentReply } from '../../hooks/Comments/useAddCommentReply.js';

// Helper Component for Lazy Loading Replies
const RepliesSection = ({ commentId, currentDepth, parentUsername }) => {
    const { replies, loading, error, hasMore, loadMore } = useGetCommentReplies(commentId);

    if (loading && replies.length === 0) {
        return <div className="text-zinc-400 text-xs mt-3 animate-pulse">Loading replies...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-xs mt-3">{error}</div>;
    }

    return (
        <div className="mt-2 flex flex-col">
            {replies.map(reply => (
                <CommentCard
                    key={reply._id}
                    comment={reply}
                    depth={currentDepth + 1}
                    replyingTo={parentUsername}
                />
            ))}

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-xs text-pink-500 hover:text-pink-400 font-medium mt-3 mb-2 w-max"
                >
                    {loading ? "Loading..." : "Load more replies"}
                </button>
            )}
        </div>
    );
};

// Main Comment Card Component
export default function CommentCard({ comment, onCommentDeleted, depth = 0, replyingTo = null }) {
    const { user } = useAuth();
    const isOwner = user?._id === comment?.owner;

    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Reply UI States
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    // Local state for optimistic UI updates
    const [localIsLiked, setLocalIsLiked] = useState(comment?.isLiked || false);
    const [localLikesCount, setLocalLikesCount] = useState(comment?.likesCount || 0);
    const [localRepliesCount, setLocalRepliesCount] = useState(comment?.repliesCount || 0);

    useEffect(() => {
        setLocalIsLiked(comment?.isLiked || false);
        setLocalLikesCount(comment?.likesCount || 0);
        setLocalRepliesCount(comment?.repliesCount || 0);
    }, [comment?.isLiked, comment?.likesCount, comment?.repliesCount]);

    // Hook Implementations
    const { deleteComment, loading: isDeleting } = useDeleteComment();
    const { toggleCommentLike, isToggling, toggleError } = useLikeComment();
    const {
        content: editContent,
        setContent: setEditContent,
        handleSubmit: handleUpdate,
        loading: isUpdating
    } = useUpdateComment(comment.content);

    const {
        content: replyContent,
        setContent: setReplyContent,
        handleSubmit: handleReplySubmit,
        loading: isSubmittingReply,
        error: replyError
    } = useAddCommentReply();

    // Fallbacks
    const avatarUrl = comment?.ownerDetails?.avatar || `https://ui-avatars.com/api/?name=${comment?.ownerDetails?.username || 'U'}&background=random`;
    const username = comment?.ownerDetails?.username || "unknown_user";

    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        const result = await deleteComment(comment._id);
        if (result && onCommentDeleted) {
            onCommentDeleted(comment._id);
        }
        setIsMenuOpen(false);
    };

    const submitEdit = async (e) => {
        const result = await handleUpdate(e, comment._id);
        if (result) {
            comment.content = editContent;
            setIsEditing(false);
        }
    };

    const handleLikeToggle = async () => {
        if (!comment?._id || isToggling) return;
        const resultData = await toggleCommentLike(comment._id);
        if (resultData) {
            setLocalIsLiked(prev => !prev);
            setLocalLikesCount(prev => localIsLiked ? prev - 1 : prev + 1);
        }
    };

    const submitReply = async (e) => {
        const result = await handleReplySubmit(e, comment._id);
        if (result) {
            setIsReplying(false);
            setShowReplies(true);
            setLocalRepliesCount(prev => prev + 1);
        }
    };

    return (
        // The outer wrapper handles the vertical spacing between comments based on depth
        <div className={depth === 0 ? "mb-6" : "mt-4"}>

            {/* The main flex row for Avatar + Content */}
            <div className="flex gap-3 md:gap-4 group relative">
                <Link to={`/channel/${username}`} className="shrink-0">
                    <img
                        src={avatarUrl}
                        alt={username}
                        className={`rounded-full object-cover bg-zinc-800 hover:opacity-80 transition-opacity ${depth > 0 ? 'w-7 h-7 md:w-8 md:h-8' : 'w-9 h-9 md:w-10 md:h-10'}`}
                    />
                </Link>

                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                            <Link to={`/channel/${username}`}>
                                <span className="text-white font-bold text-sm hover:text-pink-500 transition-colors">
                                    @{username}
                                </span>
                            </Link>
                            <span className="text-zinc-500 text-xs">
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                            </span>
                        </div>

                        {isOwner && !isEditing && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                >
                                    <LuEllipsisVertical size={16} />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-10">
                                        <button
                                            onClick={() => {
                                                setEditContent(comment.content);
                                                setIsEditing(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                        >
                                            <LuPencil size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LuTrash2 size={14} /> {isDeleting ? "..." : "Delete"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col gap-2 mt-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                disabled={isUpdating}
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-pink-500 outline-none rounded-lg p-2 text-white text-sm transition-colors disabled:opacity-50 resize-none min-h-[60px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    disabled={isUpdating}
                                    className="text-zinc-400 hover:text-white text-sm px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitEdit}
                                    disabled={isUpdating || editContent.trim() === ""}
                                    className="bg-gradient-to-r from-purple-600 to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400 text-white font-bold text-sm px-4 py-1.5 rounded-full transition-all"
                                >
                                    {isUpdating ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
                                {/* Tag the user being replied to if depth is 2+ (Flattened threading) */}
                                {depth > 1 && replyingTo && (
                                    <Link to={`/channel/${replyingTo}`} className="text-pink-500 hover:text-pink-400 font-medium mr-1.5">
                                        @{replyingTo}
                                    </Link>
                                )}
                                {comment.content}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={handleLikeToggle}
                                    disabled={isToggling}
                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${localIsLiked ? 'text-pink-500' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <LuThumbsUp size={14} fill={localIsLiked ? "currentColor" : "none"} />
                                    {localLikesCount > 0 ? localLikesCount : "Like"}
                                </button>

                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                                >
                                    Reply
                                </button>

                                {localRepliesCount > 0 && (
                                    <button
                                        onClick={() => setShowReplies(!showReplies)}
                                        className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-1.5 w-max rounded-full px-3 py-1 hover:bg-purple-500/10"
                                    >
                                        {showReplies ? "Hide" : `View ${localRepliesCount} replies`}
                                    </button>
                                )}
                            </div>

                            {isReplying && (
                                <div className="flex gap-3 items-start mt-3">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=U&background=random`}
                                        alt="My Avatar"
                                        className="w-6 h-6 rounded-full object-cover bg-zinc-800 shrink-0 mt-1"
                                    />
                                    <div className="w-full flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder={`Reply to @${username}...`}
                                            disabled={isSubmittingReply}
                                            className="w-full bg-transparent border-b border-zinc-700 focus:border-pink-500 outline-none py-1 text-white text-sm transition-colors disabled:opacity-50"
                                        />
                                        <div className="flex justify-end gap-2 mt-1">
                                            <button onClick={() => setIsReplying(false)} className="text-xs text-zinc-400 px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">Cancel</button>
                                            <button onClick={submitReply} disabled={isSubmittingReply || replyContent.trim() === ""} className="bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-1.5 rounded-full">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 
               RepliesSection is placed OUTSIDE the flex row.
               If depth is 0, we apply the left margin and border to create the thread line.
               If depth > 0, we apply zero extra margin, keeping the replies perfectly aligned (flattened). 
            */}
            {showReplies && (
                <div className={depth === 0 ? "ml-4 md:ml-12 border-l-2 border-zinc-800 pl-3 md:pl-4 mt-2" : "ml-0"}>
                    <RepliesSection
                        commentId={comment._id}
                        currentDepth={depth}
                        parentUsername={username}
                    />
                </div>
            )}
        </div>
    );
}