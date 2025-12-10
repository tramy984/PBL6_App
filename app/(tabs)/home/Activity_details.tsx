// screens/ActivityDetailsScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityDetails, getActivityDetailsById } from "../../../services/activity";
import {
  createFeedback,
  Feedback,
  getFeedbackByStudentActivity,
} from "../../../services/feedback";

/* ------------------ ReviewModal (internal to this file) ------------------ */
interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
  activityTitle: string;
  initialRating?: number;
  initialContent?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  activityTitle,
  initialRating = 0,
  initialContent = "",
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [content, setContent] = useState<string>(initialContent);

  // mỗi lần mở modal, set lại giá trị từ props
  useEffect(() => {
    if (visible) {
      setRating(initialRating || 0);
      setContent(initialContent || "");
    }
  }, [visible, initialRating, initialContent]);

  const handleStarPress = (value: number) => setRating(value);

  const handleSubmit = () => {
    if (rating <= 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn số sao đánh giá.");
      return;
    }
    onSubmit(rating, content);
    // don't reset here — parent will reload feedback and modal will be closed by parent
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
                <TouchableOpacity key={i} onPress={() => handleStarPress(i)} style={{ paddingHorizontal: 6 }}>
                  <MaterialIcons name={i <= rating ? "star" : "star-border"} size={32} color="#FFD700" />
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

/* ------------------ ActivityDetailsScreen ------------------ */
const ActivityDetailsScreen: React.FC = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [data, setData] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [reviewVisible, setReviewVisible] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (eventId) {
      loadDetails(eventId);
      loadFeedbackForActivity(eventId);
    }
  }, [eventId]);

  const loadDetails = async (id: string) => {
    setLoading(true);
    const res = await getActivityDetailsById(id);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      Alert.alert("Lỗi", res.message || "Không lấy được chi tiết hoạt động");
    }
    setLoading(false);
  };

  const loadFeedbackForActivity = async (activityId: string) => {
    try {
      const studentId = await AsyncStorage.getItem("student_id");
      if (!studentId) {
        setFeedback(null);
        return;
      }
      const res = await getFeedbackByStudentActivity(studentId, activityId);
      if (res.success) {
        setFeedback(res.data || null);
      } else {
        // không hiển thị lỗi nặng, chỉ log
        console.warn("Load feedback error:", res.message);
        setFeedback(null);
      }
    } catch (e) {
      console.warn("Load feedback failed:", e);
      setFeedback(null);
    }
  };

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (!eventId) {
      Alert.alert("Lỗi", "Không có activityId");
      return;
    }
    setSubmitting(true);
    try {
      console.log("Submitting feedback:", { rating, content, eventId });
      const res = await createFeedback({
        student_id: await AsyncStorage.getItem("student_id") || "",
        activity_id: eventId,
        rating,
        comment: content,
      });
      if (res.success) {
        // cập nhật local feedback và đóng modal
        setFeedback(res.data || null);
        Alert.alert("Thành công", "Gửi đánh giá thành công");
        setReviewVisible(false);
      } else {
        Alert.alert("Lỗi", res.message || "Gửi đánh giá thất bại");
      }
    } catch (e: any) {
      console.error("Submit feedback error:", e);
      Alert.alert("Lỗi", "Có lỗi xảy ra, thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
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
        {data.activity.activity_image ? (
          <Image source={{ uri: data.activity.activity_image }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={[styles.banner, { justifyContent: "center", alignItems: "center", backgroundColor: "#eee" }]}>
            <Text>Không có ảnh</Text>
          </View>
        )}

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
              <Text style={styles.detailValue}>{data.activity.location || "Chưa có"}</Text>
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

        {/* Quick feedback preview */}
        <View style={[styles.section, { paddingHorizontal: 18 }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Đánh giá của bạn</Text>
          {feedback && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <MaterialIcons key={idx} name={idx < (feedback.rating || 0) ? "star" : "star-border"} size={20} color="#FFD700" />
                ))}
              </View>
              <Text style={{ color: "#333" }}>{feedback.content || "Không có nội dung"}</Text>
              <Text style={{ marginTop: 8, color: "#999", fontSize: 12 }}>
                {feedback.updatedAt ? `Cập nhật: ${formatDate(feedback.updatedAt)}` : (feedback.createdAt ? `Tạo: ${formatDate(feedback.createdAt)}` : "")}
              </Text>
            </>
          ) 
        }
        </View>

        {/* Action button */}
        {
          !feedback && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setReviewVisible(true)}>
              <Text style={styles.primaryButtonText}>{ "Đánh giá hoạt động"}</Text>
            </TouchableOpacity>
          )
        }
       
      </ScrollView>

      {/* Review Modal */}
      {data && (
        <ReviewModal
          visible={reviewVisible}
          onClose={() => setReviewVisible(false)}
          onSubmit={handleReviewSubmit}
          activityTitle={data.activity.title}
          initialRating={feedback?.rating}
          initialContent={feedback?.content}
        />
      )}
    </SafeAreaView>
  );
};

export default ActivityDetailsScreen;

/* ------------------ Styles ------------------ */
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
