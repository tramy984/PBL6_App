import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosResponse } from "axios";
import api from "./index";

// Định nghĩa kiểu Activity
export interface Activity {
  _id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
  student_id: {
    _id: string;
    full_name: string;
    student_number: string;
    [key: string]: any;
  };
  org_unit_id:{
    _id: string;
    name: string;
    [key: string]: any;
  };
  registration: {
    approval_note: string;
    approved_at: string;
    approved_by: string;
    id: string;
    registered_at: string;
    status: string;
    [key: string]: any;
  };
  attendance:{
    feedback: string;
    feedback_time: string;
    id: string;
    points: number;
    scanned_at: string;
    status: string;
    verified_at: string;
    verifier: string;
    [key: string]: any;
  }

  [key: string]: any;
}

// Kiểu trả về API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Lấy token từ AsyncStorage để gửi kèm header
const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};

// Lấy danh sách hoạt động theo ID sinh viên
export const getActivitiesByStudentId = async (
  studentId: string
): Promise<ApiResponse<Activity[]>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: Activity[] }> = await api.get(
      `/activities/student/${studentId}`,
      { headers }
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Get activities for student ${studentId} error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lấy thông tin hoạt động, vui lòng thử lại sau.",
    };
  }
};

export const filterActivitiesByStudent = async (
  studentId: string,
  filters: Record<string, any>
): Promise<ApiResponse<Activity[]>> => {
  try {
    const headers = await getAuthHeaders();

    console.log("Filters gửi lên:", filters);

    const response: AxiosResponse<{ data: Activity[]; message?: string }> =
      await api.get(`/activities/student/${studentId}/filter`, {
        params: filters,
        headers,
      });


    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Lọc hoạt động thành công.",
    };
  } catch (error: any) {
    console.error("Filter activities error:", error);

    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lọc hoạt động, vui lòng thử lại sau.",
    };
  }
};