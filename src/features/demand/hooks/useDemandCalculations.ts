import type { DemandLineFormState } from '../types/demand-types';

interface CalculationTotals {
  subtotal: number;
  totalVat: number;
  grandTotal: number;
}

interface UseDemandCalculationsReturn {
  calculateLineTotals: (line: DemandLineFormState) => DemandLineFormState;
  calculateTotals: (lines: DemandLineFormState[]) => CalculationTotals;
}

export function useDemandCalculations(): UseDemandCalculationsReturn {
  const calculateLineTotals = (line: DemandLineFormState): DemandLineFormState => {
    const baseAmount = line.quantity * line.unitPrice;
    
    let currentAmount = baseAmount;
    
    const discount1Amount = currentAmount * (line.discountRate1 / 100);
    currentAmount = currentAmount - discount1Amount;
    
    const discount2Amount = currentAmount * (line.discountRate2 / 100);
    currentAmount = currentAmount - discount2Amount;
    
    const discount3Amount = currentAmount * (line.discountRate3 / 100);
    currentAmount = currentAmount - discount3Amount;
    
    const subtotal = Math.max(0, currentAmount);
    const vatAmount = subtotal * (line.vatRate / 100);
    const grandTotal = subtotal + vatAmount;

    return {
      ...line,
      discountAmount1: Math.max(0, discount1Amount),
      discountAmount2: Math.max(0, discount2Amount),
      discountAmount3: Math.max(0, discount3Amount),
      lineTotal: subtotal,
      vatAmount: Math.max(0, vatAmount),
      lineGrandTotal: Math.max(0, grandTotal),
    };
  };

  const calculateTotals = (lines: DemandLineFormState[]): CalculationTotals => {
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const totalVat = lines.reduce((sum, line) => sum + line.vatAmount, 0);
    const grandTotal = lines.reduce((sum, line) => sum + line.lineGrandTotal, 0);

    return {
      subtotal,
      totalVat,
      grandTotal,
    };
  };

  return {
    calculateLineTotals,
    calculateTotals,
  };
}
