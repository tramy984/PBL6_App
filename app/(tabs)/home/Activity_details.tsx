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

import {
  ActivityDetails,
  getActivityDetailsById,
  registerActivity,
} from "../../../services/activity";

import {
  createFeedback,
  Feedback,
  getFeedbackByStudentActivity,
} from "../../../services/feedback";

/* ===================== REVIEW MODAL ===================== */
interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
  activityTitle: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  activityTitle,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setContent("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (rating <= 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn số sao");
      return;
    }
    onSubmit(rating, content);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={modal.box}>
          <Text style={modal.title}>Đánh giá hoạt động</Text>
          <Text style={modal.subtitle}>{activityTitle}</Text>

          <View style={modal.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <MaterialIcons
                  name={i <= rating ? "star" : "star-border"}
                  size={32}
                  color="#FFC107"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={modal.input}
            placeholder="Chia sẻ cảm nhận của bạn..."
            multiline
            value={content}
            onChangeText={setContent}
          />

          <View style={modal.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={modal.cancel}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={modal.submit}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ===================== SCREEN ===================== */
const ActivityDetailsScreen: React.FC = () => {
  const { eventId, from } = useLocalSearchParams<{
    eventId?: string;
    from?: string;
  }>();

  const fromList = from === "list";

  const [data, setData] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [registering, setRegistering] = useState(false);

  /* ===================== EFFECT ===================== */
  useEffect(() => {
    if (!eventId) return;
    fetchData(eventId);
  }, [eventId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    const res = await getActivityDetailsById(id);

    if (res.success && res.data) {
      setData(res.data);
    } else {
      Alert.alert("Lỗi", "Không lấy được thông tin hoạt động");
    }

    if (!fromList) {
      loadFeedback(id);
    }

    setLoading(false);
  };

  const loadFeedback = async (activityId: string) => {
    const studentId = await AsyncStorage.getItem("student_id");
    if (!studentId) return;

    const res = await getFeedbackByStudentActivity(studentId, activityId);
    setFeedback(res.success ? res.data ?? null : null);
  };

  const handleRegister = async () => {
    if (!eventId) return;

    try {
      setRegistering(true);
      const res = await registerActivity(eventId);

      if (res.success) {
        Alert.alert("Thành công", "Đăng ký tham gia thành công");
        fetchData(eventId);
      } else {
        Alert.alert("Thất bại", res.message || "Không thể đăng ký");
      }
    } finally {
      setRegistering(false);
    }
  };

  const submitFeedback = async (rating: number, content: string) => {
    if (!eventId) return;

    const studentId = await AsyncStorage.getItem("student_id");
    if (!studentId) return;

    const res = await createFeedback({
      student_id: studentId,
      activity_id: eventId,
      rating,
      comment: content,
    });

    if (res.success) {
      Alert.alert("Thành công", "Đã gửi đánh giá");
      setReviewVisible(false);
      loadFeedback(eventId);
    } else {
      Alert.alert("Lỗi", "Gửi đánh giá thất bại");
    }
  };

  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  /* ===================== RENDER ===================== */
  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hoạt động</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!data.activity.activity_image && (
          <Image
            source={{ uri: data.activity.activity_image }}
            style={styles.banner}
          />
        )}

        <View style={styles.card}>
          <Text style={styles.title}>{data.activity.title}</Text>
          <Text style={styles.desc}>{data.activity.description}</Text>

          <InfoRow icon="schedule">
            {formatDate(data.activity.start_time)} →{" "}
            {formatDate(data.activity.end_time)}
          </InfoRow>

          <InfoRow icon="place">{data.activity.location}</InfoRow>

          <InfoRow icon="business">
            {data.activity.org_unit_id?.name}
          </InfoRow>
        </View>

        {fromList && (
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={registering}
          >
            <MaterialIcons name="how-to-reg" size={20} color="#FFF" />
            <Text style={styles.registerText}>
              {registering ? "Đang đăng ký..." : "Đăng ký tham gia"}
            </Text>
          </TouchableOpacity>
        )}

        {!fromList && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Lịch sử tham gia</Text>
              <Text>
                Trạng thái đăng ký:{" "}
                {data.student?.registration?.status || "Chưa có"}
              </Text>
              <Text>
                Điểm danh:{" "}
                {data.student?.attendance?.status || "Chưa có"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              {feedback ? (
                <>
                  <Text style={styles.rating}>⭐ {feedback.rating}/5</Text>
                  <Text>{feedback.content}</Text>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => setReviewVisible(true)}
                >
                  <Text style={styles.reviewText}>Viết đánh giá</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewVisible}
        onClose={() => setReviewVisible(false)}
        onSubmit={submitFeedback}
        activityTitle={data.activity.title}
      />
    </SafeAreaView>
  );
};

export default ActivityDetailsScreen;

/* ===================== SMALL COMPONENT ===================== */
const InfoRow: React.FC<{ icon: any; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={18} color="#555" />
    <Text style={styles.infoText}>{children}</Text>
  </View>
);

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFF",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  content: { padding: 15 },

  banner: {
    height: 210,
    borderRadius: 16,
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },

  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  desc: { color: "#555", marginBottom: 10 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: { marginLeft: 6, color: "#444" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  registerBtn: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  registerText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },

  reviewBtn: {
    backgroundColor: "#E8F0FF",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  reviewText: {
    color: "#007AFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  rating: { fontWeight: "bold", marginBottom: 4 },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  box: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { marginBottom: 10, color: "#666" },
  stars: { flexDirection: "row", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancel: { marginRight: 20, color: "#666" },
  submit: { color: "#007AFF", fontWeight: "bold" },
});
