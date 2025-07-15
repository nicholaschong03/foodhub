import { useEffect, useState } from 'react';
import { getUserProfile, getFollowers, getFollowing } from '../../services/userService';
import { getMyPosts, likePost, unlikePost, getLikedPosts, getSavedPosts } from '../../services/postService';
// import CustomPlanScreen from '../auth/CustomPlanScreen';
import EditProfileModal from './EditProfileModal';
import PostCard from '../home/components/PostCard';
// import logoOrange from '../../assets/logo_orange.png';
import DefaultProfileIcon from '../common/DefaultProfileIcon';
import axiosInstance from '../../services/axios.config';
import { AnimatePresence, motion } from 'framer-motion';
import PostDetailsModal from '../home/components/PostDetailsModal';
// import { FaTrash } from 'react-icons/fa';
import Header from '../common/Header';
import { useNavigate } from 'react-router-dom';
import React, { useRef } from 'react';

const logoOrange = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516307/logo_orange_rf4tri.png';

const TABS = ['Posts', 'Saved', 'Liked', 'Health'];

function BMIScale({ bmi }: { bmi: number }) {
  const minBMI = 12, maxBMI = 40;
  const percent = Math.min(100, Math.max(0, ((bmi - minBMI) / (maxBMI - minBMI)) * 100));
  return (
    <div className="w-full mt-4 mb-2">
      <div className="relative h-4 rounded-full bg-gradient-to-r from-yellow-400 via-green-400 via-60% to-red-400">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow"
          style={{ left: `calc(${percent}% - 12px)`, background: '#FF6A00' }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-500">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <div className="text-center mt-2 font-bold text-lg" style={{ color: '#FF6A00' }}>
        Your BMI: {bmi}
      </div>
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm">
      <div className={`text-2xl mb-1 ${color}`}>
        {label === 'Calories' ? '🔥' : label === 'Carbs' ? '🌾' : label === 'Protein' ? '🍗' : '🥑'}
      </div>
      <div className="text-gray-700 text-sm">{label}</div>
      <div className="font-bold text-xl text-gray-900">
        {value}
        <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

const macroColors = {
  Calories: 'text-orange-500',
  Carbs: 'text-orange-400',
  Protein: 'text-red-400',
  Fats: 'text-blue-400',
};

// Helper to calculate age from dob
function calculateAge(dob: string | Date | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function UserProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('Posts');
  const [showEdit, setShowEdit] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [customPlan, setCustomPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showListModal, setShowListModal] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const navigate = useNavigate();
  const [listPage, setListPage] = useState(1);
  const [listHasMore, setListHasMore] = useState(true);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserId(user.id || user._id || null);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getUserProfile(userId).then(setUser);
      // Fetch follower/following counts
      getFollowers(userId).then(res => setFollowersCount(res.total || 0));
      getFollowing(userId).then(res => setFollowingCount(res.total || 0));
    }
  }, [userId, refresh]);

  useEffect(() => {
    if (userId) {
      setLoadingPosts(true);
      setPage(1);
      setHasMore(true);
      loadPosts();
    }
  }, [tab, refresh, userId]);

  useEffect(() => {
    if (tab === 'Health' && userId) {
      setLoadingPlan(true);
      axiosInstance.get(`/users/${userId}/custom-plan`).then(res => {
        setCustomPlan(res.data.data);
        setLoadingPlan(false);
      }).catch(() => setLoadingPlan(false));
    }
  }, [tab, userId]);

  // Fetch list when modal is opened or page changes
  useEffect(() => {
    if (!showListModal || !userId) return;
    setListLoading(true);
    const fetchList = showListModal === 'followers' ? getFollowers : getFollowing;
    fetchList(userId, listPage, 10).then(res => {
      const newUsers = (showListModal === 'followers'
        ? (res.followers || []).map((item: any) => item.follower)
        : (res.following || []).map((item: any) => item.following)
      );
      setListUsers(prev => listPage === 1 ? newUsers : [...prev, ...newUsers]);
      setListHasMore((res.totalPages && listPage < res.totalPages) || (newUsers.length === 10));
      setListLoading(false);
    });
  }, [showListModal, userId, listPage]);

  // Reset list state when modal opens/closes
  useEffect(() => {
    if (showListModal) {
      setListPage(1);
      setListHasMore(true);
      setListUsers([]);
    }
  }, [showListModal]);

  // Infinite scroll handler
  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 32 && listHasMore && !listLoading) {
      setListPage(p => p + 1);
    }
  };

  const loadPosts = async () => {
    try {
      let data;
      switch (tab) {
        case 'Posts':
          data = await getMyPosts(page, 10);
          break;
        case 'Liked':
          data = await getLikedPosts(page, 10);
          break;
        case 'Saved':
          data = await getSavedPosts(page, 10);
          break;
        default:
          data = { posts: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      }

      console.log('Fetching posts:', data);

      if (page === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setHasMore(page < data.totalPages);
      setLoadingPosts(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoadingPosts(false);
    }
  };

  const loadMore = () => {
    if (!loadingPosts && hasMore) {
      setPage(prev => prev + 1);
      loadPosts();
    }
  };

  // Add like handler
  const handleUpdatePostLike = async (postId: string, likesCount: number, liked: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        (post._id || post.id) === postId
          ? { ...post, likesCount: likesCount, liked }
          : post
      )
    );
    try {
      if (liked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  if (!userId) {
    return <div className="text-center text-red-500">User not found. Please log in again.</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <img src={logoOrange} alt="Loading" className="w-20 h-20 animate-spin mb-4" />
        <div className="text-lg font-semibold text-orange-500">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900">
      {/* Header with search bar */}
      <Header onPostSelect={setSelectedPostId} />
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 mt-8 px-4 md:px-8">
        {/* Row: Profile picture + name/username */}
        <div className="flex flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex flex-col items-center md:items-start">
            <div className="w-28 h-28 rounded-full bg-orange-100 dark:bg-gray-800 flex items-center justify-center border-4 border-orange-200 dark:border-gray-700 overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <DefaultProfileIcon className="text-orange-400" size={64} />
              )}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-xs">{user.name}</div>
            <div className="text-gray-500 dark:text-gray-400 text-lg">@{user.username}</div>
          </div>
        </div>
        {/* Stats and Edit Profile row */}
        <div className="flex flex-row items-center gap-4 mt-4 md:mt-0 w-full flex-wrap">
          <span className="text-gray-700 dark:text-gray-300 text-base"><span className="font-bold text-gray-800 dark:text-gray-100">{user.postCount || 0}</span> posts</span>
          <span className="text-gray-700 dark:text-gray-300 text-base cursor-pointer hover:underline" onClick={() => setShowListModal('followers')}><span className="font-bold text-gray-800 dark:text-gray-100">{followersCount}</span> followers</span>
          <span className="text-gray-700 dark:text-gray-300 text-base cursor-pointer hover:underline" onClick={() => setShowListModal('following')}><span className="font-bold text-gray-800 dark:text-gray-100">{followingCount}</span> following</span>
          <button
            className="ml-2 px-4 py-1 rounded-full bg-orange-500 text-white font-semibold text-base hover:bg-orange-600 transition h-9 text-sm"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 font-semibold text-lg border-b-2 transition ${tab === t ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-orange-400 dark:hover:text-orange-500'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Tab content with animation */}
      <div className="px-8 min-h-[300px]">
        <AnimatePresence mode="wait" initial={false}>
          {(tab === 'Posts' || tab === 'Liked' || tab === 'Saved') && (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="max-w-5xl mx-auto">
                {loadingPosts && page === 1 ? (
                  <div className="text-center text-gray-400 py-12">Loading posts…</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {posts.map((post) => (
                      <PostCard
                        key={post._id || post.id}
                        post={{
                          id: post._id || post.id,
                          title: post.title,
                          imageUrl: post.imageUrl || post.postPictureUrl,
                          author: post.author || {
                            name: post.authorId?.username || '',
                            avatar: post.authorId?.profilePicture || '',
                          },
                          likes: post.likes ?? post.likesCount ?? 0,
                          liked: tab === 'Liked' ? true : !!post.liked,
                          saved: tab === 'Saved' ? true : !!post.saved,
                        }}
                        showDelete={post.authorId?._id === userId || post.authorId === userId}
                        onDelete={() => {
                          setPostToDelete(post);
                          setShowDeleteModal(true);
                        }}
                        onClick={() => setSelectedPostId(post._id || post.id)}
                        onLikeToggle={handleUpdatePostLike}
                      />
                    ))}
                    {posts.length === 0 && (
                      <div className="col-span-full text-center text-gray-400 py-12">
                        No {tab.toLowerCase()} posts yet.
                      </div>
                    )}
                  </div>
                )}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingPosts}
                      className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                    >
                      {loadingPosts ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {tab === 'Health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="max-w-xl mx-auto">
                {loadingPlan ? (
                  <div className="flex flex-col items-center justify-center min-h-[30vh]">
                    <img src={logoOrange} alt="Loading" className="w-16 h-16 animate-spin mb-4" />
                    <div className="text-lg font-semibold text-orange-500">Loading health data…</div>
                  </div>
                ) : customPlan ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Your Custom Health Plan</h2>
                    {/* User Info Row */}
                    <div className="flex flex-row justify-center gap-8 mb-6 animate-fade-in">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">🎂</span>
                        <span className="text-gray-500 text-sm">Age</span>
                        <span className="font-bold text-lg text-gray-900">{calculateAge(user.dob) ?? '-'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">⚖️</span>
                        <span className="text-gray-500 text-sm">Weight</span>
                        <span className="font-bold text-lg text-gray-900">{user.weight ? `${user.weight} kg` : '-'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">📏</span>
                        <span className="text-gray-500 text-sm">Height</span>
                        <span className="font-bold text-lg text-gray-900">{user.height ? `${user.height} cm` : '-'}</span>
                      </div>
                    </div>
                    {/* Animated BMI Scale */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <BMIScale bmi={parseFloat(customPlan.bmi)} />
                    </motion.div>
                    <div className="bg-orange-50 rounded-2xl p-4 md:p-8 mb-6 mt-6">
                      <div className="text-lg font-semibold text-gray-900 mb-8">Daily recommendation</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MacroCard label="Calories" value={customPlan.calories} unit="" color={macroColors.Calories} />
                        <MacroCard label="Carbs" value={customPlan.carbs} unit="g" color={macroColors.Carbs} />
                        <MacroCard label="Protein" value={customPlan.protein} unit="g" color={macroColors.Protein} />
                        <MacroCard label="Fats" value={customPlan.fats} unit="g" color={macroColors.Fats} />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-pink-400 text-xl">💖</span>
                          <span className="text-gray-700 text-sm">Health Score</span>
                        </div>
                        <div className="text-gray-900 font-bold text-lg">{customPlan.healthScore}/10</div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(customPlan.healthScore / 10) * 100}%`,
                            background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-12">No health data available.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal user={user} onClose={() => { setShowEdit(false); setRefresh(r => r + 1); }} />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="text-xl font-semibold mb-4">Delete Post</div>
            <div className="mb-6">Are you sure you want to delete this post?</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                onClick={() => { setShowDeleteModal(false); setPostToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded font-medium bg-orange-500 text-white hover:bg-orange-600"
                onClick={async () => {
                  try {
                    await axiosInstance.delete(`/posts/${postToDelete._id || postToDelete.id}`);
                    setPosts(posts.filter(p => (p._id || p.id) !== (postToDelete._id || postToDelete.id)));
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                    // Optionally show a toast/snackbar here
                  } catch (err) {
                    alert('Failed to delete post.');
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          currentUserId={userId}
          onLikeUpdate={handleUpdatePostLike}
        />
      )}
      {/* Follower/Following List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
            <button onClick={() => setShowListModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            <div className="text-xl font-semibold mb-4">{showListModal === 'followers' ? 'Followers' : 'Following'}</div>
            {listLoading && listPage === 1 ? (
              <div className="text-gray-400 py-8">Loading…</div>
            ) : listUsers.length === 0 ? (
              <div className="text-gray-400 py-8">No users found.</div>
            ) : (
              <div
                className="divide-y max-h-80 overflow-y-auto"
                ref={listContainerRef}
                onScroll={handleListScroll}
              >
                {listUsers.map((u: any) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-100 rounded-lg px-2"
                    onClick={() => {
                      setShowListModal(null);
                      navigate(`/profile/${u.username}`);
                    }}
                  >
                    <img src={u.profilePicture || '/default-avatar.png'} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-800">{u.name || u.username}</span>
                      <span className="text-gray-500 text-sm">@{u.username}</span>
                    </div>
                  </div>
                ))}
                {listLoading && listPage > 1 && (
                  <div className="py-2 text-gray-400 text-sm">Loading more…</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}