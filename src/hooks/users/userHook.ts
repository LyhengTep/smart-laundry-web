import { getUser, getUsers } from "@/services/userService";
import { UserQueryParams } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
}
