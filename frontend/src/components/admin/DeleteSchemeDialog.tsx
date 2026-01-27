import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Button from '@components/Button';

interface DeleteSchemeDialogProps {
  open: boolean;
  isLoading?: boolean;
  schemeName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

const DeleteSchemeDialog: React.FC<DeleteSchemeDialogProps> = ({
  open,
  isLoading = false,
  schemeName,
  onOpenChange,
  onConfirm,
}) => {
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
          {/* Icon */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle size={48} />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Delete Scheme?</h2>
              <p className="text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">"{schemeName}"</span>? This
                action cannot be undone.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Warning:</span> Deleting this scheme will
                remove all associated data and cannot be recovered.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Trash2 size={18} />
                    </motion.div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DeleteSchemeDialog;
