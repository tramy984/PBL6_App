import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://pbl6-backend-iy5q.onrender.com/api";

export async function getAttendanceByStudent(idStudent: string) {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/attendances/student/${idStudent}/activities`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Get activity ${idStudent} error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể lấy thông tin hoạt động",
    };
  }
}

export async function submitFeedback(
  attendanceId: string,
  feedbackData: { feedback: string }
) {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/attendances/${attendanceId}/submit-feedback`,
      feedbackData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      `Submit feedback for attendance ${attendanceId} error:`,
      error
    );
    return {
      success: false,
      message: error.response?.data?.message || "Không thể gửi phản hồi",
    };
  }
}

export async function getAttendanceDetail(
  studentId: string,
  activityId: string
) {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/attendances/student/${studentId}/activity/${activityId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Get attendance detail error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể lấy chi tiết điểm danh",
    };
  }
}
