export function formatPrice(price?: number | null, currency: string = '₼'): string {
  if (price === undefined || price === null) return '';
  return `${price.toFixed(2)} ${currency}`;
}

