import React, { useEffect, useState } from 'react';
import { getPostDetails } from '../../../services/postService';
import { FaUtensils, FaRegCommentDots, FaRegHeart, FaRegBookmark, FaMapMarkerAlt, FaRegFileAlt, FaPaperPlane } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface PostDetailsModalProps {
  postId: string;
  onClose: () => void;
  currentUserId?: string;
}

const dummyComments = [
  { id: 1, user: { name: 'Alice', avatar: '/default-avatar.png' }, text: 'Looks delicious!' },
  { id: 2, user: { name: 'Bob', avatar: '/default-avatar.png' }, text: 'Where is this place?' },
];

const MODAL_WIDTH = 1000;
const MODAL_HEIGHT = 700;

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({ postId, onClose, currentUserId }) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuPanel, setShowMenuPanel] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPostDetails(postId).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

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
        <div className="relative w-full bg-black flex items-center justify-center" style={{ minHeight: 260, maxHeight: 340 }}>
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
            <div className="flex items-center gap-3">
              <img src={post.authorId?.profilePicture || '/default-avatar.png'} alt={post.authorId?.username} className="w-10 h-10 rounded-full object-cover" />
              <span className="font-semibold text-gray-800 text-lg">{post.authorId?.username}</span>
            </div>
            {(post.authorId?._id !== currentUserId && post.authorId !== currentUserId) && (
              <button className="px-4 py-1 rounded-full bg-orange-500 text-white font-semibold text-base hover:bg-orange-600">Follow</button>
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
                <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500">
                  <FaRegHeart /> {post.likesCount}
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500">
                  <FaRegBookmark /> {post.savesCount}
                </button>
                <span className="flex items-center gap-1 text-gray-500">
                  <FaRegCommentDots /> {post.commentsCount}
                </span>
              </div>
              {/* Comments */}
              <div className="flex-1 overflow-y-auto mb-3">
                <div className="font-semibold mb-2 text-base">Comments</div>
                {dummyComments.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 mb-2">
                    <img src={c.user.avatar} alt={c.user.name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-medium">{c.user.name}</span>
                    <span className="text-sm text-gray-600">{c.text}</span>
                  </div>
                ))}
              </div>
              {/* Comment input */}
              <div className="flex items-center gap-2 mt-2">
                <input className="flex-1 border rounded px-2 py-2 text-sm" placeholder="Write a comment..." />
                <button className="px-2 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 flex items-center justify-center">
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
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
                  {[1,2,3,4,5].map((n) => (
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
          <div className="relative flex-shrink-0 flex flex-col items-center justify-center bg-black" style={{ width: 480, height: '100%' }}>
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
              <div className="flex items-center gap-4">
                <img src={post.authorId?.profilePicture || '/default-avatar.png'} alt={post.authorId?.username} className="w-14 h-14 rounded-full object-cover" />
                <span className="font-semibold text-gray-800 text-xl">{post.authorId?.username}</span>
              </div>
              {(post.authorId?._id !== currentUserId && post.authorId !== currentUserId) && (
                <button className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold text-lg hover:bg-orange-600">Follow</button>
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
                  <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500">
                    <FaRegHeart /> {post.likesCount}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500">
                    <FaRegBookmark /> {post.savesCount}
                  </button>
                  <span className="flex items-center gap-2 text-gray-500">
                    <FaRegCommentDots /> {post.commentsCount}
                  </span>
                </div>
                {/* Comments */}
                <div className="flex-1 overflow-y-auto mb-4">
                  <div className="font-semibold mb-3 text-lg">Comments</div>
                  {dummyComments.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 mb-3">
                      <img src={c.user.avatar} alt={c.user.name} className="w-8 h-8 rounded-full" />
                      <span className="text-base font-medium">{c.user.name}</span>
                      <span className="text-base text-gray-600">{c.text}</span>
                    </div>
                  ))}
                </div>
                {/* Comment input */}
                <div className="flex items-center gap-3 mt-2">
                  <input className="flex-1 border rounded px-3 py-2 text-base" placeholder="Write a comment..." />
                  <button className="px-3 py-2 bg-orange-500 text-white rounded text-base hover:bg-orange-600 flex items-center justify-center">
                    <FaPaperPlane className="w-4 h-4" />
                  </button>
                </div>
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
                    {[1,2,3,4,5].map((n) => (
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