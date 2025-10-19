import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from './ui/toastContext';
import { updateMeal } from '../store/mealsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Environment-based URL resolution for image assets
 */
const getImageBaseUrl = () => {
  return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';
};
const IMAGE_BASE_URL = getImageBaseUrl();


export const EditMealModal = ({ isOpen, meal, onClose }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { loading: globalLoading } = useSelector(state => state.meals);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    prep_time: '',
    category: 'main_course',
    is_veg: false,
    is_available: true,
    image_file: null, // Holds the new file object
    current_image_url: '', // Holds the existing image URL
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when modal opens or meal prop changes
  useEffect(() => {
    if (meal) {
      setFormData({
        name: meal.name || '',
        description: meal.description || '',
        price: meal.price || '',
        prep_time: meal.prep_time || '',
        category: meal.category || 'main_course',
        is_veg: meal.is_veg || false,
        is_available: meal.is_available || true,
        image_file: null,
        current_image_url: meal.image ? `${IMAGE_BASE_URL}${meal.image}` : null,
      });
      setErrors({});
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    // Simple client-side validation
    if (!formData.name || !formData.price || !formData.prep_time) {
        setErrors({ name: ['Name is required.'], price: ['Price is required.'], prep_time: ['Preparation time is required.'] });
        addToast('Please fill in required fields.', 'error');
        setIsSubmitting(false);
        return;
    }

    const updatePayload = new window.FormData();
    
    // Append only fields that have changed (or are required)
    // For simplicity here, we append everything non-file related.
    updatePayload.append('name', formData.name);
    updatePayload.append('description', formData.description);
    updatePayload.append('price', formData.price);
    updatePayload.append('prep_time', formData.prep_time);
    updatePayload.append('category', formData.category);
    updatePayload.append('is_veg', formData.is_veg);
    updatePayload.append('is_available', formData.is_available);
    
    // Only append the new file if one was selected
    if (formData.image_file) {
      updatePayload.append('image', formData.image_file);
    }

    try {
      await dispatch(updateMeal({ mealId: meal.id, formData: updatePayload })).unwrap();
      addToast(`Meal "${formData.name}" updated successfully!`, 'success');
      onClose();
    } catch (error) {
      console.error('Meal update failed:', error);
      // Display validation errors properly
      if (error && typeof error === 'object' && Object.keys(error).length > 0) {
        setErrors(error); // Set field-specific errors
        const errorMessages = Object.entries(error)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        addToast(`Failed to update meal: ${errorMessages}`, 'error');
      } else {
        addToast(`Failed to update meal.`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Meal: {meal.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Image Preview */}
          {(formData.current_image_url || formData.image_file) && (
            <div className="mb-4">
              <img 
                src={formData.image_file ? URL.createObjectURL(formData.image_file) : formData.current_image_url} 
                alt="Current Meal" 
                className="w-full h-40 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.join(', ')}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.join(', ')}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.join(', ')}</p>}
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Prep Time (min)</label>
              <input
                type="number"
                name="prep_time"
                value={formData.prep_time}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.prep_time && <p className="text-red-500 text-xs mt-1">{errors.prep_time.join(', ')}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="main_course">Main Course</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks</option>
              <option value="appetizers">Appetizers</option>
              <option value="sides">Sides</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">New Image (optional)</label>
            <input
              type="file"
              name="image_file"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.join(', ')}</p>}
          </div>
          
          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="is_veg"
                checked={formData.is_veg}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              Vegetarian
            </label>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              Available
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};