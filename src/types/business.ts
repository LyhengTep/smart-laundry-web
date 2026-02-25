export interface Business {
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
}

export interface BusinessListResponse {
  items: Business[];
  total?: number;
  page?: number;
  pages?: number;
  size?: number;
}
