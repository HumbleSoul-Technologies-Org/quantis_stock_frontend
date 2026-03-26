import { useAuth } from '@/context/AuthContext';
import { BusinessType } from '@/lib/types';
import { getBusinessConfig } from '@/lib/business-config';

export function useBusinessConfig() {
  const { user } = useAuth();
  
  const businessType = (user?.businessSetup?.businessType || 'retail') as BusinessType;
  const config = getBusinessConfig(businessType);
  
  return {
    businessType,
    config,
    currency: user?.businessSetup?.currency || 'KES',
    businessName: user?.businessSetup?.businessName || 'My Business',
    lowStockThreshold: user?.businessSetup?.lowStockThreshold || 20,
  };
}
