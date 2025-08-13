import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Scissors, Users, Sparkles, Palette, Heart, Clock } from 'lucide-react';

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const services = [
    {
      icon: Scissors,
      key: 'mens_cut',
      price: '250 DKK',
      duration: '45 min',
      image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Users,
      key: 'womens_cut',
      price: '350 DKK',
      duration: '60 min',
      image: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Sparkles,
      key: 'beard_trim',
      price: '150 DKK',
      duration: '30 min',
      image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Heart,
      key: 'styling',
      price: '200 DKK',
      duration: '30 min',
      image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Palette,
      key: 'coloring',
      price: '500 DKK',
      duration: '120 min',
      image: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Sparkles,
      key: 'treatment',
      price: '300 DKK',
      duration: '60 min',
      image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isRTL ? 'rtl' : ''}`}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.key}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={t(`services.${service.key}`)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg">
                    <service.icon className="h-6 w-6 text-blue-900" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(`services.${service.key}`)}
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{service.duration}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {service.price}
                  </div>
                </div>

                <Link
                  to="/booking"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300 text-center block"
                >
                  {t('booking.title')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/booking"
            className="bg-amber-400 hover:bg-amber-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Clock className="h-5 w-5" />
            <span>{t('hero.cta')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;