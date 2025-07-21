import React, { useState } from 'react';
import { X, Tag, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CreatePostModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'events', label: 'Events' },
    { value: 'pets', label: 'Pets' },
    { value: 'recommendations', label: 'Recommendations' },
    { value: 'lost-found', label: 'Lost & Found' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'questions', label: 'Questions' },
    { value: 'services', label: 'Services' }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImages(prev => [...prev, {
            file,
            preview: e.target.result,
            caption: ''
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index, caption) => {
    setSelectedImages(prev => 
      prev.map((img, i) => i === index ? { ...img, caption } : img)
    );
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags(prev => [...prev, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        tags: tags,
        images: selectedImages.map(img => ({
          file: img.file,
          caption: img.caption
        }))
      };
      
      await onSubmit(formData);
      
      reset();
      setSelectedImages([]);
      setTags([]);
      setTagInput('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedImages([]);
    setTags([]);
    setTagInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="input"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 100, message: 'Title must be less than 100 characters' }
              })}
              type="text"
              className="input"
              placeholder="What's your post about?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              {...register('content', { 
                required: 'Content is required',
                minLength: { value: 10, message: 'Content must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Content must be less than 2000 characters' }
              })}
              rows={6}
              className="textarea"
              placeholder="Share your thoughts with your neighbors..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="input pl-10"
                  placeholder="Add tags (press Enter to add)"
                  maxLength="20"
                />
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                Press Enter to add tags. Maximum 5 tags allowed.
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            <div className="space-y-4">
              {/* Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</span>
                </label>
              </div>

              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={image.caption}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        className="mt-2 input text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
