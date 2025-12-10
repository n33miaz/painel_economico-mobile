import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Button,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { colors } from "../theme/colors";
import { convertCurrency } from "../services/api";

interface DetailsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  currencyCode?: string;
  children: React.ReactNode;
}

export default function DetailsModal({
  visible,
  onClose,
  title,
  currencyCode,
  children,
}: DetailsModalProps) {
  const [amount, setAmount] = useState("100");
  const [conversionResult, setConversionResult] = useState<number | null>(null);
  const [loadingConversion, setLoadingConversion] = useState(false);

  useEffect(() => {
    if (visible) {
      setConversionResult(null);
      setAmount("100");
    }
  }, [visible]);

  const handleConvert = async () => {
    if (!currencyCode || !amount) return;

    setLoadingConversion(true);
    const numericAmount = parseFloat(amount.replace(",", "."));

    if (isNaN(numericAmount)) {
      setLoadingConversion(false);
      return;
    }

    const result = await convertCurrency(currencyCode, numericAmount);
    if (result) {
      setConversionResult(result.result);
    }
    setLoadingConversion(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalTitle}>{title}</Text>

            {children}

            {currencyCode && (
              <View style={styles.conversionContainer}>
                <Text style={styles.conversionTitle}>Simular Conversão</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.currencyLabel}>BRL</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>

                <Button
                  title={loadingConversion ? "Calculando..." : "Converter"}
                  onPress={handleConvert}
                  disabled={loadingConversion}
                />

                {conversionResult !== null && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Resultado:</Text>
                    <Text style={styles.resultValue}>
                      $ {conversionResult.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.buttonSeparator} />
            <Button title="Fechar" onPress={onClose} color={colors.danger} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.transparent,
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
  },
  buttonSeparator: {
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
    marginTop: 20,
    marginBottom: 15,
  },
  conversionContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  conversionTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    marginBottom: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  currencyLabel: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    marginRight: 10,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: 100,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  resultContainer: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: 24,
    fontFamily: "Roboto_700Bold",
    color: colors.success,
    marginTop: 4,
  },
});
