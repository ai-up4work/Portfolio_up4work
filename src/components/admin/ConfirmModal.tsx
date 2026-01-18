// src/components/admin/ConfirmModal.tsx
'use client';

import React from 'react';
import { AlertTriangle, Info, AlertCircle, HelpCircle, X } from 'lucide-react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'question';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'question',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle size={48} />,
          iconColor: '#ef4444',
          iconBg: 'rgba(239, 68, 68, 0.1)',
          confirmBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          confirmHoverBg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={48} />,
          iconColor: '#f59e0b',
          iconBg: 'rgba(245, 158, 11, 0.1)',
          confirmBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          confirmHoverBg: 'linear-gradient(135deg, #d97706, #b45309)',
        };
      case 'info':
        return {
          icon: <Info size={48} />,
          iconColor: '#06b6d4',
          iconBg: 'rgba(6, 182, 212, 0.1)',
          confirmBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          confirmHoverBg: 'linear-gradient(135deg, #0891b2, #0e7490)',
        };
      case 'question':
      default:
        return {
          icon: <HelpCircle size={48} />,
          iconColor: '#8b5cf6',
          iconBg: 'rgba(139, 92, 246, 0.1)',
          confirmBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          confirmHoverBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: '480px',
          background: 'var(--surface-background)',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
          animation: 'modalSlideIn 0.3s ease-out',
          border: '1px solid var(--neutral-alpha-weak)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 16px',
            borderBottom: '1px solid var(--neutral-alpha-weak)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: config.iconColor,
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--neutral-on-background-strong)',
                marginBottom: '8px',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--neutral-on-background-medium)',
                lineHeight: '1.5',
              }}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--neutral-on-background-weak)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--neutral-alpha-weak)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: 'var(--input-background)',
              color: 'var(--neutral-on-background-strong)',
              border: '1px solid var(--neutral-alpha-weak)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--neutral-alpha-weak)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--input-background)';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{
              padding: '12px 24px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: config.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = config.confirmHoverBg;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = config.confirmBg;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

// Hook for easier usage
export const useConfirm = () => {
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ConfirmType;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'question',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const confirm = (
    title: string,
    message: string,
    options?: {
      type?: ConfirmType;
      confirmText?: string;
      cancelText?: string;
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type: options?.type || 'question',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        onConfirm: () => resolve(true),
      });
    });
  };

  const handleCancel = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const ConfirmDialog = () => (
    <ConfirmModal
      {...confirmState}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialog };
};