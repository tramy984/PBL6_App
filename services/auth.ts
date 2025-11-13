import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./index";

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    active: boolean;
    isLocked: boolean;
    roles: { role: string }[];
  };
  message?: string;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });

    const data = response.data;

    //  Kiểm tra kỹ trước khi lưu để tránh undefined
    if (data.success && data.token && data.user?.id) {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user_id", data.user.id);
    }

    return data;
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể kết nối đến server, vui lòng thử lại sau.",
    };
  }
};

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const change_password = async ({
  old_password,
  new_password,
  confirm_password,
}: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<ChangePasswordResponse> => {
  // Kiểm tra đầu vào
  if (!old_password || !new_password || !confirm_password) {
    return { success: false, message: "Vui lòng nhập đầy đủ thông tin" };
  }

  try {
    const response = await api.post<ChangePasswordResponse>(
      "/auth/change-password",
      {
        oldPassword: old_password,
        newPassword: new_password,
        confirmPassword: confirm_password,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Change password error:", error);
    console.log("Server response:", error.response?.data);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Lỗi kết nối đến server, vui lòng thử lại sau.",
    };
  }
};
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user_id");
    await AsyncStorage.removeItem("student_id"); // nếu bạn lưu student_id
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
  }
};