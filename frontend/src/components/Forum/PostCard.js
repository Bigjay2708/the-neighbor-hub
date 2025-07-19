import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  MoreHorizontal, 
  Pin,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onLike, onDelete, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.userId === currentUserId) || false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await onLike(post._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      events: 'bg-purple-100 text-purple-800',
      pets: 'bg-yellow-100 text-yellow-800',
      recommendations: 'bg-green-100 text-green-800',
      'lost-found': 'bg-red-100 text-red-800',
      announcements: 'bg-indigo-100 text-indigo-800',
      questions: 'bg-orange-100 text-orange-800',
      services: 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCategory = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <Link to={`/forum/post/${post._id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {post.authorId?.avatar ? (
              <img
                src={post.authorId.avatar}
                alt={`${post.authorId.firstName} ${post.authorId.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {post.authorId?.firstName} {post.authorId?.lastName}
                </span>
                {post.authorId?.isVerified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {(post.authorId?.role === 'admin' || post.authorId?.role === 'moderator') && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.authorId.role === 'admin' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {post.authorId.role}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.lastActivity && post.lastActivity !== post.createdAt && (
                  <span>• Updated {formatDistanceToNow(new Date(post.lastActivity), { addSuffix: true })}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {post.isSticky && (
              <Pin className="w-4 h-4 text-yellow-500" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category)}`}>
              {formatCategory(post.category)}
            </span>
            {(currentUserId === post.authorId?._id || post.authorId?.role === 'admin') && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(post._id);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.content.length > 200 
            ? `${post.content.substring(0, 200)}...` 
            : post.content
          }
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Images Preview */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto">
              {post.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ))}
              {post.images.length > 3 && (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                  +{post.images.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </div>
          </div>

          {post.isSolved && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              ✓ Solved
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PostCard;
