import { useAuth } from '@/context/AuthContext';
import { BusinessType, RetailSubType } from '@/lib/types';
import { getBusinessConfig, getRetailSubtypeConfig } from '@/lib/business-config';

export function useBusinessConfig() {
  const { user, business } = useAuth();
  
  // Use business context data, falling back to user.business for backward compatibility
  const businessData = business || user?.business;
  
  const businessType = (businessData?.businessType || 'retail') as BusinessType;
  const retailSubType = (businessData?.retailSubType || 'general') as RetailSubType;
  const config = getRetailSubtypeConfig(retailSubType);
  
  return {
    businessType,
    retailSubType,
    config,
    currency: businessData?.currency || 'KES',
    businessName: businessData?.businessName || 'My Business',
    lowStockThreshold: businessData?.lowStockThreshold || 20,
  };
}
