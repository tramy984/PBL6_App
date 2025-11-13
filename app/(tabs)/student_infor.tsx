import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
import { logout } from "../../services/auth";

// --- format & parse ---
const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDate = (text: string) => {
  const parts = text.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
};

const formatGender = (gender?: string) => {
  if (!gender) return "";
  return gender.toLowerCase() === "male" ? "Nam" : "Nữ";
};

const parseGender = (text: string) =>
  text.toLowerCase() === "nam" ? "male" : text.toLowerCase() === "nữ" ? "female" : "";

// --- validate ---
const isValidDate = (text: string) => {
  const parts = text.split("/");
  if (parts.length !== 3) return false;
  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^[0-9]{9,12}$/.test(phone);
const isValidGender = (gender: string) => ["nam", "nữ"].includes(gender.toLowerCase());

// --- Component ---
const StudentInfoScreen: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dobText, setDobText] = useState("");
  const [genderText, setGenderText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [phoneText, setPhoneText] = useState("");
  const [addressText, setAddressText] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  // --- load ---
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

      setDobText(formatDate(data.date_of_birth));
      setGenderText(formatGender(data.gender));
      setEmailText(data.email || "");
      setPhoneText(data.phone || "");
      setAddressText(data.contact_address || "");

      if (data._id) await AsyncStorage.setItem("student_id", data._id);
    } catch {
      Alert.alert("Lỗi", "Không thể tải thông tin sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentInfo();
  }, []);

  // --- logout ---
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch {
            Alert.alert("Lỗi", "Không thể đăng xuất, vui lòng thử lại");
          }
        },
      },
    ]);
  };

  // --- pick image ---
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
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
      setStudentInfo(prev => prev ? { ...prev, student_image: result.assets[0].uri } : prev);
    }
  };

  // --- save ---
  const handleSave = async () => {
    if (!studentInfo) return;

    const newErrors: { [key: string]: string } = {};
    if (!isValidDate(dobText)) newErrors.date_of_birth = "Ngày sinh không hợp lệ (DD/MM/YYYY)";
    if (!isValidGender(genderText)) newErrors.gender = "Giới tính phải là Nam hoặc Nữ";
    if (!isValidEmail(emailText)) newErrors.email = "Email không hợp lệ";
    if (!isValidPhone(phoneText)) newErrors.phone = "Số điện thoại không hợp lệ";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      const updatedInfo: StudentProfile = {
        ...studentInfo,
        date_of_birth: parseDate(dobText),
        gender: parseGender(genderText),
        email: emailText,
        phone: phoneText,
        contact_address: addressText,
        class_id: studentInfo.class_id ? { ...studentInfo.class_id } : undefined,
      };
      const result = await updateStudentInfo(updatedInfo);
      setStudentInfo(result);
      setDobText(formatDate(result.date_of_birth));
      setGenderText(formatGender(result.gender));
      setEmailText(result.email || "");
      setPhoneText(result.phone || "");
      setAddressText(result.contact_address || "");
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
        <ActivityIndicator size="large" color="#3f2b96" />
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

        {/* avatar */}
        <View style={styles.imageContainer}>
          <Image
            source={
              studentInfo.student_image
                ? { uri: studentInfo.student_image }
                : { uri: "https://smilemedia.vn/wp-content/uploads/2022/09/cach-chup-hinh-the-dep.jpeg" }
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIconContainer} onPress={handlePickImage}>
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* name */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{studentInfo.full_name}</Text>
          {studentInfo.isClassMonitor && <Text style={styles.role}>(Lớp trưởng)</Text>}
        </View>

        {/* info */}
        <View style={styles.infoCard}>
          {[
            { label: "MSSV", value: studentInfo.student_number, editable: false },
            { label: "Ngày sinh", value: dobText, key: "date_of_birth", error: errors.date_of_birth },
            { label: "Giới tính", value: genderText, key: "gender", error: errors.gender },
            { label: "Lớp", value: studentInfo.class_id?.name || "", editable: false },
            { label: "Khoa", value: studentInfo.falcuty_name || "", editable: false },
            { label: "Email", value: emailText, key: "email", error: errors.email },
            { label: "Số điện thoại", value: phoneText, key: "phone", error: errors.phone },
            { label: "Địa chỉ", value: addressText, key: "contact_address" },
          ].map((item, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={{ flex: 2 }}>
                <TextInput
                  style={styles.input}
                  value={item.value}
                  editable={item.editable !== false}
                  onChangeText={(text) => {
                    if (!item.key) return;
                    switch (item.key) {
                      case "date_of_birth":
                        setDobText(text);
                        break;
                      case "gender":
                        setGenderText(text);
                        break;
                      case "email":
                        setEmailText(text);
                        break;
                      case "phone":
                        setPhoneText(text);
                        break;
                      case "contact_address":
                        setAddressText(text);
                        break;
                    }
                  }}
                  placeholder={item.label}
                />
                {item.error && <Text style={styles.errorText}>{item.error}</Text>}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Lưu thông tin"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// --- styles ---
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f5f5", paddingBottom: 40 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 20, color: "#3f2b96" },
  imageContainer: { alignItems: "center", marginBottom: 20, position: "relative" },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: "#ccc" },
  editIconContainer: { position: "absolute", bottom: 0, right: 120 / 2 - 20, backgroundColor: "#3f2b96", borderRadius: 20, padding: 6, borderWidth: 2, borderColor: "#fff" },
  nameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  role: { fontSize: 16, color: "#666", fontStyle: "italic", marginLeft: 8 },
  infoCard: { backgroundColor: "white", borderRadius: 8, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: "#eee" },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  label: { fontWeight: "600", color: "#333", fontSize: 16, flex: 1, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, color: "#333" },
  errorText: { color: "red", fontSize: 12, marginTop: 2 },
  saveButton: { backgroundColor: "#3f2b96", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginBottom: 60 },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  logoutButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#3f2b96", borderRadius: 30, padding: 12, elevation: 4 },
});

export default StudentInfoScreen;
