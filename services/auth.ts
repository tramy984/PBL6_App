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
  return response.data;
};
