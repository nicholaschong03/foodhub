import React, { useEffect, useState } from 'react';
import { getUserProfile, getUserProfileByUsername, getFollowers, getFollowing } from '../../services/userService';
import { getPostsByUsername, getLikedPostsByUsername, getSavedPostsByUsername, likePost, unlikePost } from '../../services/postService';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '../../services/userService';
import CustomPlanScreen from '../auth/CustomPlanScreen';
import PostCard from '../home/components/PostCard';
import logoOrange from '../../assets/logo_orange.png';
import DefaultProfileIcon from '../common/DefaultProfileIcon';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import PostDetailsModal from '../home/components/PostDetailsModal';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../common/Header';

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

export default function OtherUserProfileScreen() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('Posts');
  const [refresh, setRefresh] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [customPlan, setCustomPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showListModal, setShowListModal] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (username) {
      getUserProfileByUsername(username).then(setUser);
    }
  }, [username, refresh]);

  useEffect(() => {
    if (username) {
      setLoadingPosts(true);
      setPage(1);
      setHasMore(true);
      loadPosts();
    }
  }, [tab, refresh, username]);

  useEffect(() => {
    if (tab === 'Health' && user && user._id) {
      setLoadingPlan(true);
      console.log('Custom plan API call userId:', user._id, 'username:', username);
      axios.get(`/api/users/${user._id}/custom-plan`).then(res => {
        setCustomPlan(res.data.data);
        setLoadingPlan(false);
      }).catch(() => setLoadingPlan(false));
    }
  }, [tab, user]);

  useEffect(() => {
    if (user && user._id) {
      getFollowers(user._id).then(res => setFollowersCount(res.total || 0));
      getFollowing(user._id).then(res => setFollowingCount(res.total || 0));
    }
  }, [user]);

  // Check if current user is following this user
  useEffect(() => {
    const checkFollow = async () => {
      if (user && user._id) {
        setFollowLoading(true);
        try {
          const following = await checkIsFollowing(user._id);
          setIsFollowing(following);
        } catch {
          setIsFollowing(false);
        } finally {
          setFollowLoading(false);
        }
      }
    };
    checkFollow();
  }, [user]);

  // Fetch list when modal is opened
  useEffect(() => {
    if (!showListModal || !user || !user._id) return;
    setListLoading(true);
    const fetchList = showListModal === 'followers' ? getFollowers : getFollowing;
    fetchList(user._id).then(res => {
      if (showListModal === 'followers') {
        setListUsers((res.followers || []).map((item: any) => item.follower));
      } else {
        setListUsers((res.following || []).map((item: any) => item.following));
      }
      setListLoading(false);
    });
  }, [showListModal, user]);

  const loadPosts = async () => {
    if (!username) return;
    try {
      let data;
      switch (tab) {
        case 'Posts':
          data = await getPostsByUsername(username, page, 10);
          break;
        case 'Liked':
          data = await getLikedPostsByUsername(username, page, 10);
          break;
        case 'Saved':
          data = await getSavedPostsByUsername(username, page, 10);
          break;
        default:
          data = { posts: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      }
      if (page === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setHasMore(page < data.totalPages);
      setLoadingPosts(false);
    } catch (error) {
      setLoadingPosts(false);
    }
  };

  const loadMore = () => {
    if (!loadingPosts && hasMore) {
      setPage(prev => prev + 1);
      loadPosts();
    }
  };

  const handleFollow = async () => {
    if (!user || !user._id) return;
    setFollowLoading(true);
    try {
      await followUser(user._id);
      setIsFollowing(true);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !user._id) return;
    setFollowLoading(true);
    try {
      await unfollowUser(user._id);
      setIsFollowing(false);
    } finally {
      setFollowLoading(false);
    }
  };

  // Like handler for cards and modal
  const handleUpdatePostLike = async (postId: string, likesCount: number, liked: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        (post._id || post.id) === postId
          ? { ...post, likes: likesCount, liked }
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

  if (!username) {
    return <div className="text-center text-red-500">User not found.</div>;
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
        {/* Stats and Follow/Unfollow row */}
        <div className="flex flex-row items-center gap-4 mt-4 md:mt-0 w-full flex-wrap">
          <span className="text-gray-700 dark:text-gray-300 text-base"><span className="font-bold text-gray-800 dark:text-gray-100">{user.postCount || 0}</span> posts</span>
          <span className="text-gray-700 dark:text-gray-300 text-base cursor-pointer hover:underline" onClick={() => setShowListModal('followers')}><span className="font-bold text-gray-800 dark:text-gray-100">{followersCount}</span> followers</span>
          <span className="text-gray-700 dark:text-gray-300 text-base cursor-pointer hover:underline" onClick={() => setShowListModal('following')}><span className="font-bold text-gray-800 dark:text-gray-100">{followingCount}</span> following</span>
          {user && user._id !== (JSON.parse(localStorage.getItem('user') || '{}').id || JSON.parse(localStorage.getItem('user') || '{}')._id) && (
            isFollowing ? (
              <button
                className="ml-2 px-4 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition h-9 text-sm"
                onClick={handleUnfollow}
                disabled={followLoading}
              >
                {followLoading ? 'Unfollowing...' : 'Unfollow'}
              </button>
            ) : (
              <button
                className="ml-2 px-4 py-1 rounded-full bg-orange-500 text-white font-semibold text-base hover:bg-orange-600 transition h-9 text-sm"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? 'Following...' : 'Follow'}
              </button>
            )
          )}
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
                          author: {
                            avatar: post.author?.avatar || post.authorId?.profilePicture || '',
                            username: post.author?.username || post.authorId?.username || '',
                          },
                          likes: post.likes ?? post.likesCount ?? 0,
                          liked: !!post.liked,
                          saved: !!post.saved,
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
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">User's Custom Health Plan</h2>
                    {/* User Info Row */}
                    <div className="flex flex-row justify-center gap-8 mb-6 animate-fade-in">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">🎂</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Age</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : '-'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">⚖️</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Weight</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{user.weight ? `${user.weight} kg` : '-'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">📏</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Height</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{user.height ? `${user.height} cm` : '-'}</span>
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
                    <div className="bg-orange-50 dark:bg-gray-800 rounded-2xl p-4 md:p-8 mb-6 mt-6">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-8">Daily recommendation</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 flex flex-col items-center shadow-sm">
                          <div className="text-2xl mb-1 text-orange-500">🔥</div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm">Calories</div>
                          <div className="font-bold text-xl text-gray-900 dark:text-gray-100">{customPlan.calories}<span className="text-sm font-normal text-gray-500 dark:text-gray-400"></span></div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 flex flex-col items-center shadow-sm">
                          <div className="text-2xl mb-1 text-orange-400">🌾</div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm">Carbs</div>
                          <div className="font-bold text-xl text-gray-900 dark:text-gray-100">{customPlan.carbs}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">g</span></div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 flex flex-col items-center shadow-sm">
                          <div className="text-2xl mb-1 text-red-400">🍗</div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm">Protein</div>
                          <div className="font-bold text-xl text-gray-900 dark:text-gray-100">{customPlan.protein}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">g</span></div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 flex flex-col items-center shadow-sm">
                          <div className="text-2xl mb-1 text-blue-400">🥑</div>
                          <div className="text-gray-700 dark:text-gray-300 text-sm">Fats</div>
                          <div className="font-bold text-xl text-gray-900 dark:text-gray-100">{customPlan.fats}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">g</span></div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-pink-400 text-xl">💖</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">Health Score</span>
                        </div>
                        <div className="text-gray-900 dark:text-gray-100 font-bold text-lg">{customPlan.healthScore}/10</div>
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
      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          currentUserId={user?.id || user?._id}
          onLikeUpdate={handleUpdatePostLike}
        />
      )}
      {/* Follower/Following List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
            <button onClick={() => setShowListModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-2xl font-bold">&times;</button>
            <div className="text-xl font-semibold mb-4 dark:text-white">{showListModal === 'followers' ? 'Followers' : 'Following'}</div>
            {listLoading ? (
              <div className="text-gray-400 dark:text-gray-500 py-8">Loading…</div>
            ) : listUsers.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500 py-8">No users found.</div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {listUsers.map((u: any) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2"
                    onClick={() => {
                      setShowListModal(null);
                      navigate(`/profile/${u.username}`);
                    }}
                  >
                    <img src={u.profilePicture || '/default-avatar.png'} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{u.name || u.username}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">@{u.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}