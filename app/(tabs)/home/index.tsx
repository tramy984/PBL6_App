import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getStudentInfo,
  StudentProfile,
} from "../../../services/Student_Infor";
import { getNotifications } from "../../../services/notifations";

interface MenuItem {
  icon: string;
  label: string;
  key: string;
  navigateTo?: string;
}

export default function Home() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const allMenuItems: MenuItem[] = [
    {
      key: "manage",
      icon: "briefcase-outline",
      label: "Quản lý hoạt động",
      navigateTo: "manage_activity",
    },
    { key: "register", icon: "add-circle-outline", label: "Đăng ký tham gia" },
    {
      key: "upload",
      icon: "cloud-upload-outline",
      label: "Nộp minh chứng",
      navigateTo: "evidence",
    },
    {
      key: "result",
      icon: "bar-chart-outline",
      label: "Kết quả điểm",
      navigateTo: "pvcd_record",
    },
    {
      key: "password",
      icon: "lock-closed-outline",
      label: "Đổi mật khẩu",
      navigateTo: "change_password",
    },
  ];

  // Load student info
  useEffect(() => {
    const loadStudentInfo = async () => {
      try {
        setLoading(true);

        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) {
          Alert.alert("Lỗi", "Chưa đăng nhập");
          return;
        }

        const data = await getStudentInfo(userId);
        setUser(data);

        if (data._id) {
          await AsyncStorage.setItem("student_id", data._id);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Lỗi", "Không thể tải thông tin sinh viên");
      } finally {
        setLoading(false);
      }
    };

    loadStudentInfo();
  }, []);

  // Load unread notifications badge
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getNotifications();
        if (res.success) {
          setUnreadCount(res.data.unread_count || 0);
        }
      } catch (err) {
        console.error("Lỗi lấy unread notifications:", err);
      }
    };

    fetchUnread();

    // Optional: update every 10s
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#3f2b96"
          style={{ marginTop: 100 }}
        />
        <Text style={{ textAlign: "center", color: "#555" }}>
          Đang tải thông tin...
        </Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Không tìm thấy thông tin sinh viên
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3f2b96" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user.avatar ||
              "https://smilemedia.vn/wp-content/uploads/2022/09/cach-chup-hinh-the-dep.jpeg",
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Notification Icon + Badge */}
        <TouchableOpacity onPress={() => router.push("/home/Notifations")}>
          <View>
            <Ionicons name="notifications-outline" size={28} color="#fff" />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {allMenuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => handlePress(item)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={item.icon as any}
                size={28}
                color="#3f2b96"
                style={styles.menuIcon}
              />
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

  // Badge
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
  },
});
