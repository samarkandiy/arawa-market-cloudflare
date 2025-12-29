export const formatPrice = (price: number): string => {
  // Convert to 万円 (man'en - 10,000 yen units) for Japanese system
  const manYen = price / 10000;
  
  // If it's a whole number, don't show decimals
  if (manYen % 1 === 0) {
    return `${manYen.toLocaleString('ja-JP')}万円`;
  }
  
  // Show up to 1 decimal place for precision
  return `${manYen.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
};

export const formatMileage = (mileage: number): string => {
  return `${mileage.toLocaleString('ja-JP')}km`;
};

export const formatYear = (year: number): string => {
  return `${year}年`;
};
