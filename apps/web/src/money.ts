export const formatEUR = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);