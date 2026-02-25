export type DriverResponse = {
  id: string;
  id_card_number: string;
  license_number: string | null;
  plate_number: string;
  user_id: string;
  vehicle_color: string;
  vehicle_type: string;

  user: {
    id: string;
    full_name: string;
    email: string;
    user_name: string;
    phone: string;
    role: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED"; // better strict typing
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
  };
};

export type DriverParams = {
  page: number;
  size: number;
  status?: string;
};
