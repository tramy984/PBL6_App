import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import password_pic from "../../../assets/images/password_pic.jpg";
import { change_password } from "../../../services/auth";

const { height } = Dimensions.get("window");

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // thông báo lỗi/thành công
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const handleSavePassword = async () => {
    setMessage(""); // reset message

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessageType("error");
      setMessage("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 12) {
      setMessageType("error");
      setMessage("Mật khẩu phải từ 6 đến 12 ký tự!");
      return;
    }

    try {
      setLoading(true);
      const res = await change_password({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.success) {
        setMessageType("success");
        setMessage(res.message || "Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessageType("error");
        setMessage(res.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể kết nối đến server. Vui lòng thử lại sau!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={password_pic}
        style={styles.background}
        resizeMode="cover"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.note}>
              Lưu ý:{" "}
              <Text style={{ color: "red" }}>
                Không đặt mật khẩu trùng ngày sinh, độ dài 6–12 ký tự và không
                chứa khoảng trắng.
              </Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu cũ</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu cũ"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* MESSAGE NGAY TRÊN BUTTON */}
            {message ? (
              <Text
                style={[
                  styles.message,
                  messageType === "error" ? styles.errorText : styles.successText,
                ]}
              >
                {message}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSavePassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Đang xử lý..." : "Lưu mật khẩu"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-start",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#3f2b96",
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    width: "100%",
    maxWidth: 450,
  },

  note: {
    fontSize: 13,
    textAlign: "center",
    color: "#444",
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#222",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  message: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff4d4f",
  },
  successText: {
    color: "#4caf50",
  },
  button: {
    backgroundColor: "#3f2b96",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
