const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Neighborhood = require('./models/Neighborhood');
const ForumPost = require('./models/ForumPost');
const MarketplaceListing = require('./models/MarketplaceListing');
const SafetyReport = require('./models/SafetyReport');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Neighborhood.deleteMany({});
    await ForumPost.deleteMany({});
    await MarketplaceListing.deleteMany({});
    await SafetyReport.deleteMany({});

    console.log('Cleared existing data');

    // Create sample neighborhood
    const neighborhood = new Neighborhood({
      name: 'Willowbrook Community',
      description: 'A friendly residential neighborhood with tree-lined streets and community spirit.',
      zipCodes: ['12345', '12346'],
      boundaries: {
        type: 'Polygon',
        coordinates: [[
          [-74.0059, 40.7128],
          [-74.0059, 40.7628],
          [-73.9559, 40.7628],
          [-73.9559, 40.7128],
          [-74.0059, 40.7128]
        ]]
      },
      settings: {
        requireVerification: true,
        allowBusinessListings: true,
        moderateAllPosts: false,
        maxPostsPerDay: 10
      }
    });

    await neighborhood.save();
    console.log('Created sample neighborhood');

    // Create sample users
    const users = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: await bcrypt.hash('password123', 12),
        address: {
          street: '123 Oak Street',
          city: 'Willowbrook',
          state: 'NY',
          zipCode: '12345',
          coordinates: { lat: 40.7300, lng: -73.9850 }
        },
        neighborhoodId: neighborhood._id,
        role: 'admin',
        isVerified: true,
        bio: 'Community leader and long-time resident. Always happy to help new neighbors!',
        skills: ['gardening', 'home-repair', 'community-organizing']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        password: await bcrypt.hash('password123', 12),
        address: {
          street: '456 Maple Avenue',
          city: 'Willowbrook',
          state: 'NY',
          zipCode: '12345',
          coordinates: { lat: 40.7320, lng: -73.9830 }
        },
        neighborhoodId: neighborhood._id,
        role: 'resident',
        isVerified: true,
        bio: 'Mother of two, loves baking and organizing neighborhood events.',
        skills: ['baking', 'event-planning', 'childcare']
      },
      {
        firstName: 'Mike',
        lastName: 'Rodriguez',
        email: 'mike.rodriguez@example.com',
        password: await bcrypt.hash('password123', 12),
        address: {
          street: '789 Pine Road',
          city: 'Willowbrook',
          state: 'NY',
          zipCode: '12346',
          coordinates: { lat: 40.7280, lng: -73.9870 }
        },
        neighborhoodId: neighborhood._id,
        role: 'resident',
        isVerified: true,
        bio: 'IT professional and amateur photographer. Happy to help with tech issues!',
        skills: ['photography', 'computer-repair', 'web-development']
      },
      {
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@example.com',
        password: await bcrypt.hash('password123', 12),
        address: {
          street: '321 Elm Street',
          city: 'Willowbrook',
          state: 'NY',
          zipCode: '12345',
          coordinates: { lat: 40.7310, lng: -73.9840 }
        },
        neighborhoodId: neighborhood._id,
        role: 'moderator',
        isVerified: true,
        bio: 'Retired teacher and volunteer. Loves reading and helping students.',
        skills: ['tutoring', 'reading', 'education']
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created sample users');

    // Update neighborhood stats
    await Neighborhood.findByIdAndUpdate(neighborhood._id, {
      $set: {
        adminIds: [createdUsers[0]._id],
        moderatorIds: [createdUsers[3]._id],
        'stats.totalMembers': createdUsers.length
      }
    });

    // Create sample forum posts
    const forumPosts = [
      {
        title: 'Welcome to Willowbrook Community!',
        content: 'Hi everyone! Welcome to our new community platform. This is a great place to connect with neighbors, share recommendations, and stay informed about what\'s happening in our neighborhood. Feel free to introduce yourself!',
        category: 'announcements',
        tags: ['welcome', 'introduction'],
        authorId: createdUsers[0]._id,
        neighborhoodId: neighborhood._id,
        isSticky: true
      },
      {
        title: 'Annual Block Party Planning',
        content: 'It\'s that time of year again! We\'re planning our annual block party for next month. We need volunteers for setup, food coordination, and entertainment. Who\'s interested in helping out?',
        category: 'events',
        tags: ['block-party', 'volunteers', 'community'],
        authorId: createdUsers[1]._id,
        neighborhoodId: neighborhood._id
      },
      {
        title: 'Lost Cat - Fluffy (Orange Tabby)',
        content: 'Our orange tabby cat Fluffy went missing yesterday evening around Oak Street. He\'s very friendly and responds to his name. Please let us know if you\'ve seen him! Reward offered.',
        category: 'lost-found',
        tags: ['lost-pet', 'cat', 'reward'],
        authorId: createdUsers[2]._id,
        neighborhoodId: neighborhood._id
      },
      {
        title: 'Recommendations for Local Plumber?',
        content: 'Hi neighbors! I need a reliable plumber for some work in my kitchen. Has anyone had good experiences with local plumbers they\'d recommend? Thanks in advance!',
        category: 'recommendations',
        tags: ['plumber', 'home-repair', 'recommendations'],
        authorId: createdUsers[3]._id,
        neighborhoodId: neighborhood._id
      }
    ];

    await ForumPost.insertMany(forumPosts);
    console.log('Created sample forum posts');

    // Create sample marketplace listings
    const marketplaceListings = [
      {
        title: 'Dining Room Table - Excellent Condition',
        description: 'Beautiful oak dining room table with 6 chairs. Perfect for family dinners! Moving and need to sell. Dimensions: 6ft x 3ft. No scratches or damage.',
        category: 'furniture',
        condition: 'like-new',
        price: 350,
        priceType: 'negotiable',
        tags: ['dining-table', 'oak', 'chairs'],
        sellerId: createdUsers[1]._id,
        neighborhoodId: neighborhood._id,
        location: {
          address: '456 Maple Avenue',
          coordinates: { lat: 40.7320, lng: -73.9830 }
        }
      },
      {
        title: 'Kids Bicycle - Age 5-8',
        description: 'Red and blue kids bicycle in great condition. My son outgrew it. Has training wheels (removable) and a bell. Perfect for learning to ride!',
        category: 'toys',
        condition: 'good',
        price: 75,
        priceType: 'fixed',
        tags: ['bicycle', 'kids', 'training-wheels'],
        sellerId: createdUsers[2]._id,
        neighborhoodId: neighborhood._id,
        location: {
          address: '789 Pine Road',
          coordinates: { lat: 40.7280, lng: -73.9870 }
        }
      },
      {
        title: 'Lawn Mowing Service',
        description: 'Professional lawn mowing and yard cleanup services. Been doing this for 5 years in the neighborhood. Reasonable rates and reliable service. Contact me for a quote!',
        category: 'services',
        condition: 'new',
        price: 40,
        priceType: 'fixed',
        tags: ['lawn-mowing', 'yard-work', 'landscaping'],
        sellerId: createdUsers[0]._id,
        neighborhoodId: neighborhood._id,
        location: {
          address: '123 Oak Street',
          coordinates: { lat: 40.7300, lng: -73.9850 }
        }
      }
    ];

    await MarketplaceListing.insertMany(marketplaceListings);
    console.log('Created sample marketplace listings');

    // Create sample safety reports
    const safetyReports = [
      {
        title: 'Streetlight Out on Oak Street',
        description: 'The streetlight at the corner of Oak Street and Maple Avenue has been out for 3 days. It\'s getting dark early and this area needs better lighting for safety.',
        type: 'other',
        severity: 'medium',
        location: {
          address: 'Oak Street & Maple Avenue',
          coordinates: { lat: 40.7305, lng: -73.9845 }
        },
        reporterId: createdUsers[3]._id,
        neighborhoodId: neighborhood._id,
        incidentDateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'active'
      },
      {
        title: 'Package Theft Reported',
        description: 'Someone reported seeing a person taking packages from porches on Pine Road yesterday afternoon around 3 PM. Please be extra cautious with deliveries.',
        type: 'crime',
        severity: 'high',
        location: {
          address: 'Pine Road (various addresses)',
          coordinates: { lat: 40.7285, lng: -73.9875 }
        },
        reporterId: createdUsers[0]._id,
        neighborhoodId: neighborhood._id,
        incidentDateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'investigating',
        isVerified: true,
        verifiedBy: createdUsers[0]._id
      }
    ];

    await SafetyReport.insertMany(safetyReports);
    console.log('Created sample safety reports');

    console.log('Seed data created successfully!');
    console.log('\nTest login credentials:');
    console.log('Admin: john.smith@example.com / password123');
    console.log('User: sarah.johnson@example.com / password123');
    console.log('User: mike.rodriguez@example.com / password123');
    console.log('Moderator: lisa.chen@example.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedData();
