import {
  createDeviceToken,
  deleteDeviceToken,
  getDeviceTokensByDriverId,
  getDeviceTokensByUserId,
  updateDeviceToken,
} from "@/services/deviceTokenService";
import { DeviceTokenPayload } from "@/types/deviceToken";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useDeviceTokensByUser(userId?: string) {
  return useQuery({
    queryKey: ["device-tokens", "user", userId],
    queryFn: () => getDeviceTokensByUserId(userId!),
    enabled: Boolean(userId),
  });
}

export function useDeviceTokensByDriver(driverId?: string) {
  return useQuery({
    queryKey: ["device-tokens", "driver", driverId],
    queryFn: () => getDeviceTokensByDriverId(driverId!),
    enabled: Boolean(driverId),
  });
}

export function useCreateDeviceToken() {
  return useMutation({
    mutationFn: (payload: DeviceTokenPayload) => createDeviceToken(payload),
  });
}

export function useUpdateDeviceToken() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DeviceTokenPayload> }) =>
      updateDeviceToken(id, payload),
  });
}

export function useDeleteDeviceToken() {
  return useMutation({
    mutationFn: (id: number) => deleteDeviceToken(id),
  });
}
