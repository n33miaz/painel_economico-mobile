import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

import { colors } from "../theme/colors";
import { useWalletStore, Transaction } from "../store/walletStore";
import { useIndicatorStore } from "../store/indicatorStore";

const screenWidth = Dimensions.get("window").width;

const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

export default function Wallet() {
  const { transactions, addTransaction, removeTransaction } = useWalletStore();
  const { indicators } = useIndicatorStore();
  const [modalVisible, setModalVisible] = useState(false);

  const [code, setCode] = useState("USD");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const getCurrentPrice = (code: string) => {
    const indicator = indicators.find((i) => i.code === code);
    return indicator ? indicator.buy : 0;
  };

  const { totalBalance, chartData } = useMemo(() => {
    let total = 0;
    const allocation: Record<string, number> = {};

    transactions.forEach((t) => {
      const currentPrice = getCurrentPrice(t.currencyCode);
      const currentVal = t.amount * currentPrice;
      total += currentVal;

      if (allocation[t.currencyCode]) {
        allocation[t.currencyCode] += currentVal;
      } else {
        allocation[t.currencyCode] = currentVal;
      }
    });

    const data = Object.keys(allocation).map((key, index) => ({
      name: key,
      population: parseFloat(allocation[key].toFixed(2)),
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    return { totalBalance: total, chartData: data };
  }, [transactions, indicators]);

  const handleAdd = () => {
    if (!amount || !price || !code) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (code.length !== 3) {
      Alert.alert("Erro", "O código da moeda deve ter 3 letras (ex: USD)");
      return;
    }

    addTransaction({
      currencyCode: code.toUpperCase(),
      amount: parseFloat(amount.replace(",", ".")),
      priceAtPurchase: parseFloat(price.replace(",", ".")),
      date: new Date().toISOString(),
    });
    setModalVisible(false);
    setAmount("");
    setPrice("");
    setCode("USD");
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const currentPrice = getCurrentPrice(item.currencyCode);
    const totalInvested = item.amount * item.priceAtPurchase;
    const currentValue = item.amount * currentPrice;
    const profit = currentValue - totalInvested;
    const profitPercent =
      totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    const isProfit = profit >= 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinTitle}>{item.currencyCode}</Text>
          </View>
          <TouchableOpacity onPress={() => removeTransaction(item.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          <View>
            <Text style={styles.label}>Quantidade: {item.amount}</Text>
            <Text style={styles.label}>
              Preço Médio: R$ {item.priceAtPurchase.toFixed(2)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.currentValue}>
              R$ {currentValue.toFixed(2)}
            </Text>
            <Text
              style={{
                color: isProfit ? colors.success : colors.danger,
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {isProfit ? "+" : ""}
              {profit.toFixed(2)} ({profitPercent.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Minha Carteira</Text>
          <Text style={styles.totalBalanceLabel}>Saldo Estimado</Text>
          <Text style={styles.totalBalanceValue}>
            R$ {totalBalance.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Gráfico de Alocação */}
        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Alocação por Moeda</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="pie-chart-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              Adicione ativos para ver o gráfico
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Transações</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum investimento registrado.
            </Text>
          }
        />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Investimento</Text>

            <Text style={styles.inputLabel}>Moeda (Código)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: USD, EUR"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={3}
            />

            <Text style={styles.inputLabel}>Quantidade</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Preço Pago (em R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color={colors.danger}
              />
              <View style={{ width: 10 }} />
              <Button
                title="Salvar Transação"
                onPress={handleAdd}
                color={colors.primary}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: "Roboto_700Bold",
    textTransform: "uppercase",
  },
  totalBalanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },
  totalBalanceValue: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: "Roboto_700Bold",
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  chartContainer: {
    backgroundColor: colors.cardBackground,
    margin: 15,
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    margin: 15,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  coinBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coinTitle: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.textSecondary, fontSize: 14, marginBottom: 2 },
  currentValue: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.textSecondary,
    fontFamily: "Roboto_400Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
});
