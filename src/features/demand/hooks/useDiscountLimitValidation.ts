import { useMemo } from 'react';
import type { UserDiscountLimitDto, ApprovalStatus } from '../types/demand-types';

interface UseDiscountLimitValidationParams {
  groupCode?: string;
  discountRate1: number;
  discountRate2: number;
  discountRate3: number;
  userDiscountLimits: UserDiscountLimitDto[];
}

interface UseDiscountLimitValidationReturn {
  approvalStatus: ApprovalStatus;
  matchingLimit: UserDiscountLimitDto | undefined;
  exceedsLimit: boolean;
}

export function useDiscountLimitValidation({
  groupCode,
  discountRate1,
  discountRate2,
  discountRate3,
  userDiscountLimits,
}: UseDiscountLimitValidationParams): UseDiscountLimitValidationReturn {
  return useMemo(() => {
    if (!groupCode || userDiscountLimits.length === 0) {
      return {
        approvalStatus: 0 as ApprovalStatus,
        matchingLimit: undefined,
        exceedsLimit: false,
      };
    }

    const matchingLimit = userDiscountLimits.find(
      (limit) => limit.erpProductGroupCode === groupCode
    );

    if (!matchingLimit) {
      return {
        approvalStatus: 0 as ApprovalStatus,
        matchingLimit: undefined,
        exceedsLimit: false,
      };
    }

    const exceedsLimit1 = discountRate1 > matchingLimit.maxDiscount1;
    const exceedsLimit2 =
      matchingLimit.maxDiscount2 !== null &&
      matchingLimit.maxDiscount2 !== undefined
        ? discountRate2 > matchingLimit.maxDiscount2
        : false;
    const exceedsLimit3 =
      matchingLimit.maxDiscount3 !== null &&
      matchingLimit.maxDiscount3 !== undefined
        ? discountRate3 > matchingLimit.maxDiscount3
        : false;

    const exceedsLimit = exceedsLimit1 || exceedsLimit2 || exceedsLimit3;

    return {
      approvalStatus: exceedsLimit ? (1 as ApprovalStatus) : (0 as ApprovalStatus),
      matchingLimit,
      exceedsLimit,
    };
  }, [groupCode, discountRate1, discountRate2, discountRate3, userDiscountLimits]);
}
