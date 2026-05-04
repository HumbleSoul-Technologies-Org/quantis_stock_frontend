// Simple in-memory storage for maintenance subscribers
// In production, this should be replaced with a proper database

class MaintenanceStorage {
  private subscribers = new Set<string>();

  addSubscriber(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.subscribers.has(normalizedEmail)) {
      return false; // Already subscribed
    }
    this.subscribers.add(normalizedEmail);
    return true;
  }

  getSubscribers(): string[] {
    return Array.from(this.subscribers);
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  isSubscribed(email: string): boolean {
    return this.subscribers.has(email.toLowerCase().trim());
  }

  clearSubscribers(): void {
    this.subscribers.clear();
  }
}

// Export singleton instance
export const maintenanceStorage = new MaintenanceStorage();