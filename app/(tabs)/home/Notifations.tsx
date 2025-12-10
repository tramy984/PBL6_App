// screens/ReceiveNotification.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getNotifications,
  readAllNotifications,
} from "../../../services/notifations";

const ICON = "📢";
const ITEMS_PER_PAGE = 10;

export default function ReceiveNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const renderDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const studentId = await AsyncStorage.getItem("student_id");
        const res = await getNotifications();

        if (res.success && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((n: any) => ({
            id: n._id,
            title: n.title,
            content: n.content,
            date: n.published_date,
            read: n.isRead,
          }));

          setNotifications(formatted);
          setUnreadCount(res.data.unread_count);

          if (res.data.unread_count > 0) {
            await readAllNotifications();
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (e) {
        setError("Không thể tải thông báo. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedData = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderItem = ({ item }: any) => (
    <View style={[styles.item, !item.read && styles.unread]}>
      <Text style={styles.icon}>{ICON}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.preview}>{item.content}</Text>
        <Text style={styles.date}>{renderDate(item.date)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header text */}
      <View style={styles.headerSection}>
        {loading ? (
          <Text>Đang tải thông báo...</Text>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : unreadCount > 0 ? (
          <Text>Bạn có {unreadCount} thông báo chưa đọc</Text>
        ) : (
          <Text>Tất cả thông báo đã được đọc</Text>
        )}
      </View>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" />}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Không có thông báo</Text>
          <Text>Hiện tại không có thông báo nào dành cho bạn</Text>
        </View>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Danh sách thông báo</Text>
            <Text style={styles.count}>{notifications.length} thông báo</Text>
          </View>

          <FlatList
            data={paginatedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            >
              <Text style={styles.pageBtn}>◀</Text>
            </TouchableOpacity>

            <Text style={styles.pageNumber}>
              {currentPage}/{totalPages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
            >
              <Text style={styles.pageBtn}>▶</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", paddingTop: 40 },

  headerSection: { marginBottom: 16 },

  error: { color: "red" },

  empty: { alignItems: "center", marginTop: 40 },
  emptyIcon: { fontSize: 50 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: "bold" },
  count: { opacity: 0.6 },

  item: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    marginBottom: 12,
  },
  unread: {
    backgroundColor: "#e6f3ff",
  },
  icon: { fontSize: 28, marginRight: 12 },
  content: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 16 },
  preview: { marginTop: 4, color: "#555" },
  date: { marginTop: 6, fontSize: 12, color: "#888" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
    gap: 20,
  },
  pageBtn: { fontSize: 20 },
  pageNumber: { fontSize: 16, fontWeight: "bold" },
});
