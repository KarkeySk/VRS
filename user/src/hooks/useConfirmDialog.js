import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
    onConfirm: null,
    onCancel: null,
  });

  const openDialog = useCallback((config) => {
    setDialogState((prev) => ({
      ...prev,
      ...config,
      isOpen: true,
      onConfirm: config.onConfirm || (() => {}),
      onCancel: config.onCancel || (() => {}),
    }));
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  return {
    ...dialogState,
    openDialog,
    closeDialog,
    handleConfirm,
    handleCancel,
  };
}
