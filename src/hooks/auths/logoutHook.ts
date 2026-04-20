import { STORAGE_KEYS } from "@/config/common";
import {
  clearAuthSession,
  logout as logoutService,
} from "@/services/authService";
import { UserAuthResponse } from "@/types/auth";
import { useLocalStorage } from "../localStorage";

export const useLogout = () => {
  const { value, setValue } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );
  const logout = async () => {
    try {
      if (value?.id && value?.role) {
        await logoutService({
          user_id: value.id,
          role: value.role,
        });
      }
    } catch (error) {
      console.log("Logout API failed", error);
    } finally {
      clearAuthSession();
      setValue(null);
    }
  };

  return { logout, currentUser: value };
};
