import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

import { colors } from "../theme/colors";
import { useWalletStore, Transaction } from "../store/walletStore";
import { useIndicatorStore } from "../store/indicatorStore";
import ScreenHeader from "../components/ScreenHeader";
import PageContainer from "../components/PageContainer";

const screenWidth = Dimensions.get("window").width;

const CHART_COLORS = [
  "#00ADEF",
  "#053D99",
  "#FBBA00",
  "#00C853",
  "#6200EA",
  "#FF3B30",
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
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));

    return { totalBalance: total, chartData: data };
  }, [transactions, indicators]);

  const handleAdd = () => {
    if (!amount || !price || !code) {
      Alert.alert("Atenção", "Preencha todos os campos para continuar.");
      return;
    }

    if (code.length !== 3) {
      Alert.alert("Erro", "O código da moeda deve ter 3 letras (ex: USD).");
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const handleDelete = (id: string) => {
    Alert.alert("Remover", "Deseja excluir esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          removeTransaction(id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const currentPrice = getCurrentPrice(item.currencyCode);
    const totalInvested = item.amount * item.priceAtPurchase;
    const currentValue = item.amount * currentPrice;
    const profit = currentValue - totalInvested;
    const isProfit = profit >= 0;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionIconText}>{item.currencyCode}</Text>
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {item.amount} {item.currencyCode}
          </Text>
          <Text style={styles.transactionSubtitle}>
            Pago: R$ {item.priceAtPurchase.toFixed(2)}
          </Text>
        </View>

        <View style={styles.transactionValues}>
          <Text style={styles.currentValueText}>
            R$ {currentValue.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.profitText,
              { color: isProfit ? colors.success : colors.danger },
            ]}
          >
            {isProfit ? "+" : ""}R$ {profit.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color={colors.inactive} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PageContainer>
      <ScreenHeader title="Minha Carteira" subtitle="Gestão de Ativos" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card de Saldo Total */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Saldo Estimado</Text>
            <Text style={styles.balanceValue}>
              R$ {totalBalance.toFixed(2)}
            </Text>
          </View>
          <View style={styles.balanceIcon}>
            <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        {/* Gráfico */}
        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Alocação</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[10, 0]}
              absolute
              hasLegend={true}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="pie-chart-outline"
              size={60}
              color={colors.inactive}
            />
            <Text style={styles.emptyText}>
              Adicione ativos para visualizar sua alocação.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Histórico de Transações</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              Nenhuma transação registrada.
            </Text>
          }
        />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal de Adição */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Moeda (Código)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: USD"
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

            <Text style={styles.inputLabel}>Preço Pago (Unitário em R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
              <Text style={styles.saveButtonText}>Salvar Investimento</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    marginBottom: 4,
  },
  balanceValue: {
    color: "#FFF",
    fontSize: 32,
    fontFamily: "Roboto_700Bold",
  },
  balanceIcon: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 16,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
  emptyListText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  transactionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: {
    color: colors.primaryDark,
    fontFamily: "Roboto_700Bold",
    fontSize: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionValues: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  currentValueText: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  profitText: {
    fontSize: 12,
    fontFamily: "Roboto_700Bold",
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
});
