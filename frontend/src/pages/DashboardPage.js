import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  ShoppingBag, 
  Shield, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Start a Discussion',
      description: 'Share something with your neighbors',
      icon: MessageSquare,
      href: '/forum',
      color: 'bg-blue-500'
    },
    {
      title: 'List an Item',
      description: 'Sell or trade something',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'bg-green-500'
    },
    {
      title: 'Report Incident',
      description: 'Share a safety concern',
      icon: Shield,
      href: '/safety',
      color: 'bg-red-500'
    },
    {
      title: 'Find Neighbors',
      description: 'Connect with nearby residents',
      icon: Users,
      href: '/neighbors',
      color: 'bg-purple-500'
    }
  ];

  const stats = [
    { label: 'Forum Posts', value: '24', change: '+12%', icon: MessageSquare },
    { label: 'Active Listings', value: '8', change: '+5%', icon: ShoppingBag },
    { label: 'Safety Reports', value: '3', change: '-20%', icon: Shield },
    { label: 'Neighbors', value: '156', change: '+8%', icon: Users }
  ];

  const recentActivity = [
    {
      type: 'forum',
      title: 'New post in General Discussion',
      description: 'Sarah M. shared recommendations for local restaurants',
      time: '2 hours ago',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      type: 'marketplace',
      title: 'New listing: Dining Table',
      description: 'Mike R. listed a dining table for $150',
      time: '4 hours ago',
      icon: ShoppingBag,
      color: 'text-green-600'
    },
    {
      type: 'safety',
      title: 'Safety alert resolved',
      description: 'Lost dog found and returned to owner',
      time: '1 day ago',
      icon: Shield,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening in your neighborhood
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Your Neighborhood</span>
            </div>
          </div>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
            />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="card p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${action.color} rounded-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/forum"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="card p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neighborhood Highlights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Neighborhood Highlights</h2>
          </div>
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-medium text-gray-900 mb-2">🎉 Community Event</h3>
              <p className="text-sm text-gray-600 mb-3">
                Annual block party planning meeting this Saturday at 2 PM in the community center.
              </p>
              <Link
                to="/forum"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Learn more →
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="font-medium text-gray-900 mb-2">🏪 New Business</h3>
              <p className="text-sm text-gray-600 mb-3">
                Welcome to Maria's Bakery, now open on Main Street! 
                Fresh bread and pastries daily.
              </p>
              <Link
                to="/marketplace"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Support local →
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="font-medium text-gray-900 mb-2">🌟 Neighbor Spotlight</h3>
              <p className="text-sm text-gray-600 mb-3">
                Thank you to Tom K. for organizing the neighborhood cleanup last weekend!
              </p>
              <Link
                to="/neighbors"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Meet neighbors →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
