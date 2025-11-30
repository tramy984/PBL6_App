import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getAttendanceByStudent,
  getAttendanceDetail,
  submitFeedback,
} from "../../../services/AttendanceService";
import { getPVCDByStudent } from "../../../services/PVCD_Service";

interface Activity {
  id: string;
  title: string;
  points: number;
  start_time: string;
  end_time: string;
  attendance_id: string;
}

interface YearRecord {
  record: number;
  start_year: number;
  end_year: number;
}

const PVCDRecord = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [yearRecords, setYearRecords] = useState<YearRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalActivity, setTotalActivity] = useState(0);

  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingYear, setLoadingYear] = useState(true);

  const [errorActivities, setErrorActivities] = useState<string | null>(null);
  const [errorYear, setErrorYear] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<
    (Activity & { data?: any }) | null
  >(null);

  const [goalRecord] = useState(15);
  const [studentId, setStudentId] = useState<string>("");

  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      const id = await AsyncStorage.getItem("student_id");
      if (id) setStudentId(id);
    };
    fetchStudent();
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const res = await getAttendanceByStudent(studentId);
        if (!res.success) throw new Error(res.message);
        const raw: any[] = res.data?.data || [];
        const formatted = raw.map((item) => ({
          id: item._id,
          title: item.title || "Không rõ",
          points: item.points,
          start_time: item.start_time,
          end_time: item.end_time,
          attendance_id: item.attendance_id,
        }));
        setActivities(formatted);
        setTotalActivity(formatted.length);
      } catch (err: any) {
        setErrorActivities(err.message);
      } finally {
        setLoadingActivities(false);
      }
    };

    const fetchYearRecord = async () => {
      try {
        setLoadingYear(true);
        const res = await getPVCDByStudent(studentId);
        if (!res.success) throw new Error(res.message);
        const raw: any[] = res.data || [];
        const formatted = raw.map((item) => ({
          record: item.total_point,
          start_year: new Date(item.start_year).getFullYear(),
          end_year: new Date(item.end_year).getFullYear(),
        }));
        setYearRecords(formatted);
        const totalScore = formatted.reduce((sum, r) => sum + r.record, 0);
        setTotalScore(totalScore);
      } catch (err: any) {
        setErrorYear(err.message);
      } finally {
        setLoadingYear(false);
      }
    };

    fetchActivities();
    fetchYearRecord();
  }, [studentId]);

  const handleFeedbackClick = async (activity: Activity) => {
    const res = await getAttendanceDetail(studentId, activity.id);
    setSelectedActivity({ ...activity, data: res.data?.data || "" });
    setFeedbackText(res.data?.data?.feedback || "");
    setShowPopup(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedActivity) return;
    if (!feedbackText.trim()) {
      alert("Vui lòng nhập phản hồi!");
      return;
    }
    await submitFeedback(selectedActivity.attendance_id, {
      feedback: feedbackText,
    });
    setShowPopup(false);
  };

  const formatDate = (iso: string) => {
    return iso ? new Date(iso).toLocaleDateString("vi-VN") : "";
  };

  // Map trạng thái feedback
  const feedbackStatusMap: Record<string, string> = {
    pending: "Chưa xử lý",
    accepted: "Đã được duyệt",
    rejected: "Đã từ chối",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã được duyệt":
        return "#4CAF50";
      case "Đã từ chối":
        return "#F44336";
      case "Chưa xử lý":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= goalRecord) return "#4CAF50";
    if (score >= goalRecord * 0.7) return "#FF9800";
    return "#F44336";
  };

  const renderPopup = () => {
    if (!selectedActivity) return null;
    const data = selectedActivity.data;
    const feedbackStatus = data?.feedback_status
      ? feedbackStatusMap[data.feedback_status] || data.feedback_status
      : null;

    return (
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>Chi tiết hoạt động</Text>

            <View style={styles.popupSection}>
              <Text style={styles.popupLabel}>Hoạt động</Text>
              <Text style={styles.popupValue}>{selectedActivity.title}</Text>
            </View>

            <View style={styles.popupSection}>
              <Text style={styles.popupLabel}>Điểm</Text>
              <Text style={[styles.popupValue, styles.pointsText]}>
                {selectedActivity.points}
              </Text>
            </View>

            {data && feedbackStatus && (
              <View style={styles.popupSection}>
                <Text style={styles.popupLabel}>Trạng thái phản hồi</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(feedbackStatus) },
                  ]}
                >
                  {feedbackStatus}
                </Text>
              </View>
            )}

            {data?.feedback_time && (
              <View style={styles.popupSection}>
                <Text style={styles.popupLabel}>Ngày phản hồi</Text>
                <Text style={styles.popupValue}>
                  {new Date(data.feedback_time).toLocaleString("vi-VN")}
                </Text>
              </View>
            )}

            {(feedbackStatus === "Đã được duyệt" ||
              feedbackStatus === "Đã từ chối") &&
              data?.feedback_verified_at && (
                <View style={styles.popupSection}>
                  <Text style={styles.popupLabel}>Ngày xử lý</Text>
                  <Text style={styles.popupValue}>
                    {new Date(data.feedback_verified_at).toLocaleString(
                      "vi-VN"
                    )}
                  </Text>
                </View>
              )}

            <View style={styles.popupSection}>
              <Text style={styles.popupLabel}>Phản hồi của bạn</Text>
              <TextInput
                style={[styles.textarea, data?.feedback && styles.readonly]}
                placeholder="Nhập phản hồi của bạn tại đây..."
                multiline
                editable={!data?.feedback}
                value={feedbackText}
                onChangeText={setFeedbackText}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>

              {!data?.feedback && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitFeedback}
                >
                  <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Điểm Phục Vụ Cộng Đồng</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalScore}</Text>
            <Text style={styles.summaryLabel}>Tổng điểm</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalActivity}</Text>
            <Text style={styles.summaryLabel}>Hoạt động</Text>
          </View>
        </View>
      </View>

      {/* Year Records Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Điểm theo năm học</Text>
        <Text style={styles.goalText}>Mục tiêu: {goalRecord} điểm/năm</Text>

        {loadingYear ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : errorYear ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorYear}</Text>
          </View>
        ) : (
          <View style={styles.yearList}>
            {yearRecords.map((y, idx) => (
              <View key={idx} style={styles.yearCard}>
                <View style={styles.yearHeader}>
                  <Text style={styles.yearTitle}>
                    {y.start_year} - {y.end_year}
                  </Text>
                  <Text
                    style={[
                      styles.yearPoints,
                      { color: getScoreColor(y.record) },
                    ]}
                  >
                    {y.record} điểm
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (y.record / goalRecord) * 100,
                          100
                        )}%`,
                        backgroundColor: getScoreColor(y.record),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {y.record}/{goalRecord} điểm
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Activities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoạt động đã tham gia</Text>

        {loadingActivities ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : errorActivities ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorActivities}</Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Chưa tham gia hoạt động nào
            </Text>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {activities.map((item) => (
              <View key={item.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.activityPoints}>{item.points} điểm</Text>
                </View>

                <View style={styles.activityDateContainer}>
                  <Text style={styles.activityDate}>
                    {formatDate(item.start_time)} - {formatDate(item.end_time)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleFeedbackClick(item)}
                  style={styles.feedbackButton}
                >
                  <Text style={styles.feedbackButtonText}>Phản hồi</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {renderPopup()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 15,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#3f2b96",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  goalText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  yearList: {
    gap: 12,
  },
  yearCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  yearHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  yearPoints: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0b330cff",
  },
  activityDateContainer: {
    marginBottom: 12,
  },
  activityDate: {
    fontSize: 14,
    color: "#666",
  },
  feedbackButton: {
    backgroundColor: "#09406dff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#FFEAA7",
    borderRadius: 8,
    alignItems: "center",
  },
  errorText: {
    color: "#D63031",
    textAlign: "center",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
    fontSize: 16,
  },
  // Popup styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  popupContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  popupSection: {
    marginBottom: 16,
  },
  popupLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  popupValue: {
    fontSize: 16,
    color: "#333",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 100,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  readonly: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PVCDRecord;
