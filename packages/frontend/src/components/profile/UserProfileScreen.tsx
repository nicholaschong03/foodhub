import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../../services/userService';
import { getMyPosts } from '../../services/postService';
import CustomPlanScreen from '../auth/CustomPlanScreen';
import EditProfileModal from './EditProfileModal';
import PostCard from '../home/components/PostCard';
import logoOrange from '../../assets/logo_orange.png';
import DefaultProfileIcon from '../common/DefaultProfileIcon';

const TABS = ['Posts', 'Saved', 'Liked', 'Health'];

export default function UserProfileScreen({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('Posts');
  const [showEdit, setShowEdit] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    getUserProfile(userId).then(setUser);
  }, [userId, refresh]);

  useEffect(() => {
    if (tab === 'Posts') {
      setLoadingPosts(true);
      getMyPosts(1, 10).then(data => {
        setPosts(data.posts || []);
        setLoadingPosts(false);
      });
    }
  }, [tab, refresh]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <img src={logoOrange} alt="Loading" className="w-20 h-20 animate-spin mb-4" />
        <div className="text-lg font-semibold text-orange-500">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-4 mt-8 px-8">
        <div className="relative">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} className="w-28 h-28 rounded-full object-cover border-4 border-orange-200" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center border-4 border-orange-200">
              <DefaultProfileIcon className="text-orange-400" size={64} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">{user.name}</div>
            <button
              className="ml-0 md:ml-4 px-4 py-1 rounded-full bg-orange-500 text-white font-semibold text-base hover:bg-orange-600 transition h-9 text-sm"
              style={{ minWidth: 0 }}
              onClick={() => setShowEdit(true)}
            >
              Edit Profile
            </button>
          </div>
          {/* Username, followers, following below name/profile */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
            <div className="text-gray-500 text-lg">@{user.username}</div>
            <div className="flex gap-6 text-gray-700 text-base">
              <span><span className="font-bold">{user.followersCount || 0}</span> followers</span>
              <span><span className="font-bold">{user.followingCount || 0}</span> following</span>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 font-semibold text-lg border-b-2 transition ${tab === t ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-orange-400'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="px-8">
        {tab === 'Posts' && (
          <div className="max-w-5xl mx-auto">
            {loadingPosts ? (
              <div className="text-center text-gray-400 py-12">Loading posts…</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <PostCard key={post._id || post.id} post={{
                    id: post._id || post.id,
                    title: post.title,
                    imageUrl: post.postPictureUrl,
                    author: {
                      name: post.authorId?.username || '',
                      avatar: post.authorId?.profilePicture || '',
                    },
                    likes: post.likesCount || 0,
                  }} />
                ))}
                {posts.length === 0 && <div className="col-span-full text-center text-gray-400 py-12">No posts yet.</div>}
              </div>
            )}
          </div>
        )}
        {tab === 'Saved' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Saved posts logic here */}
            <div className="col-span-full text-center text-gray-400 py-12">No saved posts yet.</div>
          </div>
        )}
        {tab === 'Liked' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Liked posts logic here */}
            <div className="col-span-full text-center text-gray-400 py-12">No liked posts yet.</div>
          </div>
        )}
        {tab === 'Health' && (
          <div className="max-w-xl mx-auto">
            <CustomPlanScreen userId={userId} onClose={() => setTab('Posts')} />
          </div>
        )}
      </div>
      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal user={user} onClose={() => { setShowEdit(false); setRefresh(r => r + 1); }} />
      )}
    </div>
  );
}