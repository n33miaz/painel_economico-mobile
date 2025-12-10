import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { convertCurrency } from "../services/api";

interface DetailsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  currencyCode?: string;
  children: React.ReactNode;
}

const { height } = Dimensions.get("window");

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

  const slideAnim = useRef(new Animated.Value(height)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setConversionResult(null);
      setAmount("100");
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
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

  if (!showModal) return null;

  return (
    <Modal
      transparent={true}
      visible={showModal}
      onRequestClose={onClose}
      animationType="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        {/* Fecha ao clicar fora */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.modalView, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {children}

            {currencyCode && (
              <View style={styles.conversionContainer}>
                <Text style={styles.conversionTitle}>
                  Simulador de Conversão
                </Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyLabel}>BRL</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.inactive}
                  />
                </View>

                <TouchableOpacity
                  style={styles.convertButton}
                  onPress={handleConvert}
                  disabled={loadingConversion}
                >
                  {loadingConversion ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.convertButtonText}>Converter</Text>
                  )}
                </TouchableOpacity>

                {conversionResult !== null && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Valor Aproximado</Text>
                    <Text style={styles.resultValue}>
                      $ {conversionResult.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  conversionContainer: {
    marginTop: 24,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
  },
  conversionTitle: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Roboto_400Regular",
    color: colors.textPrimary,
  },
  convertButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  convertButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
  resultContainer: {
    marginTop: 16,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  resultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontFamily: "Roboto_700Bold",
    color: colors.success,
  },
});
