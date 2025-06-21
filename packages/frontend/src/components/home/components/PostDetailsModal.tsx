import React, { useEffect, useState } from 'react';
import { getPostDetails, likePost, unlikePost, hasLikedPost, savePost, unsavePost, hasSavedPost, getComments, addComment } from '../../../services/postService';
import { FaUtensils, FaRegCommentDots, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark, FaMapMarkerAlt, FaRegFileAlt, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '../../../services/userService';

interface Post {
  id: string;
  title: string;
  description: string;
  postPictureUrl: string;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  authorId: {
    _id?: string;
    username: string;
    profilePicture?: string;
  };
  dietaryTags?: string[];
  menuItemName: string;
  menuItemPrice: number;
  foodRating: number;
  restaurantName: string;
  foodCategory: string;
  cusineType: string;
  restaurantLocation?: {
    coordinates: [number, number];
  };
}

interface Comment {
  id: string;
  userId: {
    username: string;
    profilePicture?: string;
  };
  text: string;
  createdAt: string;
}

interface PostDetailsModalProps {
  postId: string;
  onClose: () => void;
  currentUserId?: string;
  onLikeUpdate?: (postId: string, likesCount: number, liked: boolean) => void;
}

const MODAL_WIDTH = 1000;
const MODAL_HEIGHT = 700;

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({ postId, onClose, currentUserId, onLikeUpdate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPostDetails(postId),
      hasLikedPost(postId),
      hasSavedPost(postId)
    ]).then(([postData, hasLiked, hasSaved]) => {
      setPost(postData);
      setIsLiked(hasLiked);
      setIsSaved(hasSaved);
      setLoading(false);
    });
  }, [postId]);

  // Check if current user is following the post author
  useEffect(() => {
    const checkFollow = async () => {
      if (post && post.authorId && post.authorId._id && post.authorId._id !== currentUserId) {
        setFollowLoading(true);
        try {
          const following = await checkIsFollowing(post.authorId._id);
          setIsFollowing(following);
        } catch {
          setIsFollowing(false);
        } finally {
          setFollowLoading(false);
        }
      }
    };
    checkFollow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, currentUserId]);

  // Fetch comments
  useEffect(() => {
    setCommentsLoading(true);
    getComments(postId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [postId]);

  const handleLike = async () => {
    if (!currentUserId || isLiking || !post) return;

    setIsLiking(true);
    try {
      let newLikesCount = post.likesCount;
      let liked = isLiked;
      if (isLiked) {
        await unlikePost(postId);
        newLikesCount = post.likesCount - 1;
        liked = false;
        setPost(prev => prev ? { ...prev, likesCount: newLikesCount } : null);
      } else {
        await likePost(postId);
        newLikesCount = post.likesCount + 1;
        liked = true;
        setPost(prev => prev ? { ...prev, likesCount: newLikesCount } : null);
      }
      setIsLiked(liked);
      // Notify parent (Feed) to update the feed state
      if (onLikeUpdate) onLikeUpdate(postId, newLikesCount, liked);
    } catch (error) {
      console.error('Failed to update like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!currentUserId || isSaving || !post) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsavePost(postId);
        setIsSaved(false);
      } else {
        await savePost(postId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to update save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollow = async () => {
    if (!post || !post.authorId || !post.authorId._id) return;
    setFollowLoading(true);
    try {
      await followUser(post.authorId._id);
      setIsFollowing(true);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!post || !post.authorId || !post.authorId._id) return;
    setFollowLoading(true);
    try {
      await unfollowUser(post.authorId._id);
      setIsFollowing(false);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() || commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const newComment = await addComment(postId, commentInput.trim());
      setComments((prev) => [...prev, {
        ...newComment,
        userId: newComment.userId || { username: 'You', profilePicture: '/default-avatar.png' },
      }]);
      setCommentInput('');
      // Optionally update post.commentsCount
      setPost((prev) => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    } catch (err) {
      setCommentError('Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-2xl p-10 animate-scaleIn">Loading…</div>
      </div>
    );
  }

  // Google Maps link
  const mapsUrl = post.restaurantLocation
    ? `https://www.google.com/maps?q=${post.restaurantLocation.coordinates[1]},${post.restaurantLocation.coordinates[0]}`
    : '#';

  // Update the author comparison
  const isAuthor = post?.authorId?._id === currentUserId;

  // Mobile comment modal component
  const mobileCommentModal = (
    <AnimatePresence>
      {showCommentModal && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] w-full"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-lg">Comments</span>
              <button onClick={() => setShowCommentModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">
                <FaTimes />
              </button>
            </div>
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {commentsLoading ? (
                <div className="text-gray-500">Loading comments…</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-400">No comments yet.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 mb-3">
                    <img src={c.userId?.profilePicture || '/default-avatar.png'} alt={c.userId?.username || 'User'} className="w-7 h-7 rounded-full" />
                    <span className="text-sm font-medium">{c.userId?.username || 'User'}</span>
                    <span className="text-sm text-gray-600">{c.text}</span>
                  </div>
                ))
              )}
            </div>
            {/* Comment input */}
            <form className="flex items-center gap-2 px-4 py-3 border-t" onSubmit={handleCommentSubmit}>
              <input
                className="flex-1 border rounded px-2 py-2 text-sm"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                disabled={commentSubmitting}
                maxLength={1000}
              />
              <button
                type="submit"
                className="px-2 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center justify-center disabled:opacity-60"
                disabled={!commentInput.trim() || commentSubmitting}
                title="Send"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </form>
            {commentError && <div className="text-red-500 text-xs px-4 pb-2">{commentError}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Mobile layout
  const mobileContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold z-10">&times;</button>
        {/* Image at top */}
        <div className="relative w-full bg-white flex items-center justify-center" style={{ minHeight: 260, maxHeight: 340 }}>
          <img src={post.postPictureUrl} alt={post.title} className="max-h-[320px] w-full object-contain" />
          {/* Toggle Button */}
          <button
            className="absolute bottom-4 left-4 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-orange-100 transition text-base"
            onClick={() => setShowMenuPanel((v) => !v)}
            title={showMenuPanel ? 'Show Post Details' : 'Show Menu/Restaurant Info'}
          >
            {showMenuPanel ? <FaRegFileAlt className="text-orange-500 w-5 h-5" /> : <FaUtensils className="text-orange-500 w-5 h-5" />}
          </button>
        </div>
        {/* Details below image */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto text-base">
          {/* User Info & Follow */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer group/profile hover:text-orange-500" onClick={() => navigate(`/profile/${post.authorId?.username}`)}>
              <img src={post.authorId?.profilePicture || '/default-avatar.png'} alt={post.authorId?.username} className="w-10 h-10 rounded-full object-cover ring-0 group-hover/profile:ring-2 group-hover/profile:ring-orange-400 transition" />
              <span className="font-semibold text-gray-800 text-lg group-hover/profile:underline group-hover/profile:text-orange-500 transition">{post.authorId?.username}</span>
            </div>
            {!isAuthor && (
              isFollowing ? (
                <button
                  className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-300 transition h-9 text-sm"
                  onClick={handleUnfollow}
                  disabled={followLoading}
                >
                  {followLoading ? 'Unfollowing...' : 'Unfollow'}
                </button>
              ) : (
                <button
                  className="px-4 py-1 rounded-full bg-orange-500 text-white font-semibold text-base hover:bg-orange-600 transition h-9 text-sm"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? 'Following...' : 'Follow'}
                </button>
              )
            )}
          </div>
          {/* Panel Content */}
          {!showMenuPanel ? (
            <>
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-700 mb-2 text-base">{post.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.dietaryTags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{tag}</span>
                ))}
              </div>
              {/* Like/Save/Comment counts */}
              <div className="flex items-center gap-4 mb-4 text-lg">
                <motion.button
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500"
                  onClick={handleLike}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    color: isLiked ? '#ef4444' : '#6b7280',
                    scale: isLiked ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{post.likesCount}</span>
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 focus:outline-none"
                  onClick={handleSave}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    color: isSaved ? '#2563eb' : '#9ca3af',
                    scale: isSaved ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                </motion.button>
                {/* Comment icon button opens modal */}
                <motion.button
                  className="flex items-center gap-1 text-gray-500 hover:text-orange-500 focus:outline-none"
                  onClick={() => setShowCommentModal(true)}
                  whileTap={{ scale: 0.9 }}
                  title="Show comments"
                >
                  <FaRegCommentDots /> {post.commentsCount}
                </motion.button>
              </div>
              {/* Comments are now hidden by default on mobile */}
            </>
          ) : (
            <>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Menu Name</div>
                <div className="text-lg">{post.menuItemName}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Price</div>
                <div className="text-lg">RM {post.menuItemPrice}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Food Rating</div>
                <div className="flex gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={n <= post.foodRating ? 'text-orange-500' : 'text-gray-300'}>★</span>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Restaurant Name</div>
                <div className="text-lg">{post.restaurantName}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Food Category</div>
                <div className="text-lg">{post.foodCategory}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Cuisine Type</div>
                <div className="text-lg">{post.cusineType}</div>
              </div>
              <div className="mb-2">
                <div className="font-semibold text-gray-800 text-base">Restaurant Location</div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-500 hover:underline text-base"
                >
                  <FaMapMarkerAlt /> View on Google Maps
                </a>
              </div>
            </>
          )}
        </div>
        {/* Comment modal for mobile */}
        {mobileCommentModal}
      </motion.div>
    </AnimatePresence>
  );

  // Desktop layout
  const desktopContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl flex relative overflow-hidden"
          style={{ width: MODAL_WIDTH, height: MODAL_HEIGHT, maxWidth: '98vw', maxHeight: '95vh' }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } }}
          exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.15 } }}
        >
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold z-10">&times;</button>
          {/* Left: Post Image */}
          <div className="relative flex-shrink-0 flex flex-col items-center justify-center bg-white" style={{ width: 480, height: '100%' }}>
            <img src={post.postPictureUrl} alt={post.title} className="max-h-[90%] max-w-[90%] object-contain rounded-l-xl" />
            {/* Toggle Button */}
            <button
              className="absolute bottom-6 left-6 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-orange-100 transition text-lg"
              onClick={() => setShowMenuPanel((v) => !v)}
              title={showMenuPanel ? 'Show Post Details' : 'Show Menu/Restaurant Info'}
            >
              {showMenuPanel ? <FaRegFileAlt className="text-orange-500 w-5 h-5" /> : <FaUtensils className="text-orange-500 w-5 h-5" />}
            </button>
          </div>
          {/* Right: Details */}
          <div className="flex-1 flex flex-col p-10 relative min-w-[380px] max-w-[600px] h-full overflow-y-auto text-lg">
            {/* User Info & Follow */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 cursor-pointer group/profile hover:text-orange-500" onClick={() => navigate(`/profile/${post.authorId?.username}`)}>
                <img src={post.authorId?.profilePicture || '/default-avatar.png'} alt={post.authorId?.username} className="w-14 h-14 rounded-full object-cover ring-0 group-hover/profile:ring-2 group-hover/profile:ring-orange-400 transition" />
                <span className="font-semibold text-gray-800 text-xl group-hover/profile:underline group-hover/profile:text-orange-500 transition">{post.authorId?.username}</span>
              </div>
              {!isAuthor && (
                isFollowing ? (
                  <button
                    className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold text-lg hover:bg-gray-300 transition h-9 text-sm"
                    onClick={handleUnfollow}
                    disabled={followLoading}
                  >
                    {followLoading ? 'Unfollowing...' : 'Unfollow'}
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold text-lg hover:bg-orange-600 transition h-9 text-sm"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? 'Following...' : 'Follow'}
                  </button>
                )
              )}
            </div>
            {/* Panel Content */}
            {!showMenuPanel ? (
              <>
                <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                <p className="text-gray-700 mb-4 text-lg">{post.description}</p>
                <div className="flex flex-wrap gap-3 mb-5">
                  {post.dietaryTags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-base font-medium">{tag}</span>
                  ))}
                </div>
                {/* Like/Save/Comment counts */}
                <div className="flex items-center gap-6 mb-6 text-xl">
                  <motion.button
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500"
                    onClick={handleLike}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      color: isLiked ? '#ef4444' : '#6b7280',
                      scale: isLiked ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{post.likesCount}</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-2 focus:outline-none"
                    onClick={handleSave}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      color: isSaved ? '#2563eb' : '#9ca3af',
                      scale: isSaved ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                  </motion.button>
                  <span className="flex items-center gap-2 text-gray-500">
                    <FaRegCommentDots /> {post.commentsCount}
                  </span>
                </div>
                {/* Comments */}
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="font-semibold mb-3 text-lg">Comments</div>
                  {commentsLoading ? (
                    <div className="text-gray-500">Loading comments…</div>
                  ) : comments.length === 0 ? (
                    <div className="text-gray-400">No comments yet.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 mb-3">
                        <img src={c.userId?.profilePicture || '/default-avatar.png'} alt={c.userId?.username || 'User'} className="w-8 h-8 rounded-full" />
                        <span className="text-base font-medium">{c.userId?.username || 'User'}</span>
                        <span className="text-base text-gray-600">{c.text}</span>
                      </div>
                    ))
                  )}
                </div>
                {/* Comment input */}
                <form className="flex items-center gap-3 mt-2" onSubmit={handleCommentSubmit}>
                  <input
                    className="flex-1 border rounded px-3 py-2 text-base"
                    placeholder="Write a comment..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    disabled={commentSubmitting}
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-orange-500 text-white rounded text-base hover:bg-orange-600 flex items-center justify-center disabled:opacity-60"
                    disabled={!commentInput.trim() || commentSubmitting}
                    title="Send"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                  </button>
                </form>
                {commentError && <div className="text-red-500 text-xs mt-1">{commentError}</div>}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Menu Name</div>
                  <div className="text-xl">{post.menuItemName}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Price</div>
                  <div className="text-xl">RM {post.menuItemPrice}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Food Rating</div>
                  <div className="flex gap-1 text-2xl">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= post.foodRating ? 'text-orange-500' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Restaurant Name</div>
                  <div className="text-xl">{post.restaurantName}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Food Category</div>
                  <div className="text-xl">{post.foodCategory}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Cuisine Type</div>
                  <div className="text-xl">{post.cusineType}</div>
                </div>
                <div className="mb-4">
                  <div className="font-semibold text-gray-800 text-lg">Restaurant Location</div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-orange-500 hover:underline text-lg"
                  >
                    <FaMapMarkerAlt /> View on Google Maps
                  </a>
                </div>
              </>
            )}
          </div>
        </motion.div>
        <style>{`
          .animate-fadeIn { animation: fadeIn 0.2s; }
          .animate-scaleIn { animation: scaleIn 0.2s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile: full screen overlay, image on top, details below */}
      <div className="block md:hidden">{mobileContent}</div>
      {/* Desktop: modal */}
      <div className="hidden md:block">{desktopContent}</div>
    </>
  );
};

export default PostDetailsModal;