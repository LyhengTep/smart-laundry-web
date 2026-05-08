export interface BusinessReviewSummaryEmbed {
  business_id: string;
  average_rating: number;
  total_reviews: number;
}

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
    | "PENDING_DEACTIVATION"
    | string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string;
  cover_image_url: string;
  rating_avg: number;
  business_license_number: string;
  open_time?: string;
  close_time?: string;
  review_summary?: BusinessReviewSummaryEmbed;
  created_at?: string;
  updated_at?: string;
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

export interface BusinessServiceUpdateRequest {
  business_id: string;
  service_id: number;
  base_price: number;
  pricing_type: PricingType;
  id?: string;
}

export interface BusinessUpdateRequest {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string;
  cover_image_url: string;
  open_time: string;
  close_time: string;
  services: BusinessServiceUpdateRequest[];
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
  status: "PENDING" | "APPROVED" | "OPEN" | "CLOSED" | "SUSPENDED" | "PENDING_DEACTIVATION" | string;
  open_time: string;
  close_time: string;
  services?: BusinessServiceItem[];
  created_at: string;
  updated_at: string;
}

export interface BusinessServiceItem {
  id?: string;
  business_id?: string;
  service_id: number | string;
  base_price: number;
  is_active?: boolean;
  pricing_type: PricingType;
  laundry_service?: LaundryServiceResponse;
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

export type PricingType = "per_item" | "per_kg" | "fixed";

export interface BusinessReviewCustomer {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  role: string;
}

export interface BusinessReview {
  id: string;
  business_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  customer: BusinessReviewCustomer;
  created_at: string;
  updated_at: string;
}

export interface BusinessReviewSummary {
  business_id: string;
  average_rating: number;
  total_reviews: number;
}

export interface BusinessReviewRequest {
  rating: number;
  comment?: string;
}

export interface BusinessReviewListResponse {
  items: BusinessReview[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BusinessServiceRequest {
  business_id: string;
  service_id: string;
  base_price: number;
  pricing_type: PricingType;
}

export interface ShopStatusRequest {
  action: "OPEN" | "CLOSE";
  force: boolean;
}

export interface ShopStatusResponse {
  shop_id: string;
  status: string;
  message: string;
  warning?: string;
  active_order_count?: number;
}
