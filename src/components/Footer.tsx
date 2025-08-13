import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/barberpro', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/barberpro', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/barberpro', label: 'Twitter' }
  ];

  const quickLinks = [
    { key: 'home', path: '/' },
    { key: 'services', path: '/services' },
    { key: 'booking', path: '/booking' },
    { key: 'contact', path: '/contact' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="bg-amber-400 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-blue-900" />
              </div>
              <span className="text-2xl font-bold">BarberPro</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional hair and barber services with over 5 years of experience. 
              We provide premium grooming services in a modern, comfortable environment.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Østergade 25, 1100 København K, Denmark</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+45 12 34 56 78</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@barberpro.dk</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contact.hours')}</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Mon - Fri:</span>
                <span>9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>9:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Follow Us</h4>
              <div className="flex space-x-3 rtl:space-x-reverse">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} BarberPro. {t('footer.rights')}.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;