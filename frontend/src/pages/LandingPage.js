import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ShoppingBag, 
  Shield, 
  Users, 
  MapPin, 
  Heart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Connect with neighbors through organized discussions, events, and recommendations.',
      color: 'text-blue-600'
    },
    {
      icon: ShoppingBag,
      title: 'Local Marketplace',
      description: 'Buy, sell, and trade items safely within your neighborhood community.',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Safety Network',
      description: 'Stay informed with real-time safety alerts and incident reporting.',
      color: 'text-red-600'
    },
    {
      icon: Users,
      title: 'Neighbor Directory',
      description: 'Discover neighbors with shared interests and helpful skills.',
      color: 'text-purple-600'
    }
  ];

  const benefits = [
    'Build stronger community connections',
    'Share resources and services locally',
    'Stay informed about neighborhood events',
    'Enhance neighborhood safety together',
    'Reduce waste through local trading',
    'Support local businesses and services'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NH</span>
              </div>
              <span className="text-xl font-bold text-gradient">NeighborHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Community Connection{' '}
              <span className="text-gradient">Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Foster stronger local communities through communication, collaboration, and shared safety. 
              Connect with neighbors, trade locally, and build the community you want to live in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn-primary btn-lg shadow-glow"
              >
                Join Your Neighborhood
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary btn-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Community Connection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              NeighborHub brings together all the tools your community needs to thrive, 
              from daily conversations to emergency alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose NeighborHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transform your neighborhood into a thriving, connected community where neighbors 
                look out for each other and work together to create a better place to live.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Location-Based</h4>
                      <p className="text-sm text-gray-600">Connect only with verified neighbors</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Community First</h4>
                      <p className="text-sm text-gray-600">Built for neighbors, by neighbors</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Safe & Secure</h4>
                      <p className="text-sm text-gray-600">Privacy-focused with verified users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Connect with Your Neighbors?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of neighbors who are already building stronger, safer, 
            more connected communities.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NH</span>
              </div>
              <span className="text-xl font-bold text-white">NeighborHub</span>
            </div>
            <p className="text-sm">
              © 2025 NeighborHub. Building stronger communities, one neighborhood at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
