import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Search, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import PostCard from '../components/Forum/PostCard';
import CreatePostModal from '../components/Forum/CreatePostModal';
import toast from 'react-hot-toast';

const ForumPage = () => {
  const { user } = useAuth();
  const { emitForumMessage } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'events', label: 'Events' },
    { value: 'pets', label: 'Pets' },
    { value: 'recommendations', label: 'Recommendations' },
    { value: 'lost-found', label: 'Lost & Found' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'questions', label: 'Questions' },
    { value: 'services', label: 'Services' }
  ];

  const sortOptions = [
    { value: 'lastActivity', label: 'Recent Activity' },
    { value: 'newest', label: 'Newest' },
    { value: 'mostLiked', label: 'Most Liked' },
    { value: 'mostViewed', label: 'Most Viewed' }
  ];

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/forum/posts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to load posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error loading posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, selectedCategory, searchTerm]);

  const handleCreatePost = async (formData) => {
    try {
      setIsSubmitting(true);
      
      const postFormData = new FormData();
      postFormData.append('title', formData.title);
      postFormData.append('content', formData.content);
      postFormData.append('category', formData.category);
      
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(tag => {
          postFormData.append('tags', tag);
        });
      }
      
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(imageData => {
          postFormData.append('images', imageData.file);
        });
      }

      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: postFormData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Post created successfully!');
        
        emitForumMessage({
          type: 'newPost',
          title: data.post.title,
          postId: data.post._id
        });
        
        await fetchPosts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        await fetchPosts();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect and discuss with your neighbors</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Be the first to start a discussion in your neighborhood!'
            }
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLikePost}
              onDelete={handleDeletePost}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-lg ${
                  currentPage === page 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ForumPage;
