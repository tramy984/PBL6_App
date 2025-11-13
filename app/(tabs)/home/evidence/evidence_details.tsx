import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { Evidence, getEvidenceDetailsById, updateEvidence } from "../../../../services/evidence";

const COLORS = { primary: "#3f2b96" };

export default function EvidenceDetailScreen() {
  const router = useRouter();
  const { evidenceId } = useLocalSearchParams<{ evidenceId: string }>();

  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Quyền chỉnh sửa
  const isMonitor = false; // lấy từ session/storage nếu cần
  const previousPage = "submit-evidence";
  const canEdit = !isMonitor || previousPage === "submit-evidence";

  useEffect(() => {
    const fetchEvidence = async () => {
      if (!evidenceId) return;
      setLoading(true);
      try {
        const res = await getEvidenceDetailsById(evidenceId);
        if (res.success && res.data) {
          setEvidence(res.data);
          setFormData(res.data); // copy sang form để chỉnh sửa
        } else {
          Alert.alert("Lỗi", res.message || "Không thể lấy thông tin minh chứng");
        }
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải chi tiết minh chứng");
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [evidenceId]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!evidence) return;
    Alert.alert("Xác nhận", "Bạn có chắc muốn cập nhật minh chứng này?", [
      { text: "Hủy" },
      {
        text: "Đồng ý",
        onPress: async () => {
          setUpdating(true);
          const res = await updateEvidence(evidence._id, formData);
          setUpdating(false);
          if (res.success) {
            Alert.alert("Thành công", "Minh chứng đã được cập nhật!");
            router.back();
          } else {
            Alert.alert("Lỗi", res.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Đang tải dữ liệu minh chứng...</Text>
      </KeyboardAvoidingView>
    );
  }

  if (!evidence) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy minh chứng.</Text>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImageBackground source={require("../../../../assets/images/password_pic.jpg")} style={{ flex: 1 }} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết minh chứng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Tên hoạt động:</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={formData.title || ""}
            editable={canEdit}
            onChangeText={(text) => handleChange("title", text)}
          />

          <Text style={styles.label}>Người nộp:</Text>
          <TextInput style={styles.input} value={formData.student_id?.full_name || ""} editable={false} />

          <Text style={styles.label}>Ngày nộp:</Text>
          <TextInput
            style={styles.input}
            value={formData.submitted_at ? new Date(formData.submitted_at).toLocaleString("vi-VN") : ""}
            editable={false}
          />

          <Text style={styles.label}>Trạng thái:</Text>
          <TextInput
            style={[styles.input, formData.status === "approved" ? styles.approved : styles.waiting]}
            value={formData.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
            editable={false}
          />

          <Text style={styles.label}>Minh chứng:</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={formData.file_url || ""}
            editable={canEdit}
            onChangeText={(text) => handleChange("file_url", text)}
          />

          <Text style={styles.label}>Điểm sinh viên đánh giá:</Text>
          <TextInput
            style={[styles.input, !canEdit && styles.inputDisabled]}
            value={String(formData.self_point || "")}
            editable={canEdit}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("self_point", Number(text))}
          />

          <View style={{ marginTop: 20 }}>
            {canEdit && (
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={updating}>
                <Text style={styles.updateButtonText}>{updating ? "Đang cập nhật..." : "✓ Cập nhật minh chứng"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.primary, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 12, paddingHorizontal: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  container: { padding: 16, backgroundColor: "rgba(255,255,255,0.95)", borderTopLeftRadius: 16, borderTopRightRadius: 16, marginTop: 12 },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 12, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, backgroundColor: "#fff", fontSize: 14 },
  inputDisabled: { backgroundColor: "#f0f0f0" },
  approved: { backgroundColor: "#d4edda" },
  waiting: { backgroundColor: "#fff3cd" },
  updateButton: { marginTop: 10, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  updateButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
