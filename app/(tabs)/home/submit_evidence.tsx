import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import password_pic from "../../../assets/images/password_pic.jpg";
import { Evidence, getAllEvidences, submitEvidence } from "../../../services/evidence";

// ---------- Constants ----------
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLORS = { primary: "#3f2b96", approved: "#137333", pending: "#f57c00", rejected: "#c5221f" };

// ---------- Helper ----------
function parseDMYtoDate(dmy: string) {
  const parts = dmy.split("/");
  if (parts.length !== 3) return new Date();
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}

// ---------- Main Component ----------
export default function SubmitEvidenceScreen() {
  const router = useRouter();

  // Form
  const [activityName, setActivityName] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [points, setPoints] = useState("");

  // UX
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  // Data
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [filteredList, setFilteredList] = useState<Evidence[]>([]);

  // Filter
  const [showFilter, setShowFilter] = useState(false);
  const [filterActivity, setFilterActivity] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "approved" | "pending">("");
  const [filterSort, setFilterSort] = useState<"newest" | "oldest">("newest");

  // Detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  // ---------- Status helpers ----------
  const statusTextMap = useMemo(() => ({ approved: "Đã duyệt", pending: "Chờ duyệt" }), []);
  const getStatusText = (status: string) => statusTextMap[status as keyof typeof statusTextMap] ?? status;
  const getStatusColor = (status: string) => (status === "approved" ? COLORS.approved : status === "pending" ? COLORS.pending : "#666");
  const getStatusStyleBackground = (status: string) => (status === "approved" ? styles.statusApproved : styles.statusPending);

  // ---------- API Calls ----------
  const fetchEvidenceList = async () => {
    setLoading(true);
    const res = await getAllEvidences();
    if (res.success && res.data) {
      setEvidenceList(res.data);
      setFilteredList(res.data);
      setMessage("");
    } else {
      setMessageType("error");
      setMessage(res.message || "Không thể lấy danh sách minh chứng");
    }
    setLoading(false);
  };

  const handleSubmitEvidence = async () => {
    setMessage("");
    if (!activityName.trim() || !evidenceLink.trim() || !points.trim()) {
      setMessageType("error");
      setMessage("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (isNaN(Number(points)) || Number(points) <= 0) {
      setMessageType("error");
      setMessage("Số điểm phải là số dương!");
      return;
    }

    setLoading(true);
    const res = await submitEvidence({
      name: activityName.trim(),
      link: evidenceLink.trim(),
      points: Number(points),
    });

    if (res.success && res.data) {
      const newList = [res.data, ...evidenceList];
      setEvidenceList(newList);
      setFilteredList(applyFilterToList(newList, { activity: filterActivity, status: filterStatus, sort: filterSort }));
      setMessageType("success");
      setMessage("Nộp minh chứng thành công!");
      setActivityName("");
      setEvidenceLink("");
      setPoints("");
    } else {
      setMessageType("error");
      setMessage(res.message || "Nộp minh chứng thất bại!");
    }
    setLoading(false);
  };

  // ---------- Filter ----------
  function applyFilterToList(list: Evidence[], { activity, status, sort }: any) {
    let result = [...list];
    if (activity?.trim()) result = result.filter((it) => it.title.toLowerCase().includes(activity.trim().toLowerCase()));
    if (status) result = result.filter((it) => it.status === status);
    result.sort((a, b) => {
      const da = parseDMYtoDate(a.submitted_at).getTime();
      const db = parseDMYtoDate(b.submitted_at).getTime();
      return sort === "oldest" ? da - db : db - da;
    });
    return result;
  }

  const applyFilter = () => {
    setFilteredList(applyFilterToList(evidenceList, { activity: filterActivity, status: filterStatus, sort: filterSort }));
    setShowFilter(false);
  };

  const resetFilter = () => {
    setFilterActivity("");
    setFilterStatus("");
    setFilterSort("newest");
    setFilteredList(evidenceList);
    setShowFilter(false);
  };

  const handleViewDetails = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setDetailModalVisible(true);
  };

  useEffect(() => {
    fetchEvidenceList();
  }, []);

  // ---------- Render ----------
  const renderEvidenceItem = ({ item }: { item: Evidence }) => (
    <View style={styles.evidenceItem}>
      <View style={styles.evidenceHeader}>
        <Text style={styles.evidenceName} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.evidenceStatus, getStatusStyleBackground(item.status)]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.evidenceMeta}>
        <Text style={styles.evidenceDate}>Nộp lúc: {item.submitted_at}</Text>
      </View>
      <View style={styles.evidenceActions}>
        <TouchableOpacity style={styles.btnView} onPress={() => handleViewDetails(item)}>
          <Text style={styles.btnViewText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImageBackground source={password_pic} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nộp minh chứng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {/* Form submit evidence */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nộp minh chứng tham gia hoạt động</Text>
            <TextInput style={styles.input} placeholder="Tên hoạt động" value={activityName} onChangeText={setActivityName} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Link minh chứng" value={evidenceLink} onChangeText={setEvidenceLink} placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Số điểm" value={points} onChangeText={setPoints} keyboardType="numeric" placeholderTextColor="#999" />
            {message ? <Text style={[styles.message, messageType === "error" ? styles.errorText : styles.successText]}>{message}</Text> : null}
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmitEvidence} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi minh chứng</Text>}
            </TouchableOpacity>
          </View>

          {/* Evidence list with filter */}
          <View style={styles.evidenceListCard}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Danh sách minh chứng đã nộp</Text>
              <TouchableOpacity onPress={() => setShowFilter(true)}>
                <Ionicons name="filter-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : filteredList.length > 0 ? (
              <FlatList data={filteredList} renderItem={renderEvidenceItem} keyExtractor={(item) => item._id} scrollEnabled={false} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={50} color="#ccc" />
                <Text>Chưa có minh chứng nào</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Filter Modal */}
        <Modal visible={showFilter} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bộ lọc minh chứng</Text>

              {/* Trạng thái */}
            <Text style={styles.modalLabel}>Trạng thái</Text>
            <View style={styles.filterRow}>
            {["all", "approved", "pending"].map((status) => (
                <TouchableOpacity
                key={status}
                style={[styles.filterOption, (filterStatus === status || (status === "all" && !filterStatus)) && styles.filterOptionSelected]}
                onPress={() => setFilterStatus(status === "all" ? "" : (status as "approved" | "pending"))}
                >
                <Text
                    style={[
                    styles.filterOptionText,
                    (filterStatus === status || (status === "all" && !filterStatus)) && styles.filterOptionTextSelected,
                    ]}
                >
                    {status === "approved" ? "Đã duyệt" : status === "pending" ? "Chờ duyệt" : "Tất cả"}
                </Text>
                </TouchableOpacity>
            ))}
            </View>


              <Text style={styles.modalLabel}>Sắp xếp</Text>
              <View style={styles.filterRow}>
                {["newest", "oldest"].map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[styles.filterOption, filterSort === sort && styles.filterOptionSelected]}
                    onPress={() => setFilterSort(sort as "newest" | "oldest")}
                  >
                    <Text style={[styles.filterOptionText, filterSort === sort && styles.filterOptionTextSelected]}>
                      {sort === "newest" ? "Mới nhất" : "Cũ nhất"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Tên hoạt động</Text>
              <TextInput
                style={styles.input}
                placeholder="Tìm theo tên hoạt động"
                value={filterActivity}
                onChangeText={setFilterActivity}
                placeholderTextColor="#999"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={applyFilter}>
                  <Text style={styles.modalButtonText}>Áp dụng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#ccc" }]} onPress={resetFilter}>
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>Đặt lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#eee" }]} onPress={() => setShowFilter(false)}>
                  <Text style={[styles.modalButtonText, { color: "#333" }]}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: COLORS.primary, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 12 },
  backButton: { padding: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  card: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: "#fff" },
  message: { marginBottom: 8, textAlign: "center", fontWeight: "500" },
  errorText: { color: "red" },
  successText: { color: COLORS.approved },
  button: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  evidenceListCard: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 16 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flatList: { marginTop: 10 },
  evidenceItem: { backgroundColor: "#f9f9f9", borderRadius: 12, padding: 12, marginBottom: 10 },
  evidenceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  evidenceName: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1, marginRight: 8 },
  evidenceStatus: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusApproved: { backgroundColor: "rgba(19,115,51,0.1)" },
  statusPending: { backgroundColor: "rgba(245,124,0,0.1)" },
  evidenceMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  evidenceDate: { fontSize: 12, color: "#555" },
  evidencePoints: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  evidenceActions: { alignItems: "flex-end", marginTop: 8 },
  btnView: { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnViewText: { color: "#fff", fontSize: 12 },
  emptyState: { alignItems: "center", paddingVertical: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  modalLabel: { fontWeight: "600", marginTop: 12, marginBottom: 6 },
  filterRow: { flexDirection: "row", marginBottom: 8 },
  filterOption: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginRight: 8 },
  filterOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterOptionText: { color: "#000" },
  filterOptionTextSelected: { color: "#fff", fontWeight: "bold" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  modalButton: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});
