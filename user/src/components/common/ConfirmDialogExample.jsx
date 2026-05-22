import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

/**
 * Example component showing how to use the confirmation dialog
 * 
 * Usage in your component:
 * 
 * const dialog = useConfirmDialog();
 * 
 * const handleDeleteClick = () => {
 *   dialog.openDialog({
 *     title: 'Delete Booking?',
 *     message: 'This action cannot be undone.',
 *     type: 'danger',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *     isDangerous: true,
 *     onConfirm: () => {
 *       // Perform delete action
 *     },
 *   });
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDeleteClick}>Delete</button>
 *     <ConfirmDialog {...dialog} />
 *   </>
 * );
 */

export default function ConfirmDialogExample() {
  const dialog = useConfirmDialog();

  const examples = [
    {
      name: 'Info Dialog',
      action: () => {
        dialog.openDialog({
          title: 'Information',
          message: 'This is an informational message. Click confirm to acknowledge.',
          type: 'info',
          confirmText: 'Got it',
          cancelText: 'Close',
        });
      },
    },
    {
      name: 'Warning Dialog',
      action: () => {
        dialog.openDialog({
          title: 'Are you sure?',
          message: 'This action requires your confirmation.',
          type: 'warning',
          confirmText: 'Proceed',
          cancelText: 'Cancel',
        });
      },
    },
    {
      name: 'Danger Dialog',
      action: () => {
        dialog.openDialog({
          title: 'Confirm Deletion',
          message: 'This booking will be permanently deleted. This action cannot be undone.',
          type: 'danger',
          confirmText: 'Delete Anyway',
          cancelText: 'Keep It',
          isDangerous: true,
          onConfirm: () => {
            console.log('Item deleted');
          },
        });
      },
    },
    {
      name: 'Success Dialog',
      action: () => {
        dialog.openDialog({
          title: 'Success!',
          message: 'Your booking has been confirmed successfully.',
          type: 'success',
          confirmText: 'Continue',
          cancelText: 'Go Back',
        });
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Confirmation Dialog Examples</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {examples.map((ex) => (
          <button
            key={ex.name}
            onClick={ex.action}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #2196f3',
              background: 'white',
              color: '#2196f3',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {ex.name}
          </button>
        ))}
      </div>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        isDangerous={dialog.isDangerous}
        onConfirm={dialog.handleConfirm}
        onCancel={dialog.handleCancel}
      />
    </div>
  );
}
