/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Loader from "../components/Loader";

interface Service {
  id: string;
  name: string;
  images: string[];
}

interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  service?: Service; // Add service details
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Get userId from cookie
  const getUserIdFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/userId=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const userId = getUserIdFromCookie();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:8080/api/bookings/user/${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();

        // Fetch service details for each booking
        const bookingsWithServices = await Promise.all(
          data.map(async (booking: Booking) => {
            try {
              const serviceRes = await fetch(
                `http://localhost:8080/api/services/${booking.serviceId}`
              );
              if (serviceRes.ok) {
                const serviceData = await serviceRes.json();
                return { ...booking, service: serviceData };
              }
              return booking;
            } catch (err) {
              return booking;
            }
          })
        );

        setBookings(bookingsWithServices);
      } catch (err: any) {
        setError(err.message || "Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [userId]);

  const handleCancel = async (bookingId: string) => {
    setCancelingId(bookingId);
    try {
      const res = await fetch(
        `http://localhost:8080/api/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        }
      );
      if (!res.ok) throw new Error("Failed to cancel booking");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (err) {
      alert("Error cancelling booking");
    } finally {
      setCancelingId(null);
    }
  };

  const today = new Date();

  if (loading) return <Loader />;
  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-16 p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg text-gray-600">
              You don&apos;t have any bookings yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const canCancel =
                new Date(booking.startDate) > today &&
                booking.status.toLowerCase() !== "cancelled";
              const statusColors = {
                confirmed: "bg-green-100 text-green-800",
                pending: "bg-yellow-100 text-yellow-800",
                cancelled: "bg-red-100 text-red-800",
                completed: "bg-blue-100 text-blue-800",
              };
              const statusColor =
                statusColors[
                  booking.status.toLowerCase() as keyof typeof statusColors
                ] || "bg-gray-100 text-gray-800";

              return (
                <div
                  key={booking.id}
                  className="border rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="md:flex">
                    {/* Service Image */}
                    <div className="md:w-1/3 relative">
                      {booking.service?.images[0] ? (
                        <div className="h-48 md:h-full">
                          <img
                            src={booking.service.images[0]}
                            alt={booking.service?.name || "Service"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 md:h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="p-5 md:w-2/3">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            {booking.service?.name ||
                              "Service Name Not Available"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Booking ID: {booking.id}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="text-slate-900 font-medium">
                            {new Date(booking.startDate).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="text-slate-900 font-medium">
                            {new Date(booking.endDate).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-slate-900 font-medium text-lg">
                            {booking.amount} MAD
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Payment Status
                          </p>
                          <p className="text-slate-900 font-medium">
                            {booking.paymentStatus}
                          </p>
                        </div>
                      </div>

                      {canCancel &&
                        booking.status.toLowerCase() !== "cancelled" && (
                          <div className="mt-4 flex justify-end">
                            <button
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelingId === booking.id}
                            >
                              {cancelingId === booking.id
                                ? "Cancelling..."
                                : "Cancel Booking"}
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
