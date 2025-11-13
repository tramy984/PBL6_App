import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStudentInfo, StudentProfile } from "../../../services/Student_Infor";

interface MenuItem {
  icon: string;
  label: string;
  key: string;
  navigateTo?: string;
}

export default function Home() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const allMenuItems: MenuItem[] = [
    { key: "manage", icon: "briefcase-outline", label: "Quản lý hoạt động" },
    { key: "register", icon: "add-circle-outline", label: "Đăng ký tham gia" },
    { key: "upload", icon: "cloud-upload-outline", label: "Nộp minh chứng", navigateTo: "evidence" },
    { key: "result", icon: "bar-chart-outline", label: "Kết quả điểm" },
    { key: "approve", icon: "checkmark-done-outline", label: "Duyệt minh chứng" },
    { key: "password", icon: "lock-closed-outline", label: "Đổi mật khẩu", navigateTo: "change_password" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = await AsyncStorage.getItem("user_id");
        if (!user_id) return;
        const data = await getStudentInfo(user_id);
        setUser(data);
        await AsyncStorage.setItem("student_id", data._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3f2b96" style={{ marginTop: 100 }} />
        <Text style={{ textAlign: "center", color: "#555" }}>Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Không tìm thấy thông tin sinh viên</Text>
      </SafeAreaView>
    );
  }

  // Ẩn menu "Duyệt minh chứng" nếu không phải lớp trưởng
  const menuItems = user.isClassMonitor
    ? allMenuItems
    : allMenuItems.filter((item) => item.key !== "approve");

  const handlePress = (item: MenuItem) => {
    switch (item.navigateTo) {
      case "change_password":
        router.push("/home/change_password");
        break;
      case "evidence":
        router.push("/home/evidence");
        break;
      default:
        console.log("Chức năng chưa triển khai:", item.label);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3f2b96" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: user.avatar || "https://smilemedia.vn/wp-content/uploads/2022/09/cach-chup-hinh-the-dep.jpeg",
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Ionicons name="notifications-outline" size={28} color="#fff" />
      </View>

      {/* Menu */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => handlePress(item)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={28} color="#3f2b96" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3f2b96",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  email: {
    color: "#fff",
    fontSize: 12,
  },
  menuContainer: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "95%",
    backgroundColor: "#fff",
    padding: 25,
    marginVertical: 5,
    borderRadius: 10,
    alignSelf: "center",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 14,
    color: "#3f2b96",
    flexShrink: 1,
  },
});
