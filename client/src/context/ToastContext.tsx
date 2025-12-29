import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastType } from '../components/Toast';
import ToastContainer from '../components/ToastContainer';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={{
      showToast: toast.showToast,
      success: toast.success,
      error: toast.error,
      info: toast.info
    }}>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};
