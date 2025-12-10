import React from "react";
import AssetListScreen from "../components/AssetListScreen";
import { useIndicatorStore } from "../store/indicatorStore";

const GLOBAL_CODES = ["USD", "EUR", "JPY", "GBP", "CAD"];

export default function GlobalCurrencies() {
  const globalCurrencies = useIndicatorStore((state) =>
    state.getGlobalCurrencies(GLOBAL_CODES)
  );

  return (
    <AssetListScreen
      data={globalCurrencies}
      emptyMessage="Nenhuma moeda global disponível."
      symbol="R$"
    />
  );
}
