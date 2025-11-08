import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosResponse } from "axios";
import api from "./index";

export interface StudentProfile {
  _id: string;
  user_id: any;
  student_number: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  falcuty_name?: string;
  class_id?: {
        _id: string;
        name: string;
        cohort_id?: { _id: string; year: number };
        falcuty_id?: { _id: string; name: string };
    };
  isClassMonitor: boolean;
  phone?: string;
  email?: string;
  contact_address?: string;
  [key: string]: any;
}

// Lấy token từ AsyncStorage để gửi kèm
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Chưa đăng nhập");
  return { Authorization: `Bearer ${token}` };
};

// Lấy thông tin sinh viên
export const getStudentInfo = async (user_id: string): Promise<StudentProfile> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: StudentProfile }> = await api.get(
      `/student-profiles/user/${user_id}`,
      { headers }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin sinh viên:", error);
    throw error;
  }
};

// Cập nhật thông tin sinh viên
export const updateStudentInfo = async (studentData: StudentProfile): Promise<StudentProfile> => {
  try {
    const headers = await getAuthHeaders();
    const response: AxiosResponse<{ data: StudentProfile }> = await api.put(
      `/student-profiles/${studentData._id}`,
      studentData,
      { headers }
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật thông tin sinh viên:", error);
    throw error;
  }
};
