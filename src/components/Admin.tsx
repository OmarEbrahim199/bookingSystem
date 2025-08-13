import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Settings, BarChart, Clock, Star, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { getBookings, updateBookingStatus, Booking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AdminLogin from './AdminLogin';
import BarberManagement from './BarberManagement';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, adminUser, loading } = useAuth();
  const isRTL = i18n.language === 'ar';
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user && adminUser) {
      loadBookings();
    }
  }, [user, adminUser]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated');
      await loadBookings();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !adminUser) {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  const stats = [
    { 
      icon: Calendar, 
      label: 'Today\'s Bookings', 
      value: bookings.filter(b => b.appointment_date === format(new Date(), 'yyyy-MM-dd')).length.toString(), 
      color: 'bg-blue-500' 
    },
    { 
      icon: Users, 
      label: 'Pending Bookings', 
      value: bookings.filter(b => b.status === 'pending').length.toString(), 
      color: 'bg-yellow-500' 
    },
    { 
      icon: DollarSign, 
      label: 'Total Bookings', 
      value: bookings.length.toString(), 
      color: 'bg-purple-500' 
    },
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
                { key: 'barbers', label: 'Barbers', icon: Users },
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
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                  <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                    Export Data
                  </button>
                </div>

                {/* Pending Bookings Alert */}
                {bookings.filter(b => b.status === 'pending').length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-medium">
                      ⚠️ You have {bookings.filter(b => b.status === 'pending').length} pending booking(s) that need confirmation
                    </p>
                  </div>
                )}

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
                                {booking.customer_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.customer_email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.customer_phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service?.[`name_${i18n.language}` as keyof typeof booking.service] as string}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(booking.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.appointment_time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.service?.price} DKK
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {booking.status === 'pending' && (
                                <button 
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Confirm
                                </button>
                              )}
                              {booking.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Complete
                                </button>
                              )}
                              <button 
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
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
            )}

            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{booking.appointment_time}</p>
                          <p className="text-sm text-gray-600">{booking.customer_name}</p>
                          <p className="text-xs text-gray-500">{booking.service?.[`name_${i18n.language}` as keyof typeof booking.service] as string}</p>
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

            {activeTab === 'barbers' && (
              <BarberManagement />
            )}

            {activeTab === 'settings' && (
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