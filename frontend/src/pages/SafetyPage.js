import React from 'react';
import { Shield, Plus, Search, Filter, Map, AlertTriangle } from 'lucide-react';

const SafetyPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neighborhood Safety</h1>
          <p className="text-gray-600 mt-1">Stay informed and help keep your community safe</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Reports</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search safety reports..."
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
          <button className="btn-secondary flex items-center">
            <Map className="w-4 h-4 mr-2" />
            Map View
          </button>
        </div>
      </div>

      <div className="card p-8 text-center">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Safety Network Coming Soon</h3>
        <p className="text-gray-600 mb-4">
          The safety reporting feature is currently being developed. 
          Soon you'll be able to report incidents, receive alerts, and help keep your neighborhood safe.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Incident reporting</p>
          <p>✅ Real-time safety alerts</p>
          <p>✅ Map visualization</p>
          <p>✅ Anonymous reporting option</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
