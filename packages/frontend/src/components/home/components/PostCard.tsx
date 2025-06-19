import React from 'react';
import DefaultProfileIcon from '../../common/DefaultProfileIcon';
import { FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface Author {
  avatar: string;
  id?: string;
  username?: string;
}

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  author: Author;
  likes: number;
  liked: boolean;
  saved: boolean;
  restaurant?: { name: string; location?: any };
  distance?: number;
}

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
  onLikeToggle?: (postId: string, likesCount: number, liked: boolean) => void;
  showDistance?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, showDelete, onDelete, onLikeToggle, showDistance }) => {
  const navigate = useNavigate();
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeToggle) {
      onLikeToggle(post.id, post.liked ? post.likes - 1 : post.likes + 1, !post.liked);
    }
  };
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use post.username for navigation
    const username = post.author?.username;
    console.log('Clicked author:', post.author);
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
    >
      {/* Post Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Delete button (top-right) */}
        {showDelete && (
          <button
            className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow hover:bg-orange-100 text-gray-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(); }}
            title="Delete Post"
          >
            <FaTrash size={16} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="p-3">
        {/* Post Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-5">
          {post.title}
        </h3>

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              onClick={handleProfileClick}
              className="flex items-center space-x-1 cursor-pointer group/profile hover:text-orange-500"
              title={post.author.username}
            >
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                  alt={post.author.username}
                  className="w-5 h-5 rounded-full object-cover ring-0 group-hover/profile:ring-2 group-hover/profile:ring-orange-400 transition"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <DefaultProfileIcon className="text-orange-400" size={14} />
              </span>
            )}
              <span className="text-xs text-gray-600 truncate group-hover/profile:underline group-hover/profile:text-orange-500 transition">
                {post.author.username}
              </span>
            </span>
          </div>

          {/* Likes */}
          <div className="flex items-center space-x-1">
            <button onClick={handleLike} className="focus:outline-none">
              {post.liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">{post.likes}</span>
          </div>
        </div>

        {/* Restaurant Info: Only show in Nearby tab */}
        {showDistance && post.restaurant && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-1 text-orange-500" />
            <span>{post.restaurant.name}</span>
            {post.distance !== undefined && (
              <span className="ml-2 text-xs text-gray-500">
                ({post.distance} km)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;