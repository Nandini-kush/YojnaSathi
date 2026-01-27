import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'error' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  dismissible = true,
}) => {
  const styles: Record<AlertType, string> = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  };

  const icons: Record<AlertType, React.ReactNode> = {
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className={`border-l-4 p-4 ${styles[type]} rounded`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3">{message}</div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-sm font-medium hover:opacity-75"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
