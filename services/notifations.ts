// services/NotificationsService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://pbl6-backend.vercel.app/api";

export async function getNotifications() {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lấy thông báo, vui lòng thử lại sau.",
    };
  }
}

export async function readAllNotifications() {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Read all notifications error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể đánh dấu tất cả thông báo, vui lòng thử lại sau.",
    };
  }
}
