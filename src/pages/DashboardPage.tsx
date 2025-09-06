import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Clock, MapPin, User, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('my-posts');

  const myPosts = [
    {
      id: 1,
      title: 'iPhone 14 Pro',
      category: 'Electronics',
      type: 'lost',
      location: 'Library - 2nd Floor',
      date: '2025-01-08',
      status: 'active',
      views: 127,
      claims: 3,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Blue Backpack',
      category: 'Accessories',
      type: 'found',
      location: 'Student Center',
      date: '2025-01-07',
      status: 'claimed',
      views: 89,
      claims: 1,
      image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const myClaims = [
    {
      id: 1,
      title: 'Wireless Earbuds',
      category: 'Electronics',
      type: 'found',
      location: 'Gym',
      claimDate: '2025-01-08',
      status: 'pending',
      owner: 'Mike D.',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const savedItems = [
    {
      id: 1,
      title: 'Red Notebook',
      category: 'Stationery',
      type: 'found',
      location: 'Chemistry Lab',
      date: '2025-01-06',
      image: 'https://images.pexels.com/photos/159711/books-book-pages-read-literature-159711.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'claimed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { key: 'my-posts', label: 'My Posts', count: myPosts.length },
    { key: 'my-claims', label: 'My Claims', count: myClaims.length },
    { key: 'saved', label: 'Saved Items', count: savedItems.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your posts, claims, and saved items</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <p className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <Link to="/post">Post New Item</Link>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">1</div>
              <div className="text-sm text-gray-600">Items Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-engineRed mb-1">216</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange mb-1">1</div>
              <div className="text-sm text-gray-600">Saved Items</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* My Posts Tab */}
            {activeTab === 'my-posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                    View all
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start space-x-4">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {post.type === 'lost' ? 'Lost' : 'Found'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                  {post.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{post.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{post.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>{post.views}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                <span>{post.claims}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-700 transition-colors duration-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Claims Tab */}
            {activeTab === 'my-claims' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">My Claims</h2>
                </div>

                <div className="space-y-4">
                  {myClaims.map((claim) => (
                    <div key={claim.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={claim.image}
                          alt={claim.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{claim.title}</h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  claim.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {claim.type === 'lost' ? 'Lost' : 'Found'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                  Claim {claim.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{claim.location}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>Posted by {claim.owner}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Claimed {claim.claimDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                              Contact Owner
                            </button>
                            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                              Cancel Claim
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Items</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {item.type === 'lost' ? 'Lost' : 'Found'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{item.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                              View Details
                            </button>
                            <button className="text-red-600 hover:text-red-700 transition-colors duration-200">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;