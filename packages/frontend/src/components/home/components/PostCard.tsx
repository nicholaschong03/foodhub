import React from 'react';
import DefaultProfileIcon from '../../common/DefaultProfileIcon';

interface Author {
  name: string;
  avatar: string;
}

interface Post {
  id: string;
  title: string;
  imageUrl: string;
  author: Author;
  likes: number;
}

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Post Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Play button overlay for video posts
        <div className="absolute top-2 right-2">
          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div> */}
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
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <DefaultProfileIcon className="text-orange-400" size={14} />
              </span>
            )}
            <span className="text-xs text-gray-600 truncate">
              {post.author.name}
            </span>
          </div>

          {/* Likes */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-xs text-gray-500">{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;