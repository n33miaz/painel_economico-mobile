import { isCurrencyData, isIndexData, Indicator } from "./api";

describe("API Utility Functions", () => {
  // Mock de dados para testes
  const mockCurrency: Indicator = {
    id: "currency_USD",
    type: "currency",
    code: "USD",
    name: "Dólar Americano",
    buy: 5.0,
    sell: 5.05,
    variation: 0.5,
  };

  const mockIndex: Indicator = {
    id: "index_IBOVESPA",
    type: "index",
    code: "",
    name: "IBOVESPA",
    buy: 0,
    sell: null,
    variation: 1.2,
    points: 120000,
  };

  it("should correctly identify currency data", () => {
    expect(isCurrencyData(mockCurrency)).toBe(true);
    expect(isCurrencyData(mockIndex)).toBe(false);
  });

  it("should correctly identify index data", () => {
    expect(isIndexData(mockIndex)).toBe(true);
    expect(isIndexData(mockCurrency)).toBe(false);
  });

  it("should handle edge cases for indicators", () => {
    const incompleteIndicator = { ...mockCurrency, type: "unknown" } as any;
    expect(isCurrencyData(incompleteIndicator)).toBe(false);
    expect(isIndexData(incompleteIndicator)).toBe(false);
  });
});