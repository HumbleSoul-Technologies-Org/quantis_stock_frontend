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

    notifyCredentialsChange: (action: string) =>
      addNotification(
        'credentials_change',
        'Security Alert',
        `${action}. Your account security has been updated.`,
        'high'
      ),

    notifyAdminCredentialsUpdated: () =>
      addNotification(
        'admin_credentials_updated',
        'Admin Credentials Updated',
        'Administrator login credentials were successfully updated.',
        'high'
      ),

    notifyResourceCreated: (resource: string, name?: string) =>
      addNotification(
        'resource_created',
        `${resource} Created`,
        name
          ? `${resource} "${name}" has been successfully created.`
          : `${resource} has been successfully created.`,
        'medium'
      ),

    notifyResourceUpdated: (resource: string, name?: string) =>
      addNotification(
        'resource_updated',
        `${resource} Updated`,
        name
          ? `${resource} "${name}" has been successfully updated.`
          : `${resource} has been successfully updated.`,
        'medium'
      ),

    notifyResourceDeleted: (resource: string, name?: string) =>
      addNotification(
        'resource_deleted',
        `${resource} Deleted`,
        name
          ? `${resource} "${name}" has been successfully deleted.`
          : `${resource} has been successfully deleted.`,
        'medium'
      ),

    notifyUserProfileCreated: (username: string) =>
      addNotification(
        'user_profile_created',
        'User Profile Created',
        `User profile for ${username} has been successfully created.`,
        'medium'
      ),

    notifyUserProfileUpdated: (username: string) =>
      addNotification(
        'user_profile_updated',
        'User Profile Updated',
        `User profile for ${username} has been successfully updated.`,
        'medium'
      ),

    notifyUserProfileDeleted: (username: string) =>
      addNotification(
        'user_profile_deleted',
        'User Profile Deleted',
        `User profile for ${username} has been deleted.`,
        'medium'
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
