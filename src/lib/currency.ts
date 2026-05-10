export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD";

export const CURRENCY_LIST = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
] as const;

export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();
    return {
      USD: data.rates.USD || 1,
      EUR: data.rates.EUR || 0.93,
      GBP: data.rates.GBP || 0.79,
      CAD: data.rates.CAD || 1.37,
    };
  } catch (err) {
    console.error("Error fetching exchange rates, using fallback:", err);
    return {
      USD: 1,
      EUR: 0.93,
      GBP: 0.79,
      CAD: 1.37,
    };
  }
}
