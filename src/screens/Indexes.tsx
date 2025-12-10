import React from "react";
import AssetListScreen from "../components/AssetListScreen";
import { useIndicatorStore } from "../store/indicatorStore";

const DESIRED_INDEXES = ["IBOVESPA", "CDI", "SELIC"];

export default function Indexes() {
  const indexes = useIndicatorStore((state) => state.getIndexes());

  const filteredIndexes = indexes.filter((i) =>
    DESIRED_INDEXES.includes(i.name)
  );

  return (
    <AssetListScreen
      data={filteredIndexes}
      emptyMessage="Nenhum índice encontrado."
      title="Índices"
    />
  );
}
