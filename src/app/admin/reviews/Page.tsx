"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar"; // Assuming this component exists and is styled
import AdminSideBar from "@/app/components/AdminSideBar"; // Assuming this component exists and is styled
import {
  Star,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
} from "lucide-react";

interface Review {
  id: string;
  userId: string;
  offerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  type: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilImg?: string;
}

interface Service {
  id: string;
  name: string;
}

const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<null | Review>(null); // Store the whole review object

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:8080/api/reviews");
        if (!res.ok)
          throw new Error(`Failed to fetch reviews (status: ${res.status})`);
        const data = await res.json();

        const usersRes = await fetch("http://localhost:8080/api/users");
        if (!usersRes.ok)
          throw new Error(`Failed to fetch users (status: ${usersRes.status})`);
        const usersData = await usersRes.json();
        const usersMap: Record<string, User> = {};
        usersData.forEach((u: any) => {
          usersMap[u.id] = u;
        });
        setUsers(usersMap);

        const servicesRes = await fetch("http://localhost:8080/api/services");
        if (!servicesRes.ok)
          throw new Error(
            `Failed to fetch services (status: ${servicesRes.status})`
          );
        const servicesData = await servicesRes.json();
        const servicesMap: Record<string, Service & { offerType?: string }> =
          {};
        Object.values(servicesData)
          .flat()
          .forEach((s: any) => {
            if (s && s.id) {
              servicesMap[s.id] = {
                id: s.id,
                name: s.name || "Unnamed Service",
                offerType: s.offerType,
              };
            }
          });
        setServices(servicesMap);

        const reviewsWithType = data.map((review: any) => {
          const service = servicesMap[review.offerId];
          return { ...review, type: service?.offerType || "Unknown" };
        });
        setReviews(reviewsWithType);
      } catch (err: any) {
        setError(err.message || "Failed to load reviews");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleDeleteInitiate = (review: Review) => {
    setSelectedReview(review); // Keep track for context if needed, or pass review directly
    setShowConfirmModal(review);
  };

  const confirmDelete = async () => {
    if (!showConfirmModal) return;
    const reviewToDelete = showConfirmModal;

    setDeleting(reviewToDelete.id);
    setError(null);
    try {
      const url = `http://localhost:8080/api/reviews/${reviewToDelete.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Failed to delete review" }));
        throw new Error(
          errorData.message || `Failed to delete review (status: ${res.status})`
        );
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      if (selectedReview?.id === reviewToDelete.id) {
        setSelectedReview(null); // Clear detailed view if it was the one deleted
      }
      setShowConfirmModal(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete review");
      console.error("Delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  const renderStars = (rating: number, reviewId: string) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`${reviewId}-star-${i}`}
          className={`w-5 h-5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen bg-slate-100">
        <div className="fixed left-0 top-0 h-full z-30">
          <AdminSideBar />
        </div>
        <main className="flex-1 ml-64 p-6 md:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Reviews
            </h1>
          </header>

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
              <p className="ml-3 text-slate-600 text-lg">Loading reviews...</p>
            </div>
          ) : selectedReview && !showConfirmModal ? ( // Show detail view only if modal is not active
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={
                    users[selectedReview.userId]?.profilImg ||
                    "/default-avatar.png" // Ensure you have this in your /public folder
                  }
                  alt="User profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h2 className="font-bold text-xl text-slate-800">
                    {users[selectedReview.userId]?.firstName || "Deleted"}{" "}
                    {users[selectedReview.userId]?.lastName || "User"}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Review for:{" "}
                    <span className="font-medium text-sky-700">
                      {services[selectedReview.offerId]?.name ||
                        selectedReview.offerId}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Type: {selectedReview.type}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                {renderStars(selectedReview.rating, selectedReview.id)}
                <span className="font-bold text-yellow-500 text-lg">
                  ({selectedReview.rating}.0)
                </span>
              </div>
              <p className="mb-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedReview.comment}
              </p>
              <div className="text-slate-400 text-xs mb-8">
                Reviewed on:{" "}
                {new Date(selectedReview.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50"
                  onClick={() => handleDeleteInitiate(selectedReview)}
                  disabled={deleting === selectedReview.id}
                >
                  {deleting === selectedReview.id ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 mr-2" />
                  )}
                  {deleting === selectedReview.id
                    ? "Deleting..."
                    : "Delete Review"}
                </button>
                <button
                  className="flex items-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
                  onClick={() => setSelectedReview(null)}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back to List
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-slate-700">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service / Offer
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Rating
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Comment
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-slate-500"
                        >
                          No reviews found.
                        </td>
                      </tr>
                    )}
                    {reviews.map((review) => (
                      <tr
                        key={review.id}
                        className="hover:bg-slate-50 transition-colors duration-150 ease-in-out cursor-pointer"
                        onClick={() => setSelectedReview(review)}
                      >
                        <td className="py-3 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                users[review.userId]?.profilImg ||
                                "/default-avatar.png" // Ensure you have this in your /public folder
                              }
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-medium text-slate-800">
                              {users[review.userId]?.firstName || "Deleted"}{" "}
                              {users[review.userId]?.lastName || "User"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap text-sm">
                          <div className="font-medium text-sky-700">
                            {services[review.offerId]?.name || "Deleted Service"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {(() => {
                              const typeDisplayMap: Record<string, string> = {
                                activities: "Activity",
                                cars: "Car",
                                restaurants: "Restaurant",
                                accommodations: "Accommodation",
                              };
                              return typeDisplayMap[review.type] || review.type;
                            })()}
                          </div>
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap">
                          {renderStars(review.rating, review.id)}
                        </td>
                        <td
                          className="py-3 px-5 max-w-xs truncate text-sm text-slate-600"
                          title={review.comment}
                        >
                          {review.comment}
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap">
                          <button
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleDeleteInitiate(review);
                            }}
                            disabled={deleting === review.id}
                            title="Delete review"
                          >
                            {deleting === review.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Deletion Confirmation Modal */}
      {showConfirmModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out ${
            showConfirmModal ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-md w-11/12 transform transition-all duration-300 ease-in-out ${
              showConfirmModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-slate-800">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete this review?
              {showConfirmModal.comment && (
                <span className="block mt-2 text-sm italic">
                  &quot;{showConfirmModal.comment.substring(0, 50)}...&quot;
                </span>
              )}
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="flex items-center justify-center w-full sm:w-auto bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-60"
                onClick={confirmDelete}
                disabled={!!deleting}
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5 mr-2" />
                )}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="w-full sm:w-auto bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 disabled:opacity-60"
                onClick={() => {
                  setShowConfirmModal(null);
                  // setSelectedReview(null); // Optionally clear selected if you don't want to go back to detail view
                }}
                disabled={!!deleting}
              >
                <X className="w-5 h-5 mr-1 sm:mr-0 inline sm:hidden" />{" "}
                {/* Icon for small screens */}
                <span className="hidden sm:inline">Cancel</span>{" "}
                {/* Text for larger screens */}
                <span className="sm:hidden">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminReviewsPage;
