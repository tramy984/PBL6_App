import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getStudentInfo, StudentProfile, updateStudentInfo } from "../../services/Student_Infor";

// --- format functions ---
const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatGender = (gender?: string) => {
  if (!gender) return "";
  return gender.toLowerCase() === "male" ? "Nam" : "Nữ";
};
const parseGender = (text: string) =>
  text.toLowerCase() === "nam" ? "male" : text.toLowerCase() === "nữ" ? "female" : "";

const StudentInfoScreen: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Lấy dữ liệu ---
  const loadStudentInfo = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        Alert.alert("Lỗi", "Chưa đăng nhập");
        return;
      }
      const data = await getStudentInfo(userId);
      setStudentInfo(data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải thông tin sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentInfo();
  }, []);

  // --- Đăng xuất ---
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert("Đã đăng xuất");
          // TODO: thêm navigation về màn hình đăng nhập
        },
      },
    ]);
  };

  // --- Chọn ảnh ---
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Bạn cần cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setStudentInfo((prev) => (prev ? { ...prev, student_image: uri } : prev));
    }
  };

  // --- Lưu thông tin ---
  const handleSave = async () => {
    if (!studentInfo) return;
    try {
      setSaving(true);
      const updatedInfo: StudentProfile = {
        ...studentInfo,
        class_id: studentInfo.class_id ? { ...studentInfo.class_id } : undefined,
      };
      const result = await updateStudentInfo(updatedInfo);
      setStudentInfo(result);
      Alert.alert("Thành công", "Cập nhật thông tin sinh viên thành công");
    } catch {
      Alert.alert("Lỗi", "Không thể lưu thông tin sinh viên");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );

  if (!studentInfo)
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Không có dữ liệu sinh viên</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Thông tin sinh viên</Text>

        {/* Ảnh sinh viên */}
        <View style={styles.imageContainer}>
          <Image
            source={
              studentInfo.student_image
                ? { uri: studentInfo.student_image }
                : {
                    uri: "https://smilemedia.vn/wp-content/uploads/2022/09/cach-chup-hinh-the-dep.jpeg",
                  }
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIconContainer} onPress={handlePickImage}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Họ tên */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{studentInfo.full_name}</Text>
          {studentInfo.isClassMonitor && <Text style={styles.role}>(Lớp trưởng)</Text>}
        </View>

        {/* Thông tin */}
        <View style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.label}>MSSV</Text>
            <TextInput style={styles.input} value={studentInfo.student_number} readOnly />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formatDate(studentInfo.date_of_birth)}
              onChangeText={(text) =>
                setStudentInfo({ ...studentInfo, date_of_birth: text })
              }
              placeholder="dd/MM/yyyy"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Giới tính</Text>
            <TextInput
              style={styles.input}
              value={formatGender(studentInfo.gender)}
              onChangeText={(text) =>
                setStudentInfo({ ...studentInfo, gender: parseGender(text) })
              }
              placeholder="Nam/Nữ"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Lớp</Text>
            <TextInput
              style={styles.input}
              value={studentInfo.class_id?.name || ""}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Khoa</Text>
            <TextInput
              style={styles.input}
              value={studentInfo.falcuty_name || ""}
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={studentInfo.email || ""}
              onChangeText={(text) =>
                setStudentInfo({ ...studentInfo, email: text })
              }
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={studentInfo.phone || ""}
              onChangeText={(text) =>
                setStudentInfo({ ...studentInfo, phone: text })
              }
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={studentInfo.contact_address || ""}
              onChangeText={(text) =>
                setStudentInfo({ ...studentInfo, contact_address: text })
              }
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- 🔚 Nút Đăng xuất --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 120 / 2 - 20,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  role: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
    flex: 1,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 60,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2e2c72",
    borderRadius: 30,
    padding: 12,
    elevation: 4,
  },
});

export default StudentInfoScreen;
