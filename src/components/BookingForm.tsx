import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { da, enUS, ar } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Check } from 'lucide-react';
import { createBooking, getServices, getBarbers, Service, Barber } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BookingFormData {
  service: string;
  barber: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

const BookingForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = React.useState<Service[]>([]);
  const [barbers, setBarbers] = React.useState<Barber[]>([]);
  const [selectedService, setSelectedService] = React.useState('');
  const [selectedBarber, setSelectedBarber] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');
  const [step, setStep] = React.useState(1);

  const isRTL = i18n.language === 'ar';
  
  const dateLocale = i18n.language === 'da' ? da : i18n.language === 'ar' ? ar : enUS;

  const schema = yup.object({
    service: yup.string().required('Service is required'),
    barber: yup.string().required('Barber is required'),
    date: yup.string().required('Date is required'),
    time: yup.string().required('Time is required'),
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone is required'),
    notes: yup.string()
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookingFormData>({
    resolver: yupResolver(schema)
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, barbersData] = await Promise.all([
          getServices(),
          getBarbers()
        ]);
        setServices(servicesData);
        setBarbers(barbersData);
      } catch (error) {
        toast.error('Failed to load booking data');
      }
    };

    loadData();
  }, []);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = addDays(new Date(), i);
      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleServiceSelect = (serviceKey: string) => {
    setSelectedService(serviceKey);
    setValue('service', serviceKey);
    setStep(2);
  };

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    setValue('barber', barberId);
    setStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('date', date);
    setStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setValue('time', time);
    setStep(5);
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      await createBooking({
        service_id: data.service,
        barber_id: data.barber,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        appointment_date: data.date,
        appointment_time: data.time,
        notes: data.notes,
        status: 'pending'
      });
      
      toast.success(t('booking.success'), {
        duration: 4000,
        position: 'top-center'
      });
      
      // Reset form
      setStep(1);
      setSelectedService('');
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedBarberData = barbers.find(b => b.id === selectedBarber);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${isRTL ? 'rtl' : ''}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('booking.title')}
          </h1>
          
          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse mt-8">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  step >= stepNum 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 5 && (
                  <div className={`h-1 w-12 transition-all ${
                    step > stepNum ? 'bg-blue-900' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <Calendar className="h-6 w-6 text-blue-900" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('booking.select_service')}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {service[`name_${i18n.language}` as keyof Service] as string}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {service.duration_minutes} min
                      </span>
                      <span className="font-bold text-blue-900">
                        {service.price} DKK
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Barber Selection */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Calendar className="h-6 w-6 text-blue-900" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('booking.select_barber')}
                  </h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-900 hover:text-blue-700"
                >
                  ← Back
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-medium">
                  Selected: {selectedServiceData?.[`name_${i18n.language}` as keyof Service] as string} - {selectedServiceData?.price} DKK
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => handleBarberSelect(barber.id)}
                    className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      {barber.image_url ? (
                        <img
                          src={barber.image_url}
                          alt={barber.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{barber.name}</h3>
                        <p className="text-sm text-gray-600">{barber.specialties.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date Selection */}
          {step === 3 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Calendar className="h-6 w-6 text-blue-900" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('booking.select_date')}
                  </h2>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-900 hover:text-blue-700"
                >
                  ← Back
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-medium">{selectedBarberData?.name}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableDates.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(dateStr)}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-all duration-300 text-center"
                    >
                      <div className="text-sm text-gray-600">
                        {format(date, 'EEE', { locale: dateLocale })}
                      </div>
                      <div className="font-semibold text-lg">
                        {format(date, 'dd', { locale: dateLocale })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(date, 'MMM', { locale: dateLocale })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Time Selection */}
          {step === 4 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Clock className="h-6 w-6 text-blue-900" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('booking.select_time')}
                  </h2>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-blue-900 hover:text-blue-700"
                >
                  ← Back
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-900 font-medium">
                  {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy', { locale: dateLocale })}
                </p>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className="p-3 border-2 border-gray-200 rounded-xl hover:border-blue-900 hover:bg-blue-50 transition-all duration-300 text-center font-medium"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Personal Information */}
          {step === 5 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <User className="h-6 w-6 text-blue-900" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('booking.personal_info')}
                  </h2>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="text-blue-900 hover:text-blue-700"
                >
                  ← Back
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Booking Summary:</h3>
                <div className="text-sm text-blue-800">
                  <p>{selectedServiceData?.[`name_${i18n.language}` as keyof Service] as string} - {selectedServiceData?.price} DKK</p>
                  <p>Barber: {selectedBarberData?.name}</p>
                  <p>{format(new Date(selectedDate), 'EEEE, MMMM do, yyyy', { locale: dateLocale })} at {selectedTime}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      {t('booking.name')}
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                      placeholder={t('booking.name')}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      {t('booking.email')}
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                      placeholder={t('booking.email')}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      {t('booking.phone')}
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                      placeholder={t('booking.phone')}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-2" />
                      {t('booking.notes')}
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                      placeholder={t('booking.notes')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {t('booking.book_appointment')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;