import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Settings, BarChart, Clock, Star, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: string;
}

const Admin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Mock data for demonstration
  const [bookings] = React.useState<Booking[]>([
    {
      id: '1',
      service: 'mens_cut',
      date: '2025-01-15',
      time: '10:00',
      customerName: 'Lars Nielsen',
      customerEmail: 'lars@email.com',
      customerPhone: '+45 12 34 56 78',
      status: 'confirmed',
      price: '250 DKK'
    },
    {
      id: '2',
      service: 'womens_cut',
      date: '2025-01-15',
      time: '14:30',
      customerName: 'Anna Sørensen',
      customerEmail: 'anna@email.com',
      customerPhone: '+45 87 65 43 21',
      status: 'pending',
      price: '350 DKK'
    },
    {
      id: '3',
      service: 'beard_trim',
      date: '2025-01-16',
      time: '11:00',
      customerName: 'Ahmed Al-Rashid',
      customerEmail: 'ahmed@email.com',
      customerPhone: '+45 11 22 33 44',
      status: 'confirmed',
      price: '150 DKK'
    }
  ]);

  const [activeTab, setActiveTab] = React.useState('overview');

  const stats = [
    { icon: Calendar, label: 'Today\'s Bookings', value: '8', color: 'bg-blue-500' },
    { icon: Users, label: 'Total Customers', value: '247', color: 'bg-green-500' },
    { icon: DollarSign, label: 'Revenue (Month)', value: '15,420 DKK', color: 'bg-purple-500' },
    { icon: Star, label: 'Average Rating', value: '4.9', color: 'bg-yellow-500' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`mb-8 ${isRTL ? 'rtl' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-gray-600">Manage your barbershop operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart },
                { key: 'bookings', label: t('admin.bookings'), icon: Calendar },
                { key: 'services', label: t('admin.services'), icon: Settings },
                { key: 'settings', label: t('admin.settings'), icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                  <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                    Export Data
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.customerEmail}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.customerPhone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {t(`services.${booking.service}`)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(booking.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.time}</p>
                          <p className="text-sm text-gray-600">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">{t(`services.${booking.service}`)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Add New Booking</span>
                      </div>
                    </button>
                    <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Manage Services</span>
                      </div>
                    </button>
                    <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <BarChart className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">View Reports</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'services' || activeTab === 'settings') && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Settings className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
                <p className="text-gray-600">This feature is under development and will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;