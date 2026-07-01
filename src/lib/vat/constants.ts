export const VAT_RATES = {
  STANDARD: 15,
  REDUCED_10: 10,
  REDUCED_7_5: 7.5,
  REDUCED_5: 5,
  REDUCED_4: 4,
  ZERO_RATED: 0,
  EXEMPT: 0,
} as const;

export const ALLOWED_VAT_RATES = [0, 4, 5, 7.5, 10, 15] as const;

/** NBR VAT filing due by 27th of the following month */
export function getVatDeadline(year: number, month: number): Date {
  const followingMonth = month === 12 ? 1 : month + 1;
  const followingYear = month === 12 ? year + 1 : year;
  return new Date(followingYear, followingMonth - 1, 27);
}

export function getPeriodBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function computeLineItem(
  quantity: number,
  unitPrice: number,
  vatRate: number
) {
  const subtotal = quantity * unitPrice;
  const vatAmount = Math.round((subtotal * vatRate) / 100 * 100) / 100;
  const lineTotal = Math.round((subtotal + vatAmount) * 100) / 100;
  return { subtotal, vatAmount, lineTotal };
}
