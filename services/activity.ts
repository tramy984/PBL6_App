import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosResponse } from "axios";
import api from "./index";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface StudentActivity {
  _id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
  activity_image?: string;
  org_unit_id: {
    _id: string;
    name: string;
  };
 
  [key: string]: any;
}

/* =========================
   3. Kiểu Activity chi tiết
========================= */
export interface ActivityDetails {
  _id: string;
  title: string;
  description?: string;
  activity_image?: string;
  start_time: string;
  end_time: string;
  start_time_updated?: string;
  end_time_updated?: string;
  location?: string;
  status: string;
  approved_at?: string;
  completed_at?: string;
  capacity?: number;
  max_points?: number;
  registrationCount?: number;
  total_qr_created?: number;
  qr_code?: string;
  requires_approval?: boolean;
  attendance_config?: {
    enabled: boolean;
    attendance_threshold: number;
    calculation_method: string;
    total_sessions_required: number;
    points_config: Record<string, number>;
  };
  attendance_sessions?: any[];
  requirements?: any[];
  field_id?: { _id: string; name: string };
  org_unit_id?: { _id: string; name: string };
  student?: { // make student optional
    registration?: {
      status: string;
      registered_at: string;
      approved_at?: string;
      approval_note?: string;
    };
    attendance?: {
      status: string;
      points: number;
      scanned_at?: string;
      feedback?: string;
      feedback_time?: string;
      feedback_verified_at?: string;
    };
    registrationStatus?: string;
    student_info?: {
      submitted_at?: string;
    };
    student_info_flags?: {
      class_mismatch?: boolean;
      student_in_system?: boolean;
    };
    total_sessions_attended?: number;
    total_sessions_required?: number;
    verified?: boolean;
    verified_at?: string;
  };
  [key: string]: any;
}


const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};


export const getActivitiesByStudentId = async (
  studentId: string
): Promise<ApiResponse<StudentActivity[]>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: StudentActivity[] }> =
      await api.get(`/activities/student/${studentId}`, { headers });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Get activities for student ${studentId} error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lấy danh sách hoạt động của sinh viên.",
    };
  }
};


export const filterActivitiesByStudent = async (
  studentId: string,
  filters: Record<string, any>
): Promise<ApiResponse<StudentActivity[]>> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: StudentActivity[]; message?: string }> =
      await api.get(`/activities/student/${studentId}/filter`, {
        params: filters,
        headers,
      });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Lọc hoạt động thành công.",
    };
  } catch (error: any) {
    console.error("Filter activities error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lọc hoạt động của sinh viên.",
    };
  }
};

export const getActivityDetailsById = async (
  activityId: string
): Promise<ApiResponse<ActivityDetails>> => {
  try {
    const headers = await getAuthHeaders();

    // Lấy studentId từ AsyncStorage
    const studentId = await AsyncStorage.getItem("student_id");
    if (!studentId) {
      return { success: false, message: "Chưa có studentId trong bộ nhớ" };
    }

    // Gọi API đúng định dạng
    const response: AxiosResponse<{ data: ActivityDetails }> = await api.get(
      `/activities/${activityId}/student/${studentId}`,
      { headers }
    );

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error(`Get activity details ${activityId} error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lấy chi tiết hoạt động.",
    };
  }
};

export const getAllActivities = async (): Promise<
  ApiResponse<StudentActivity[]>
> => {
  try {
    const response: AxiosResponse<{ data: StudentActivity[] }> =
      await api.get("/activities");

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Get all activities error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Lỗi kết nối đến server, vui lòng thử lại sau.",
    };
  }
};

export const filterActivities = async (
  filters: Record<string, any>
): Promise<ApiResponse<StudentActivity[]>> => {
  try {
    const headers = await getAuthHeaders();
    console.log("Filtering activities with filters:", filters);
    const response: AxiosResponse<{
      data: StudentActivity[];
      message?: string;
    }> = await api.get("/activities/filter", {
      params: filters,
      headers,
    });
    return {
      success: true,
      data: response.data.data,
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

export const registerActivity = async (
  activityId: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = await getAuthHeaders();

    const response: AxiosResponse<{
      data: any;
      message?: string;
    }> = await api.post(
      `/activities/${activityId}/register`,
      {},
      { headers }
    );

    return {
      success: true,
      data: response.data.data,
      message:
        response.data.message || "Đăng ký tham gia hoạt động thành công!",
    };
  } catch (error: any) {
    console.error(`Register activity ${activityId} error:`, error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể đăng ký tham gia hoạt động, vui lòng thử lại sau.",
    };
  }
};