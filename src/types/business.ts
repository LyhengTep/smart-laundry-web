export interface Business {
  id: string;
  owner_id: string;
  name: string;
  status?:
    | "PENDING"
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "REJECTED"
    | string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string;
  cover_image_url: string;
  rating_avg: number;
  business_license_number: string;
}

export interface BusinessListResponse {
  items: Business[];
  total?: number;
  page?: number;
  pages?: number;
  size?: number;
}

export interface BusinessRequest {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string;
  cover_image_url: string;
  business_license_number: string;
  open_time: string;
  close_time: string;
}

export interface BusinessResponse {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string;
  cover_image_url: string;
  rating_avg: number;
  business_license_number: string;
  status: "PENDING" | "APPROVED" | "OPEN" | "CLOSED" | "SUSPENDED";
  open_time: string;
  close_time: string;
  created_at: string;
  updated_at: string;
}

export interface LaundryServiceResponse {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LaundryServiceListResponse {
  items: LaundryServiceResponse[];
  total?: number;
  page?: number;
  pages?: number;
  size?: number;
}

type PricingType = "per_item" | "per_kg" | "fixed";

export interface BusinessServiceRequest {
  business_id: string;
  service_id: string;
  base_price: number;
  pricing_type: PricingType;
}
