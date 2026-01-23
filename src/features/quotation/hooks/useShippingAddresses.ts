import { useShippingAddressesByCustomer } from '@/features/shipping-address-management/hooks/useShippingAddressesByCustomer';
import type { ShippingAddress } from '../types/quotation-types';

interface UseShippingAddressesReturn {
  data: ShippingAddress[];
  isLoading: boolean;
}

export const useShippingAddresses = (customerId?: number): UseShippingAddressesReturn => {
  const { data, isLoading } = useShippingAddressesByCustomer(customerId || 0);
  return {
    data:
      data?.map((address) => ({
        id: address.id,
        addressText: address.address,
        customerId: address.customerId,
      })) || [],
    isLoading,
  };
};
