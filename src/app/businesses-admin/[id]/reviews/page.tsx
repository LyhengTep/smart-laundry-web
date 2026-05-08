"use client";

import {
  getBusinessReviews,
  getBusinessReviewSummary,
} from "@/services/businessService";
import { BusinessReview } from "@/types/business";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  MessageSquare,
  ShieldOff,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));

const wasEdited = (review: BusinessReview) =>
  review.updated_at && review.updated_at !== review.created_at;

const RatingStars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= rating ? "text-yellow-400" : "text-gray-200"}
        fill={n <= rating ? "currentColor" : "none"}
      />
    ))}
  </div>
);

const ReviewRow = ({ review }: { review: BusinessReview }) => {
  const name = review.customer?.full_name ?? "Customer";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const edited = wasEdited(review);

  return (
    <div className="flex gap-4 p-5 border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-bold text-gray-800 text-sm">{name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(review.created_at)}</span>
            {edited && (
              <span className="italic">· edited {formatDate(review.updated_at)}</span>
            )}
          </div>
        </div>
        <RatingStars rating={review.rating} />
        {review.comment && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
};

export default function BusinessReviewsPage() {
  const params = useParams<{ id: string }>();
  const businessId = params.id;

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    error: reviewsError,
  } = useQuery({
    queryKey: ["business-reviews", businessId],
    queryFn: () => getBusinessReviews(businessId),
    enabled: Boolean(businessId),
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["business-review-summary", businessId],
    queryFn: () => getBusinessReviewSummary(businessId),
    enabled: Boolean(businessId),
  });

  const is403 =
    isReviewsError &&
    axios.isAxiosError(reviewsError) &&
    reviewsError.response?.status === 403;

  if (is403) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto mt-20 flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldOff size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-sm text-gray-500">
            You are not authorized to view reviews for this shop.
          </p>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.items ?? [];
  const totalReviews = summary?.total_reviews ?? reviewsData?.total ?? reviews.length;
  const averageRating = summary?.average_rating ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
        <h1 className="text-lg font-semibold text-gray-800">Customer Reviews</h1>
      </header>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Summary card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center justify-center sm:border-r border-gray-100 sm:pr-6 shrink-0">
            <span className="text-6xl font-black text-gray-900 leading-none">
              {isSummaryLoading ? "…" : totalReviews > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <div className="mt-2">
              <RatingStars rating={Math.round(averageRating)} size={16} />
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-8 shrink-0">
                    <span className="text-xs font-bold text-gray-500">{star}</span>
                    <Star size={11} fill="currentColor" className="text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews list */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600" />
            <h2 className="font-bold text-gray-800 text-sm">All Reviews</h2>
            {!isReviewsLoading && (
              <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {totalReviews}
              </span>
            )}
          </div>

          {isReviewsLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <MessageSquare size={24} className="text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-gray-700">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Reviews from your customers will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reviews.map((review) => (
                <ReviewRow key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
