"use client";

import { BASE_URL } from "@/config/common";
import { STORAGE_KEYS } from "@/config/common";
import { useLocalStorage } from "@/hooks/localStorage";
import {
  createBusinessReview,
  getBusinessById,
  getBusinessReviewSummary,
  getBusinessReviews,
  updateBusinessReview,
} from "@/services/businessService";
import { UserAuthResponse } from "@/types/auth";
import { BusinessResponse, BusinessReview, PricingType } from "@/types/business";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const resolveImageUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${BASE_URL}${value}`;
};

const toTimeMinutes = (value?: string) => {
  if (!value) return null;
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  return value.slice(0, 5);
};

const isOpenNow = (business: BusinessResponse) => {
  const normalized = (business.status || "").toUpperCase();
  if (!["ACTIVE", "APPROVED", "OPEN"].includes(normalized)) return false;

  const open = toTimeMinutes(business.open_time);
  const close = toTimeMinutes(business.close_time);
  if (open === null || close === null) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (open === close) return true;
  if (close > open) return currentMinutes >= open && currentMinutes < close;
  return currentMinutes >= open || currentMinutes < close;
};

const formatPricingType = (pricingType?: PricingType) => {
  if (!pricingType) return "";
  if (pricingType === "per_kg") return "/ kg";
  if (pricingType === "per_item") return "/ item";
  return "";
};

const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110"
      >
        <Star
          size={28}
          className={n <= value ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}
          fill={n <= value ? "currentColor" : "none"}
        />
      </button>
    ))}
  </div>
);

const ReviewCard = ({
  review,
  isOwn = false,
  onEdit,
}: {
  review: BusinessReview;
  isOwn?: boolean;
  onEdit?: () => void;
}) => {
  const name = review.customer?.full_name ?? "Customer";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(review.created_at));

  return (
    <div
      className={`flex gap-4 p-5 rounded-2xl border ${
        isOwn
          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
          isOwn
            ? "bg-blue-600 text-white"
            : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
        }`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {name}
            </p>
            {isOwn && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> Your review
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">{formattedDate}</p>
            {isOwn && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-500 transition-colors"
                title="Edit your review"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 mt-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={13}
              className={
                n <= review.rating
                  ? "text-yellow-400"
                  : "text-slate-200 dark:text-slate-700"
              }
              fill={n <= review.rating ? "currentColor" : "none"}
            />
          ))}
        </div>
        {review.comment && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
};

const ShopProfilePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const businessId = String(params.id || "");
  const queryClient = useQueryClient();
  const { value: authUser } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const isCustomer = authUser?.role === "CUSTOMER";

  const {
    data: business,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["business-public", businessId],
    queryFn: () => getBusinessById(businessId),
    enabled: Boolean(businessId),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["business-reviews", businessId],
    queryFn: () => getBusinessReviews(businessId),
    enabled: Boolean(businessId),
  });

  const { data: reviewSummary } = useQuery({
    queryKey: ["business-review-summary", businessId],
    queryFn: () => getBusinessReviewSummary(businessId),
    enabled: Boolean(businessId),
  });

  const { mutate: editReview, isPending: isEditing } = useMutation({
    mutationFn: (reviewId: string) =>
      updateBusinessReview(businessId, reviewId, {
        rating: editRating,
        comment: editComment.trim() || undefined,
      }),
    onSuccess: () => {
      setEditSuccess(true);
      setEditError("");
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business-review-summary", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business-public", businessId] });
    },
    onError: (e) => {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const detail = (e.response?.data as { detail?: string })?.detail;
        if (status === 404) {
          setEditError("You have not reviewed this shop yet.");
          return;
        }
        if (status === 403) {
          setEditError("You are not authorized to edit this review.");
          return;
        }
        if (status === 422) {
          setEditError("Invalid rating. Please select between 1 and 5 stars.");
          return;
        }
        if (status === 400) {
          setEditError(detail ?? "Cannot submit an empty update.");
          return;
        }
        setEditError(detail ?? e.message ?? "Failed to update review.");
        return;
      }
      setEditError("Failed to update review. Please try again.");
    },
  });

  const handleEditReview = (reviewId: string) => {
    setEditSuccess(false);
    if (editRating < 1 || editRating > 5) {
      setEditError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setEditError("");
    editReview(reviewId);
  };

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    mutationFn: () =>
      createBusinessReview(businessId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      }),
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment("");
      setReviewError("");
      queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business-public", businessId] });
    },
    onError: (e) => {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const detail = (e.response?.data as { detail?: string })?.detail;
        if (status === 409) {
          setReviewError("You have already reviewed this shop.");
          return;
        }
        if (status === 400) {
          setReviewError(
            detail ?? "You need at least one completed order with this shop to leave a review.",
          );
          return;
        }
        if (status === 422) {
          setReviewError("Invalid rating. Please select between 1 and 5 stars.");
          return;
        }
        setReviewError(detail ?? e.message ?? "Failed to submit review.");
        return;
      }
      setReviewError("Failed to submit review. Please try again.");
    },
  });

  const handleSubmitReview = () => {
    setReviewSuccess(false);
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setReviewError("");
    submitReview();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-8 text-slate-500 dark:text-slate-400">
        Loading shop...
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 text-red-700 dark:text-red-300">
          Failed to load business detail.
        </div>
      </div>
    );
  }

  const coverImage =
    resolveImageUrl(business.cover_image_url) ||
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=1200&auto=format&fit=crop";
  const open = isOpenNow(business);
  const offeredServices = (business.services || []).slice(0, 6);
  const reviews = reviewsData?.items ?? [];
  const ownReview = isCustomer ? reviews.find((r) => r.customer_id === authUser?.id) : undefined;
  const alreadyReviewed = Boolean(ownReview);
  const reviewCount = reviewSummary?.total_reviews ?? reviewsData?.total ?? reviews.length;
  const averageRating = reviewSummary?.average_rating ?? business.rating_avg ?? 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img
          src={coverImage}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
          <button
            onClick={() => router.replace("/")}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all"
          >
            <ArrowLeft size={20} className="text-slate-900" />
          </button>
          <div className="flex gap-3">
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all">
              <Share2 size={20} className="text-slate-900" />
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase ${
                    open ? "bg-green-500" : "bg-slate-500"
                  }`}
                >
                  {open ? "Open Now" : "Closed"}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star size={16} fill="currentColor" />{" "}
                  {averageRating.toFixed(1)}
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {business.name}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <MapPin size={18} className="text-blue-600 shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!authUser?.id) {
                  const redirectTo = encodeURIComponent(
                    `/businesses/${businessId}/order`,
                  );
                  router.push(`/auth/login?redirect=${redirectTo}`);
                  return;
                }
                router.push(`/businesses/${businessId}/order`);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-black text-base md:text-lg rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all whitespace-nowrap self-start"
            >
              <ShoppingBag size={20} />
              Order Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-50 dark:border-slate-800">
            <DetailTile
              icon={<Clock className="text-blue-600" />}
              label="Operating Hours"
              value={`${formatTime(business.open_time)} - ${formatTime(business.close_time)}`}
            />
            <DetailTile
              icon={<Phone className="text-blue-600" />}
              label="Contact Support"
              value={business.phone || "-"}
            />
            <DetailTile
              icon={<ShieldCheck className="text-blue-600" />}
              label="Service Quality"
              value={open ? "Open for service" : "Currently closed"}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info size={20} className="text-blue-600" /> About the Shop
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {business.name} provides professional laundry services with
            transparent pricing and scheduled pickup/dropoff support.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Popular Services
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offeredServices.length > 0 ? (
              offeredServices.map((service) => (
                <PriceCard
                  key={String(service.id || service.service_id)}
                  title={
                    service.laundry_service?.name ||
                    `Service #${service.service_id}`
                  }
                  price={`$${(service.base_price ?? 0).toFixed(2)}${formatPricingType(service.pricing_type)}`}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No service pricing available.
              </p>
            )}
          </div>
        </section>

        {/* Reviews section */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            Customer Reviews
          </h3>

          {/* Rating summary + breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col sm:flex-row gap-6">
            {/* Big average */}
            <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 dark:border-slate-800 sm:pr-6 shrink-0">
              <span className="text-6xl font-black text-slate-900 dark:text-white leading-none">
                {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    className={
                      n <= Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-slate-200 dark:text-slate-700"
                    }
                    fill={
                      n <= Math.round(averageRating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{star}</span>
                      <Star size={11} fill="currentColor" className="text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a review — customers only, not already reviewed */}
          {isCustomer && !alreadyReviewed && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                Write a Review
              </p>
              <StarPicker
                value={reviewRating}
                onChange={(v) => {
                  setReviewRating(v);
                  setReviewError("");
                  setReviewSuccess(false);
                }}
              />
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your experience (optional)..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              {reviewError && (
                <p className="text-sm text-red-500 font-semibold">{reviewError}</p>
              )}
              {reviewSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle size={16} /> Review submitted — thank you!
                </div>
              )}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-60 text-sm"
              >
                <Send size={15} />
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* Edit review — customers who already reviewed */}
          {isCustomer && alreadyReviewed && ownReview && (
            <div id="edit-review-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                  Edit Your Review
                </p>
                {editMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditError("");
                      setEditSuccess(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditRating(ownReview.rating);
                      setEditComment(ownReview.comment ?? "");
                      setEditError("");
                      setEditSuccess(false);
                      setEditMode(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                )}
              </div>

              {!editMode && editSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle size={16} /> Review updated successfully!
                </div>
              )}

              {!editMode && !editSuccess && (
                <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                  <CheckCircle size={16} className="shrink-0" />
                  <p className="text-sm font-semibold">
                    You have already reviewed this shop. Click Edit to update your feedback.
                  </p>
                </div>
              )}

              {editMode && (
                <>
                  <StarPicker
                    value={editRating}
                    onChange={(v) => {
                      setEditRating(v);
                      setEditError("");
                    }}
                  />
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    placeholder="Update your experience (optional)..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                  />
                  {editError && (
                    <p className="text-sm text-red-500 font-semibold">{editError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEditReview(ownReview.id)}
                    disabled={isEditing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-60 text-sm"
                  >
                    <Send size={15} />
                    {isEditing ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Unauthenticated prompt */}
          {!authUser && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-5 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/auth/login?redirect=${encodeURIComponent(`/businesses/${businessId}`)}`,
                    )
                  }
                  className="text-blue-600 font-bold hover:underline"
                >
                  Log in
                </button>{" "}
                to leave a review.
              </p>
            </div>
          )}

          {/* Review list */}
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwn={review.customer_id === authUser?.id}
                  onEdit={
                    review.customer_id === authUser?.id
                      ? () => {
                          setEditRating(review.rating);
                          setEditComment(review.comment ?? "");
                          setEditError("");
                          setEditSuccess(false);
                          setEditMode(true);
                          document
                            .getElementById("edit-review-section")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <MessageSquare size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">No reviews yet</p>
                  <p className="text-sm text-slate-400 mt-0.5">Be the first to share your experience!</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  </div>
);

const PriceCard = ({ title, price }: { title: string; price: string }) => (
  <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-100 transition-all group cursor-pointer shadow-sm hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
        {title[0]}
      </div>
      <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-black text-slate-900 dark:text-slate-100">
        {price}
      </span>
      <ChevronRight
        size={18}
        className="text-slate-300 group-hover:text-blue-600 transition-colors"
      />
    </div>
  </div>
);

export default ShopProfilePage;
