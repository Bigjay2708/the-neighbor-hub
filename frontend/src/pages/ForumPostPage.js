import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Flag,
  MoreHorizontal,
  Send,
  Reply,
  User,
  CheckCircle,
  Clock,
  Pin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ForumPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emitForumMessage } = useSocket();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forum/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        setComments(data.comments || []);
        setIsLiked(data.post.likes?.some(like => like.userId === user.id) || false);
        setLikesCount(data.post.likes?.length || 0);
      } else if (response.status === 404) {
        toast.error('Post not found');
        navigate('/forum');
      } else {
        toast.error('Failed to load post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Error loading post');
    } finally {
      setLoading(false);
    }
  }, [id, user.id, navigate]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      } else {
        toast.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const response = await fetch(`/api/forum/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: commentText,
          parentCommentId: replyingTo
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Comment added!');
        setCommentText('');
        setReplyingTo(null);
        
        await fetchPost();
        
        emitForumMessage({
          type: 'newComment',
          postId: id,
          comment: data.comment
        });
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Post deleted');
        navigate('/forum');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]);

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

  const renderComment = (comment, depth = 0) => (
    <div key={comment._id} className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            {comment.authorId?.avatar ? (
              <img
                src={comment.authorId.avatar}
                alt={`${comment.authorId.firstName} ${comment.authorId.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {comment.authorId?.firstName} {comment.authorId?.lastName}
                </span>
                {comment.authorId?.isVerified && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {(comment.authorId?.role === 'admin' || comment.authorId?.role === 'moderator') && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    comment.authorId.role === 'admin' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {comment.authorId.role}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{comment.content}</p>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setReplyingTo(comment._id)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
          >
            <Reply className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>
      </div>
      
      {/* Render nested replies */}
      {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
        <Link to="/forum" className="text-primary-600 hover:text-primary-500">
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/forum"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Forum
      </Link>

      {/* Post Content */}
      <div className="card p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {post.authorId?.avatar ? (
              <img
                src={post.authorId.avatar}
                alt={`${post.authorId.firstName} ${post.authorId.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
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
                  <span className={`text-sm px-2 py-1 rounded-full ${
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
            {post.isSticky && <Pin className="w-4 h-4 text-yellow-500" />}
            <span className={`text-sm px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
              {formatCategory(post.category)}
            </span>
            {(user.id === post.authorId?._id || user.role === 'admin') && (
              <button
                onClick={handleDeletePost}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Post Content */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.images.map((image, index) => (
                <div key={index}>
                  <img
                    src={image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {image.caption && (
                    <p className="text-sm text-gray-600 mt-1">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <Eye className="w-5 h-5" />
              <span>{post.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Comments ({comments.length})
        </h3>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              {replyingTo && (
                <div className="mb-2 text-sm text-gray-600">
                  Replying to comment...{' '}
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="textarea w-full"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="btn-primary flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPostPage;
