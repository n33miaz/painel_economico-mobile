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
  Easing,
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

  const [showModal, setShowModal] = useState(visible);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setConversionResult(null);
      setAmount("100");

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setShowModal(false);
      });
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

  const handleBackdropPress = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      onClose();
    });
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
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: slideAnim.interpolate({
                  inputRange: [0, height],
                  outputRange: [1, 0],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.modalView, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                  activeOpacity={0.8}
                >
                  {loadingConversion ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.convertButtonText}>
                      Converter Agora
                    </Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  conversionContainer: {
    marginTop: 24,
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  conversionTitle: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
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
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    padding: 16,
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
    fontSize: 26,
    fontFamily: "Roboto_700Bold",
    color: colors.success,
  },
});
