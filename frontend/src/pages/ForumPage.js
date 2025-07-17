import React from 'react';
import { MessageSquare, Plus, Search, Filter } from 'lucide-react';

const ForumPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect and discuss with your neighbors</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search discussions..."
              className="input pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <button className="btn-secondary flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      <div className="card p-8 text-center">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Forum Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          The community forum feature is currently being developed. 
          Soon you'll be able to create posts, join discussions, and connect with your neighbors.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Post creation and management</p>
          <p>✅ Categories and tagging</p>
          <p>✅ Comments and replies</p>
          <p>✅ Real-time notifications</p>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
