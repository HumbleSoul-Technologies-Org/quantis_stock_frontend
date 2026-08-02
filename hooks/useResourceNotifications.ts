import { toast } from "sonner";

type ResourceType =
  | "Product"
  | "Stock"
  | "Inventory"
  | "Sale"
  | "User"
  | "Supplier";
type ActionType = "created" | "updated" | "deleted";

interface ResourceNotificationConfig {
  resourceType: ResourceType;
  action: ActionType;
  resourceName?: string;
  error?: string;
}

export function useResourceNotifications() {
  const notifySuccess = ({
    resourceType,
    action,
    resourceName,
  }: ResourceNotificationConfig) => {
    const messages: Record<ActionType, string> = {
      created: `${resourceType} created successfully`,
      updated: `${resourceType} updated successfully`,
      deleted: `${resourceType} deleted successfully`,
    };

    const message = messages[action];
    const description = resourceName
      ? `${resourceType} "${resourceName}" has been ${action}`
      : `${resourceType} has been ${action}`;

    toast.success(message, {
      description,
      duration: 3000,
    });
  };

  const notifyError = ({
    resourceType,
    action,
    resourceName,
    error,
  }: ResourceNotificationConfig) => {
    const messages: Record<ActionType, string> = {
      created: `Failed to create ${resourceType.toLowerCase()}`,
      updated: `Failed to update ${resourceType.toLowerCase()}`,
      deleted: `Failed to delete ${resourceType.toLowerCase()}`,
    };

    const message = messages[action];
    const description = error
      ? `${message}: ${error}`
      : resourceName
        ? `Unable to ${action} "${resourceName}". Please try again.`
        : `Unable to ${action} ${resourceType.toLowerCase()}. Please try again.`;

    toast.error(message, {
      description,
      duration: 4000,
    });
  };

  const notifyLoading = ({
    resourceType,
    action,
  }: ResourceNotificationConfig) => {
    const messages: Record<ActionType, string> = {
      created: `Creating ${resourceType.toLowerCase()}...`,
      updated: `Updating ${resourceType.toLowerCase()}...`,
      deleted: `Deleting ${resourceType.toLowerCase()}...`,
    };

    return toast.loading(messages[action], {
      duration: Infinity,
    });
  };

  const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  const updateToast = (
    toastId: string | number,
    config: ResourceNotificationConfig,
    isSuccess: boolean,
  ) => {
    if (isSuccess) {
      toast.success(`${config.resourceType} ${config.action} successfully`, {
        id: toastId,
        description: config.resourceName
          ? `${config.resourceType} "${config.resourceName}" has been ${config.action}`
          : `${config.resourceType} has been ${config.action}`,
        duration: 3000,
      });
    } else {
      toast.error(
        `Failed to ${config.action} ${config.resourceType.toLowerCase()}`,
        {
          id: toastId,
          description: config.error || "Please try again.",
          duration: 4000,
        },
      );
    }
  };

  // Quick methods for common operations
  const productCreated = (productName: string) =>
    notifySuccess({
      resourceType: "Product",
      action: "created",
      resourceName: productName,
    });

  const productUpdated = (productName: string) =>
    notifySuccess({
      resourceType: "Product",
      action: "updated",
      resourceName: productName,
    });

  const productDeleted = (productName: string) =>
    notifySuccess({
      resourceType: "Product",
      action: "deleted",
      resourceName: productName,
    });

  const productError = (action: ActionType, error?: string) =>
    notifyError({
      resourceType: "Product",
      action,
      error,
    });

  // Stock movement operations
  const stockMovementCreated = (type: string, productName: string) =>
    toast.success(`Stock movement recorded`, {
      description: `${type} movement for "${productName}" has been recorded`,
      duration: 3000,
    });

  const stockMovementUpdated = (productName: string) =>
    notifySuccess({
      resourceType: "Stock",
      action: "updated",
      resourceName: productName,
    });

  const stockMovementDeleted = (productName: string) =>
    notifySuccess({
      resourceType: "Stock",
      action: "deleted",
      resourceName: productName,
    });

  const stockError = (action: ActionType, error?: string) =>
    notifyError({
      resourceType: "Stock",
      action,
      error,
    });

  // Sales operations
  const saleCreated = (saleNumber: string, amount: string) =>
    toast.success(`Sale completed`, {
      description: `Sale ${saleNumber} recorded for ${amount}`,
      duration: 3000,
    });

  const saleUpdated = (saleNumber: string) =>
    notifySuccess({
      resourceType: "Sale",
      action: "updated",
      resourceName: saleNumber,
    });

  const saleDeleted = (saleNumber: string) =>
    notifySuccess({
      resourceType: "Sale",
      action: "deleted",
      resourceName: saleNumber,
    });

  const saleError = (action: ActionType, error?: string) =>
    notifyError({
      resourceType: "Sale",
      action,
      error,
    });

  // User operations
  const userCreated = (username: string) =>
    toast.success("User created successfully", {
      description: `User "${username}" has been created and can now log in.`,
      duration: 3000,
    });

  const userUpdated = (username: string) =>
    notifySuccess({
      resourceType: "User",
      action: "updated",
      resourceName: username,
    });

  const userDeleted = (username: string) =>
    notifySuccess({
      resourceType: "User",
      action: "deleted",
      resourceName: username,
    });

  const userBanned = (username: string) =>
    toast.success("User banned", {
      description: `${username} has been banned and cannot log in.`,
      duration: 3000,
    });

  const userUnbanned = (username: string) =>
    toast.success("User unbanned", {
      description: `${username} has been unbanned and can log in again.`,
      duration: 3000,
    });

  const userError = (
    action: "created" | "updated" | "deleted" | "banned" | "unbanned",
    error?: string,
  ) => {
    const actionMessages = {
      created: "Failed to create user",
      updated: "Failed to update user",
      deleted: "Failed to delete user",
      banned: "Failed to ban user",
      unbanned: "Failed to unban user",
    };

    toast.error(actionMessages[action], {
      description: error || "Please try again.",
      duration: 4000,
    });
  };

  return {
    // Generic methods
    notifySuccess,
    notifyError,
    notifyLoading,
    dismissToast,
    updateToast,

    // Product methods
    productCreated,
    productUpdated,
    productDeleted,
    productError,

    // Stock movement methods
    stockMovementCreated,
    stockMovementUpdated,
    stockMovementDeleted,
    stockError,
    inventoryMovementCreated: stockMovementCreated,
    inventoryMovementUpdated: stockMovementUpdated,
    inventoryMovementDeleted: stockMovementDeleted,
    inventoryError: stockError,

    // Sales methods
    saleCreated,
    saleUpdated,
    saleDeleted,
    saleError,

    // User methods
    userCreated,
    userUpdated,
    userDeleted,
    userBanned,
    userUnbanned,
    userError,
  };
}
