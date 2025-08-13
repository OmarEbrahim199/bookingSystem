import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit, Trash2, Upload, X, User, Mail, Phone, FileText } from 'lucide-react';
import { Barber, getBarbers, createBarber, updateBarber, deleteBarber, uploadBarberImage } from '../lib/supabase';
import toast from 'react-hot-toast';

interface BarberFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string;
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  bio: yup.string().required('Bio is required'),
  specialties: yup.string().required('Specialties are required'),
});

const BarberManagement: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BarberFormData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const data = await getBarbers();
      setBarbers(data);
    } catch (error) {
      toast.error('Failed to load barbers');
    }
  };

  const handleOpenModal = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber);
      setValue('name', barber.name);
      setValue('email', barber.email || '');
      setValue('phone', barber.phone || '');
      setValue('bio', barber.bio || '');
      setValue('specialties', barber.specialties.join(', '));
    } else {
      setEditingBarber(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBarber(null);
    reset();
  };

  const onSubmit = async (data: BarberFormData) => {
    setIsLoading(true);
    try {
      const barberData = {
        ...data,
        specialties: data.specialties.split(',').map(s => s.trim()),
        is_active: true,
      };

      if (editingBarber) {
        await updateBarber(editingBarber.id, barberData);
        toast.success('Barber updated successfully');
      } else {
        await createBarber(barberData);
        toast.success('Barber created successfully');
      }

      await loadBarbers();
      handleCloseModal();
    } catch (error) {
      toast.error(editingBarber ? 'Failed to update barber' : 'Failed to create barber');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this barber?')) return;

    try {
      await deleteBarber(id);
      toast.success('Barber deleted successfully');
      await loadBarbers();
    } catch (error) {
      toast.error('Failed to delete barber');
    }
  };

  const handleImageUpload = async (file: File, barberId: string) => {
    setUploadingImage(barberId);
    try {
      const imageUrl = await uploadBarberImage(file, barberId);
      await updateBarber(barberId, { image_url: imageUrl });
      toast.success('Image uploaded successfully');
      await loadBarbers();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Barber Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Barber</span>
        </button>
      </div>

      {/* Barbers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative">
              {barber.image_url ? (
                <img
                  src={barber.image_url}
                  alt={barber.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Image Upload */}
              <div className="absolute top-2 right-2">
                <label className="bg-white/90 backdrop-blur-sm p-2 rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, barber.id);
                    }}
                    disabled={uploadingImage === barber.id}
                  />
                </label>
              </div>

              {uploadingImage === barber.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{barber.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{barber.bio}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {barber.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{barber.email}</span>
                  </div>
                )}
                {barber.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{barber.phone}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(barber)}
                  className="flex-1 bg-blue-900 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteBarber(barber.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingBarber ? 'Edit Barber' : 'Add New Barber'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Barber name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="barber@barberpro.dk"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="+45 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Brief description about the barber..."
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties
                  </label>
                  <input
                    type="text"
                    {...register('specialties')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    placeholder="Men's Cut, Beard Trim, Styling (comma separated)"
                  />
                  {errors.specialties && (
                    <p className="text-red-500 text-sm mt-1">{errors.specialties.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 disabled:bg-blue-700 transition-colors"
                  >
                    {isLoading ? 'Saving...' : editingBarber ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberManagement;