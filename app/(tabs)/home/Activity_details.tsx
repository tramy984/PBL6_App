import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { ActivityDetails, getActivityDetailsById } from "../../../services/activity";

// --- ReviewModal ---
interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
  activityTitle: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ visible, onClose, onSubmit, activityTitle }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const handleStarPress = (value: number) => setRating(value);
  const handleSubmit = () => {
    onSubmit(rating, content);
    setRating(0);
    setContent("");
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView contentContainerStyle={modalStyles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.title}>Đánh giá hoạt động</Text>
            <Text style={modalStyles.label}>
              Hoạt động: <Text style={{ fontWeight: "bold" }}>{activityTitle}</Text>
            </Text>

            <Text style={modalStyles.label}>⭐ Đánh giá của bạn</Text>
            <View style={modalStyles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => handleStarPress(i)}>
                  <MaterialIcons
                    name={i <= rating ? "star" : "star-border"}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>💬 Nội dung đánh giá</Text>
            <TextInput
              style={modalStyles.textInput}
              placeholder="Nhập đánh giá..."
              multiline
              value={content}
              onChangeText={setContent}
              returnKeyType="done"
              blurOnSubmit
            />

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
                <Text style={modalStyles.cancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.submitButton} onPress={handleSubmit}>
                <Text style={modalStyles.submitText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  starsRow: { flexDirection: "row", marginBottom: 15 },
  textInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: "top" },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 15, marginRight: 10, borderWidth: 1, borderColor: "#007AFF", borderRadius: 8 },
  cancelText: { color: "#007AFF", fontWeight: "bold" },
  submitButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: "#007AFF", borderRadius: 8 },
  submitText: { color: "#fff", fontWeight: "bold" }
});

// --- ActivityDetailsScreen ---
const ActivityDetailsScreen = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [data, setData] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewVisible, setReviewVisible] = useState(false);

  useEffect(() => {
    if (eventId) loadDetails(eventId);
  }, [eventId]);

  const loadDetails = async (id: string) => {
    setLoading(true);
    const res = await getActivityDetailsById(id);
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  const handleReviewSubmit = (rating: number, content: string) => {
    console.log("Rating:", rating, "Content:", content);
    // TODO: Gọi API gửi đánh giá
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (loading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hoạt động</Text>
        <MaterialIcons name="more-vert" size={24} color="#333" />
      </View>

      <ScrollView style={styles.content}>
        {/* Banner */}
        <Image source={{ uri: data.activity.activity_image }} style={styles.banner} resizeMode="cover" />

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.workshopTitle}>{data.activity.title}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.workshopSubtitle}>{data.activity.description || "Không có mô tả"}</Text>
            <View style={styles.statusBadge}>
              <MaterialIcons name="check-circle" size={16} color="#FFF" />
              <Text style={styles.statusText}>{data.activity.status}</Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <MaterialIcons name="date-range" size={18} color="#007AFF" style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>
                {formatDate(data.activity.start_time)} → {formatDate(data.activity.end_time)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons name="location-on" size={18} color="#007AFF" style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Địa điểm</Text>
              <Text style={styles.detailValue}>{data.activity.location}</Text>
            </View>
          </View>

          <Text style={styles.categoryText}>Đơn vị tổ chức: {data.activity.org_unit_id?.name}</Text>
        </View>

        {/* History */}
        <View style={styles.section}>
          {data.student && data.student.registration ? (
            <>
              <View style={styles.historyItem}>
                <MaterialIcons name="check-circle" size={18} color="green" />
                <Text style={styles.historyText}>
                  Ngày đăng ký: {data.student.registration.registered_at ? formatDate(data.student.registration.registered_at) : "Chưa có"}
                </Text>
              </View>

              <View style={styles.historyItem}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={
                    data.student.registration.status === "approved"
                      ? "green"
                      : data.student.registration.status === "rejected"
                      ? "red"
                      : "orange"
                  }
                />
                <Text style={styles.historyText}>Đăng ký: {data.student.registration.status || "Chưa đăng ký"}</Text>
                {data.student.registration.status === "approved" && data.student.registration.approved_at && (
                  <Text style={styles.historyText}>Ngày duyệt: {formatDate(data.student.registration.approved_at)}</Text>
                )}
              </View>

              <View style={styles.historyItem}>
                <MaterialIcons name="check-circle" size={18} color="green" />
                <Text style={styles.historyText}>Điểm danh: {data.student.attendance?.status || "Chưa điểm danh"}</Text>
                <Text style={styles.historyText}>Điểm: {data.student.attendance?.points ?? 0}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.historyText}>Chưa có thông tin sinh viên tham gia</Text>
          )}
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.primaryButton} onPress={() => setReviewVisible(true)}>
          <Text style={styles.primaryButtonText}>Đánh giá hoạt động</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Review Modal */}
      {data && (
        <ReviewModal
          visible={reviewVisible}
          onClose={() => setReviewVisible(false)}
          onSubmit={handleReviewSubmit}
          activityTitle={data.activity.title}
        />
      )}
    </SafeAreaView>
  );
};

export default ActivityDetailsScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  content: { padding: 15 },
  banner: { width: "100%", height: 200, borderRadius: 12, marginBottom: 15 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  workshopTitle: { fontSize: 24, fontWeight: "900", color: "#333" },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  workshopSubtitle: { fontSize: 14, color: "#666" },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#4B0082", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  statusText: { color: "#FFF", marginLeft: 5, fontWeight: "bold", fontSize: 12 },
  detailsCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 12, color: "#999" },
  detailValue: { fontSize: 16, fontWeight: "600", color: "#333" },
  categoryText: { fontSize: 14, marginTop: 10, color: "#666" },
  historyItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  historyText: { marginLeft: 8, fontSize: 14, color: "#333" },
  primaryButton: { backgroundColor: "#007AFF", borderRadius: 12, padding: 15, alignItems: "center", justifyContent: "center", marginTop: 10, marginBottom: 30 },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" }
});
