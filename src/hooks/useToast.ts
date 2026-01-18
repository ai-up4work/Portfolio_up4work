// src/hooks/useToast.ts
'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);

  return {
    toasts,
    removeToast,
    toast: {
      success,
      error,
      info,
      warning,
    },
  };
};

// Example integration in your AdminCMS component:
/*

REPLACE ALL alert() and confirm() calls like this:

// Old code:
alert('Image uploaded successfully!');
if (!confirm('Are you sure you want to delete this item?')) return;

// New code:
toast.success('Image uploaded successfully!');

const confirmed = await confirm(
  'Delete Item',
  'Are you sure you want to delete this item? This action cannot be undone.',
  { type: 'danger', confirmText: 'Delete', cancelText: 'Cancel' }
);
if (!confirmed) return;

*/