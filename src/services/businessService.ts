import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  BusinessListResponse,
  BusinessRequest,
  BusinessResponse,
  BusinessReview,
  BusinessReviewListResponse,
  BusinessReviewRequest,
  BusinessReviewSummary,
  BusinessServiceRequest,
  BusinessUpdateRequest,
  LaundryServiceResponse,
  ShopStatusRequest,
  ShopStatusResponse,
} from "@/types/business";

export const getBusinesses = async (
  params?: Record<string, string | number | boolean | undefined>,
): Promise<BusinessListResponse> => {
  const res = await http.get<BusinessListResponse>(
    API_ROUTES.FETCH_BUSINESSES,
    { params },
  );
  return res.data;
};

export const getMyBusinesses = async (params?: {
  page?: number;
  size?: number;
}): Promise<BusinessListResponse> => {
  const res = await http.get<BusinessListResponse>(
    API_ROUTES.FETCH_MY_BUSINESSES,
    { params },
  );
  return res.data;
};

export const getBusinessById = async (
  id: string,
): Promise<BusinessResponse> => {
  const res = await http.get<BusinessResponse>(API_ROUTES.GET_BUSINESS(id));
  return res.data;
};

export const getLaundryServices = async (
  params?: Record<string, string | number | boolean>,
): Promise<LaundryServiceResponse[]> => {
  const res = await http.get<LaundryServiceResponse[]>(
    API_ROUTES.FETCH_LAUNDRY_SERVICES,
    {
      params,
    },
  );

  return res.data;
};

export const createBusiness = async (
  data: BusinessRequest,
): Promise<BusinessResponse> => {
  const res = await http.post(API_ROUTES.CREATE_BUSINESS, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const createBusinessServices = async (
  data: BusinessServiceRequest[],
) => {
  const res = await http.post(API_ROUTES.CREATE_BUSINESS_SERVICES, data);

  return res.data;
};

export const deleteBusiness = async (business_id: string) => {
  const res = await http.delete(API_ROUTES.DELETE_BUSINESS(business_id));
  return res.data;
};

export const getBusinessRevenue = async (
  businessId: string,
): Promise<{ business_id: string; total_revenue: string; currency: string }> => {
  const res = await http.get(API_ROUTES.GET_BUSINESS_REVENUE(businessId));
  return res?.data?.data ?? res?.data;
};

export const updateBusinessStatus = async (
  id: string,
  status: "OPEN" | "CLOSED",
): Promise<BusinessResponse> => {
  const res = await http.patch<BusinessResponse>(
    API_ROUTES.UPDATE_BUSINESS_STATUS(id),
    { status },
  );
  return res.data;
};

export const updateShopStatus = async (
  businessId: string,
  data: ShopStatusRequest,
): Promise<ShopStatusResponse> => {
  const res = await http.patch<ShopStatusResponse>(
    API_ROUTES.UPDATE_SHOP_STATUS(businessId),
    data,
  );
  return res.data;
};

export const getBusinessReviewSummary = async (
  businessId: string,
): Promise<BusinessReviewSummary> => {
  const res = await http.get<BusinessReviewSummary>(
    API_ROUTES.GET_BUSINESS_REVIEW_SUMMARY(businessId),
  );
  return res.data;
};

export const getBusinessReviews = async (
  businessId: string,
): Promise<BusinessReviewListResponse> => {
  const res = await http.get<BusinessReviewListResponse>(
    API_ROUTES.GET_BUSINESS_REVIEWS(businessId),
  );
  return res.data;
};

export const createBusinessReview = async (
  businessId: string,
  data: BusinessReviewRequest,
): Promise<void> => {
  await http.post(API_ROUTES.CREATE_BUSINESS_REVIEW(businessId), data);
};

export const updateBusinessReview = async (
  businessId: string,
  reviewId: string,
  data: BusinessReviewRequest,
): Promise<BusinessReview> => {
  const res = await http.patch<BusinessReview>(
    API_ROUTES.UPDATE_BUSINESS_REVIEW(businessId, reviewId),
    data,
  );
  return res.data;
};

export const approveBusinessDeactivation = async (id: string): Promise<void> => {
  await http.patch(API_ROUTES.APPROVE_BUSINESS_DEACTIVATION(id));
};

export const rejectBusinessDeactivation = async (id: string): Promise<void> => {
  await http.patch(API_ROUTES.REJECT_BUSINESS_DEACTIVATION(id));
};

export const updateBusiness = async (
  id: string,
  data: BusinessUpdateRequest,
): Promise<BusinessResponse> => {
  console.log("Updating business with data:", data); // Debug log to check the data being sent
  const res = await http.put<BusinessResponse>(
    API_ROUTES.UPDATE_BUSINESS(id),
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};
