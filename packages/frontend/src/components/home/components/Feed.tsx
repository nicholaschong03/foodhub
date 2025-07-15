import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';
import { getPosts, getPostsWithDistance, getTrendingPosts, getFollowingPosts, getSavoryPosts, getSweetPosts, getTopRatedPosts, getJapanesePosts, getKoreanPosts, getChinesePosts, getWesternPosts, Post as PostType, likePost, unlikePost } from '../../../services/postService';
import PostDetailsModal from './PostDetailsModal';
import { MapPinIcon } from '@heroicons/react/24/outline';
import Header from '../../common/Header';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;

  // Request user's location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(null);
      }
    );
  }, []);

  // Callback to update like count in feed
  const handleUpdatePostLike = async (postId: string, likesCount: number, liked: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: likesCount, liked }
          : post
      )
    );
    // Call like/unlike API
    try {
      if (liked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      // Optionally handle error (rollback UI, show toast, etc.)
    }
  };

  // Fetch posts for a given page
  const fetchPosts = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    try {
      let res;
      if (selectedCategory === 'Nearby') {
        if (!userLocation) {
          return;
        }
        res = await getPostsWithDistance(pageToFetch, 20, userLocation);
      } else if (selectedCategory === 'Trending') {
        res = await getTrendingPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Following') {
        res = await getFollowingPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Savory') {
        res = await getSavoryPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Dessert') {
        res = await getSweetPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Top Rated') {
        res = await getTopRatedPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Japanese') {
        res = await getJapanesePosts(pageToFetch, 20);
      } else if (selectedCategory === 'Korean') {
        res = await getKoreanPosts(pageToFetch, 20);
      } else if (selectedCategory === 'Chinese') {
        res = await getChinesePosts(pageToFetch, 20);
      } else if (selectedCategory === 'Western') {
        res = await getWesternPosts(pageToFetch, 20);
      } else {
        res = await getPosts(pageToFetch, 20);
      }

      if (pageToFetch === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setHasMore(res.posts.length > 0 && pageToFetch < res.totalPages);
    } catch (err) {
      // Optionally handle error (rollback UI, show toast, etc.)
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, userLocation]);

  // Handle category change with animation
  const handleCategoryChange = async (category: string) => {
    if (category === selectedCategory) return;

    setIsTransitioning(true);
    setSelectedCategory(category);
    setPage(1);
    setPosts([]);
    setHasMore(true);

    if (category === 'Nearby') {
      requestLocation();
    }

    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsTransitioning(false);
  };

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // Fetch next page when page state changes
  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page, fetchPosts]);

  const loadingMessages = [
    'Analyzing your preferences…',
    'Detecting dietary restrictions…',
    'Finding your best food matches…',
    'Personalizing your feed…',
    'Cooking up recommendations…',
    'Almost ready!'
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle loading messages when loading recommended
  useEffect(() => {
    if (selectedCategory === 'Recommended' && loading) {
      setLoadingMessageIndex(0);
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [selectedCategory, loading]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with search bar */}
      <Header onPostSelect={setSelectedPostId} />
      {/* Category Tabs */}
      <div className="flex space-x-6 mb-6 overflow-x-auto scrollbar-hide">
        {['Trending', 'Recommended', 'Following', 'Nearby', 'Top Rated', 'Japanese', 'Korean', 'Western', 'Chinese', 'Savory', 'Dessert'].map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${category === selectedCategory
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-600 hover:text-orange-500'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* CSS to hide the scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Location Prompt */}
      {selectedCategory === 'Nearby' && !userLocation && (
        <div className={`text-center py-10 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <MapPinIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Please enable location access to see nearby posts</p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
          >
            Enable Location
          </button>
        </div>
      )}

      {/* Posts Grid */}
      {((selectedCategory !== 'Nearby') || (selectedCategory === 'Nearby' && userLocation)) && (
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                imageUrl: post.imageUrl || post.postPictureUrl,
                author: {
                  avatar: (post.author as any)?.avatar || (post as any).authorId?.profilePicture || '',
                  username: (post.author as any)?.username || (post as any).authorId?.username || ''
                },
                restaurant: {
                  name: (post as any).restaurantName,
                  location: (post as any).restaurantLocation,
                },
              }}
              showDistance={selectedCategory === 'Nearby'}
              onClick={() => setSelectedPostId(post.id)}
              onLikeToggle={handleUpdatePostLike}
            />
          ))}
        </div>
      )}

      {/* No posts for Following */}
      {!loading && selectedCategory === 'Following' && posts.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-lg">
          You are not following anyone yet, or no posts to show.
        </div>
      )}

      {/* Loading States */}
      {loading && selectedCategory === 'Recommended' && (
        <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
          <svg className="animate-spin h-8 w-8 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="text-lg text-orange-500 font-semibold min-h-[2.5rem] transition-all duration-500">
            {loadingMessages[loadingMessageIndex]}
          </div>
        </div>
      )}
      {loading && selectedCategory !== 'Recommended' && (
        <div className={`text-center py-6 text-gray-400 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          Loading more posts…
        </div>
      )}
      {!hasMore && !loading && posts.length > 0 && (
        <div className={`text-center py-6 text-gray-400 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          No more posts to load.
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
    </div>
  );
};

export default Feed;