import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import logoOrange from '../../assets/logo_orange_cropped.png';
import DefaultProfileIcon from './DefaultProfileIcon';
import { search, SearchUser, SearchPost } from '../../services/searchService';
import { useDebounce } from '../../hooks/useDebounce';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  onPostSelect: (postId: string) => void;
}

const logoOrange = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516307/logo_orange_cropped_npfklt.png';


const Header: React.FC<HeaderProps> = ({ onPostSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: SearchUser[]; posts: SearchPost[] }>({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Simulate getting user info (replace with real user context or prop in production)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current || !showResults || isLoadingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = resultsRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMoreResults();
      }
    };

    const resultsElement = resultsRef.current;
    if (resultsElement) {
      resultsElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (resultsElement) {
        resultsElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showResults, isLoadingMore, hasMoreUsers, hasMorePosts]);

  const loadMoreResults = async () => {
    if (isLoadingMore || (!hasMoreUsers && !hasMorePosts)) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const results = await search(debouncedSearchQuery, nextPage);

      setSearchResults(prev => ({
        users: [...prev.users, ...results.users],
        posts: [...prev.posts, ...results.posts]
      }));

      setHasMoreUsers(results.pagination.users.hasMore);
      setHasMorePosts(results.pagination.posts.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults({ users: [], posts: [] });
        setShowResults(false);
        setCurrentPage(1);
        setHasMoreUsers(false);
        setHasMorePosts(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await search(debouncedSearchQuery, 1);
        setSearchResults(results);
        setHasMoreUsers(results.pagination.users.hasMore);
        setHasMorePosts(results.pagination.posts.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ users: [], posts: [] });
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    setShowResults(false);
  };

  const handlePostClick = (postId: string) => {
    onPostSelect(postId);
    setShowResults(false);
  };

  const hasResults = searchResults?.users?.length > 0 || searchResults?.posts?.length > 0;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 right-0 z-20 md:left-64 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo and Brand Name */}
        <div className="flex items-center">
          <div className="h-12 w-12 flex items-center justify-center">
            <img src={logoOrange} alt="Foodhub Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold ml-2">
            Foodhub
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-3" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="What's on your mind?"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-700 border border-orange-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Search Results Dropdown */}
            {showResults && (searchQuery.length >= 2 || isSearching) && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
                ) : (
                  <>
                    {searchResults?.users?.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">Users</div>
                        {searchResults.users.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleUserClick(user.username)}
                            className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                          >
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <DefaultProfileIcon className="text-orange-400" size={20} />
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults?.posts?.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">Posts</div>
                        {searchResults.posts.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => handlePostClick(post.id)}
                            className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                          >
                            <img src={post.imageUrl} alt={post.title} className="w-12 h-12 rounded-md object-cover" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{post.menuItemName}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasResults && !isSearching && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">No results found</div>
                    )}

                    {isLoadingMore && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading more...</div>
                    )}

                    {!isLoadingMore && (hasMoreUsers || hasMorePosts) && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Scroll for more results</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Logout Button (Desktop) */}
          <button
            className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Logout
          </button>

          {/* Profile Icon */}
          <div className="relative">
            {/* Desktop Button */}
            <button
              onClick={() => navigate('/profile')}
              className="hidden md:block cursor-pointer hover:opacity-80 transition-opacity"
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-orange-200 dark:border-gray-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border border-orange-200 dark:border-gray-600">
                  <DefaultProfileIcon className="text-orange-400" size={20} />
                </div>
              )}
            </button>
            {/* Mobile Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="md:hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-orange-200 dark:border-gray-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border border-orange-200 dark:border-gray-600">
                  <DefaultProfileIcon className="text-orange-400" size={20} />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  );
};

export default Header;