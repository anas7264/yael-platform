export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
