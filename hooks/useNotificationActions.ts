import { useNotifications } from '@/context/NotificationContext';
import { NotificationType, NotificationPriority } from '@/lib/types';

export function useNotificationActions() {
  const { addNotification } = useNotifications();

  return {
    notifyLowStock: (productName: string) =>
      addNotification(
        'low_stock',
        'Low Stock Alert',
        `${productName} is running low. Consider reordering soon.`,
        'high'
      ),

    notifyStockOut: (productName: string) =>
      addNotification(
        'stock_out',
        'Out of Stock',
        `${productName} is completely out of stock.`,
        'high'
      ),

    notifyNewSale: (saleNumber: string, amount: string) =>
      addNotification(
        'new_sale',
        'Sale Completed',
        `Sale ${saleNumber} completed for ${amount}`,
        'medium'
      ),

    notifyNewProduct: (productName: string) =>
      addNotification(
        'new_product',
        'New Product Added',
        `${productName} has been added to inventory.`,
        'low'
      ),

    notifyDataSync: (message: string = 'Data synchronized successfully') =>
      addNotification(
        'data_sync',
        'Data Sync',
        message,
        'low'
      ),

    notifyNoInternet: () =>
      addNotification(
        'no_internet',
        'No Internet Connection',
        'You are offline. Some features may be limited.',
        'high'
      ),

    notifyCredentialsChange: (action: string) =>
      addNotification(
        'credentials_change',
        'Security Alert',
        `${action}. Your account security has been updated.`,
        'high'
      ),

    notifySuccess: (title: string, message: string) =>
      addNotification('success', title, message, 'medium'),

    notifyError: (title: string, message: string) =>
      addNotification('error', title, message, 'high'),

    notifyWarning: (title: string, message: string) =>
      addNotification('warning', title, message, 'medium'),

    notifyInfo: (title: string, message: string) =>
      addNotification('info', title, message, 'low'),
  };
}
