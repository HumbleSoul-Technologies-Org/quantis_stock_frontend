import { useAuth } from '@/context/AuthContext';
import { BusinessType, RetailSubType } from '@/lib/types';
import { getBusinessConfig, getRetailSubtypeConfig } from '@/lib/business-config';

export function useBusinessConfig() {
  const { user } = useAuth();
  
  const businessType = (user?.businessSetup?.businessType || 'retail') as BusinessType;
  const retailSubType = (user?.businessSetup?.retailSubType || 'general') as RetailSubType;
  const config = getRetailSubtypeConfig(retailSubType);
  
  return {
    businessType,
    retailSubType,
    config,
    currency: user?.businessSetup?.currency || 'KES',
    businessName: user?.businessSetup?.businessName || 'My Business',
    lowStockThreshold: user?.businessSetup?.lowStockThreshold || 20,
  };
}
