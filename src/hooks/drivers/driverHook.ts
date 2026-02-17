import { getDrivers } from "@/services/driverService";
import { DriverParams } from "@/types/driver";
import { useQuery } from "@tanstack/react-query";

export function useDrivers(params: DriverParams) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => getDrivers(params),
  });
}
