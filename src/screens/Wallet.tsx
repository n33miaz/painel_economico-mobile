import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useWalletStore, Transaction } from "../store/walletStore";
import { useIndicatorStore } from "../store/indicatorStore";

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

  const handleAdd = () => {
    if (!amount || !price) {
      Alert.alert("Erro", "Preencha todos os campos");
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
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const currentPrice = getCurrentPrice(item.currencyCode);
    const totalInvested = item.amount * item.priceAtPurchase;
    const currentValue = item.amount * currentPrice;
    const profit = currentValue - totalInvested;
    const profitPercent = (profit / totalInvested) * 100;
    const isProfit = profit >= 0;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.coinTitle}>{item.currencyCode}</Text>
          <TouchableOpacity onPress={() => removeTransaction(item.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          <View>
            <Text style={styles.label}>Qtd: {item.amount}</Text>
            <Text style={styles.label}>
              Pago: R$ {item.priceAtPurchase.toFixed(2)}
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
        <Text style={styles.title}>Minha Carteira</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum investimento registrado.</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Transação</Text>

            <TextInput
              style={styles.input}
              placeholder="Moeda (ex: USD)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Preço Pago (R$)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Button title="Salvar" onPress={handleAdd} />
            <Button
              title="Cancelar"
              onPress={() => setModalVisible(false)}
              color={colors.danger}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: colors.textPrimary },
  addButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 25 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  coinTitle: { fontSize: 18, fontWeight: "bold" },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.textSecondary },
  currentValue: { fontSize: 16, fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
