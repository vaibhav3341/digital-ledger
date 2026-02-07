export function formatAmount(amount: number) {
  const fixed = amount.toFixed(2);
  return `₹${fixed}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString();
}
