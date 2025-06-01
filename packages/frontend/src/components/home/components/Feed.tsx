import React, { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';
import { getPosts, Post as PostType } from '../../../services/postService';
import PostDetailsModal from './PostDetailsModal';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Fetch posts for a given page
  const fetchPosts = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    try {
      const res = await getPosts(pageToFetch, 20);
      if (pageToFetch === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setHasMore(res.posts.length > 0 && pageToFetch < res.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (page === 1) return; // already loaded
    fetchPosts(page);
  }, [page, fetchPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Category Tabs */}
      <div className="flex space-x-6 mb-6 overflow-x-auto">
        {['Recommended', 'Trending', 'Following', 'Nearby', 'Top Rated','Cuisines', 'Japanese','Healthy & Light', 'Dessert'].map((category) => (
          <button
            key={category}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              category === 'Recommended'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading/Error States */}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}

      {/* Posts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />
        ))}
      </div>

      {/* Infinite scroll loading spinner */}
      {loading && (
        <div className="text-center py-6 text-gray-400">Loading more posts…</div>
      )}
      {!hasMore && !loading && posts.length > 0 && (
        <div className="text-center py-6 text-gray-400">No more posts to load.</div>
      )}

      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
};

export default Feed;