import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./index";

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    active: boolean;
    isLocked: boolean;
    roles: { role: string }[];
  };
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
   const data = response.data;
   if (data.success && data.token) {
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user_id", data.user.id);
  }
  return response.data;
};
