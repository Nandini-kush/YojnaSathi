import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@components/Button';
import { Input } from '@components/ui/input';
import { extractErrorMessage } from '@/lib/errorHandler';

interface SchemeDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: SchemeFormData) => Promise<void>;
  initialData?: SchemeFormData;
  title?: string;
}

export interface SchemeFormData {
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  status: "active" | "inactive" | "draft";
}

const SchemeDialog: React.FC<SchemeDialogProps> = ({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
  initialData,
  title = 'Add New Scheme',
}) => {
  const [formData, setFormData] = useState<SchemeFormData>(
    initialData || {
      name: '',
      category: '',
      benefit: '',
      eligibility: '',
      status: 'draft',
    }
  );

  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Scheme name is required');
      return;
    }

    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }

    if (!formData.benefit.trim()) {
      setError('Benefit is required');
      return;
    }

    if (!formData.eligibility.trim()) {
      setError('Eligibility is required');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Scheme Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Scheme Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter scheme name"
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Agriculture, Education"
                disabled={isLoading}
              />
            </div>

            {/* Benefit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Benefit *
              </label>
              <textarea
                name="benefit"
                value={formData.benefit}
                onChange={handleChange}
                placeholder="Enter scheme benefit details"
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Eligibility */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Eligibility *
              </label>
              <textarea
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="Enter eligibility criteria"
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Scheme'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default SchemeDialog;
