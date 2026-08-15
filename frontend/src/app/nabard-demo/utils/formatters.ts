export function formatCurrency(value: number, unit?: string): string {
  if (value === undefined || value === null) return '-';
  
  // Format as a simple decimal with 1 or 2 places
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(value);

  // If the backend specified a unit like INR_CRORE or INR_LAKH
  if (unit === 'INR_CRORE') return `₹${formatted} Cr`;
  if (unit === 'INR_LAKH') return `₹${formatted} L`;
  if (unit === 'INR') return `₹${formatted}`;
  
  // Try to infer based on magnitude if no unit provided
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  
  return `₹${formatted}`;
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null) return '-';
  return `${value}%`;
}

export function formatTrend(value: number, unit?: string): string {
  if (value === undefined || value === null) return '-';
  
  let formatted = '';
  
  // Format based on unit
  if (unit === 'INR_CRORE') {
    formatted = `₹${Math.abs(value).toFixed(2)} Cr`;
  } else if (unit === 'INR_LAKH') {
    formatted = `₹${Math.abs(value).toFixed(2)} L`;
  } else if (unit === 'PERCENT') {
    formatted = `${Math.abs(value)}%`;
  } else {
    formatted = `${Math.abs(value)}`;
  }
  
  // Add directional prefix
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
