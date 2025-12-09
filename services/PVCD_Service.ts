import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://pbl6-backend-iy5q.onrender.com/api/pvcd-records";

export async function getPVCDByStudent(idStudent: string) {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_URL}/student/${idStudent}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Get pvcd ${idStudent} error:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể lấy thông tin PVCD",
    };
  }
}
