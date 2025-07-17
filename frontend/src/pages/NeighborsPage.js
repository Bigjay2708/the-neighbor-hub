import React from 'react';
import { Users, Search, Filter, MapPin } from 'lucide-react';

const NeighborsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neighbors</h1>
          <p className="text-gray-600 mt-1">Connect with people in your community</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search neighbors..."
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
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Neighbor Directory Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          The neighbor directory feature is currently being developed. 
          Soon you'll be able to connect with verified neighbors and discover shared interests.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Verified neighbor profiles</p>
          <p>✅ Skills and interests</p>
          <p>✅ Private messaging</p>
          <p>✅ Community badges</p>
        </div>
      </div>
    </div>
  );
};

export default NeighborsPage;
