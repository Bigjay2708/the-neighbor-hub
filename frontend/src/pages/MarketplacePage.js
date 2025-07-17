import React from 'react';
import { ShoppingBag, Plus, Search, Filter, Grid, List } from 'lucide-react';

const MarketplacePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">Buy, sell, and trade with your neighbors</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          List Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search marketplace..."
              className="input pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="btn-secondary p-2">
            <Grid className="w-4 h-4" />
          </button>
          <button className="btn-secondary p-2">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card p-8 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Marketplace Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          The marketplace feature is currently being developed. 
          Soon you'll be able to buy, sell, and trade items with your neighbors safely and easily.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Item listings with photos</p>
          <p>✅ Category filtering</p>
          <p>✅ In-app messaging</p>
          <p>✅ Rating and review system</p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
