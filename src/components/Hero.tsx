import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Star, Users, Clock } from 'lucide-react';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: Star, value: '4.9', label: 'Rating' },
    { icon: Clock, value: '5+', label: 'Years Experience' }
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Professional Barber Shop"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-blue-900/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`text-center lg:text-left ${isRTL ? 'lg:text-right' : ''}`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/booking"
                className="bg-amber-400 hover:bg-amber-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Calendar className="h-5 w-5" />
                <span>{t('hero.cta')}</span>
              </Link>
              <Link
                to="/services"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                {t('services.title')}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 rtl:space-x-reverse mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-amber-400 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Online Booking</h3>
                  <p className="text-blue-200">Book 24/7 with instant confirmation</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-amber-400 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Expert Stylists</h3>
                  <p className="text-blue-200">Professional certified barbers</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="bg-amber-400 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Premium Service</h3>
                  <p className="text-blue-200">Personalized experience for every client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;