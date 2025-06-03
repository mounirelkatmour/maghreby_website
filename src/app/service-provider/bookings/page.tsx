/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import ServiceProviderSideBar from "../../components/ServiceProviderSideBar";

interface Service {
  id: string;
  name: string;
  images: string[];
  serviceProviderId: string; // Add this to filter by provider
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
  service?: Service;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilImg?: string;
}

const ServiceProviderBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get userId from cookie
  const getUserIdFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/userId=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const userId = getUserIdFromCookie();

  useEffect(() => {
    const fetchProviderBookings = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch user
        const userRes = await fetch(
          `http://localhost:8080/api/users/${userId}`
        );
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const user = await userRes.json();
        // 2. Get user's service type (e.g., CAR, ACCOMMODATION, ACTIVITY, RESTAURANT)
        const userServiceType = user.service; // e.g. "CAR"
        let servicesUrl = "";
        if (userServiceType === "ACCOMMODATION") {
          servicesUrl = "http://localhost:8080/api/services/accommodations";
        } else if (userServiceType === "CAR") {
          servicesUrl = "http://localhost:8080/api/services/cars";
        } else if (userServiceType === "RESTAURANT") {
          servicesUrl = "http://localhost:8080/api/services/restaurants";
        } else if (userServiceType === "ACTIVITY") {
          servicesUrl = "http://localhost:8080/api/services/activities";
        } else {
          setBookings([]);
          setLoading(false);
          return;
        }
        // 3. Fetch all services of that type
        const servicesRes = await fetch(servicesUrl);
        if (!servicesRes.ok) throw new Error("Failed to fetch services");
        const allServices: Service[] = await servicesRes.json();
        // 4. Filter services by serviceProviderId === userId
        const myServices = allServices.filter(
          (s) => s.serviceProviderId === userId
        );
        // 5. Fetch bookings for each service
        const allBookings: Booking[] = [];
        for (const service of myServices) {
          const bookingsRes = await fetch(
            `http://localhost:8080/api/bookings/service/${service.id}`
          );
          if (bookingsRes.ok) {
            const serviceBookings: Booking[] = await bookingsRes.json();
            allBookings.push(
              ...serviceBookings.map((b) => ({ ...b, service }))
            );
          }
        }
        setBookings(allBookings);
        // Fetch user profiles for all unique userIds in bookings
        const uniqueUserIds = Array.from(
          new Set(allBookings.map((b) => b.userId))
        );
        const userProfilesObj: Record<string, UserProfile> = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const res = await fetch(`http://localhost:8080/api/users/${uid}`);
              if (res.ok) {
                const user: UserProfile = await res.json();
                userProfilesObj[uid] = user;
              }
            } catch {}
          })
        );
        setUserProfiles(userProfilesObj);
      } catch (err: any) {
        setError(err.message || "Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchProviderBookings();
  }, [userId]);

  if (loading) return <Loader text="Your bookings are loading..." />;
  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="fixed pt-14 left-0 top-0 h-full w-64 z-40">
        <ServiceProviderSideBar />
      </div>
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="max-w-5xl mx-auto mt-16 p-6">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Bookings for My Services
          </h1>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-lg text-gray-600">
                No bookings found for your services.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const user = userProfiles[booking.userId];
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
                            <p className="text-sm text-gray-500">
                              User ID: {booking.userId}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {user && (
                                <>
                                  <img
                                    src={
                                      user.profilImg || "/default-avatar.png"
                                    }
                                    alt={user.firstName}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                  />
                                  <span className="font-medium text-gray-800">
                                    {user.firstName} {user.lastName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status.toLowerCase() === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : booking.status.toLowerCase() === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
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
                        {/* Confirm button for pending bookings - positioned at bottom right */}
                        {booking.status.toLowerCase() === "pending" && (
                          <div className="flex justify-end">
                            <button
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `http://localhost:8080/api/bookings/${booking.id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        status: "CONFIRMED",
                                        paymentStatus: "CONFIRMED",
                                      }),
                                    }
                                  );
                                  if (!res.ok)
                                    throw new Error(
                                      "Failed to confirm booking"
                                    );
                                  // Refresh bookings after update
                                  setBookings((prev) =>
                                    prev.map((b) =>
                                      b.id === booking.id
                                        ? {
                                            ...b,
                                            status: "CONFIRMED",
                                            paymentStatus: "CONFIRMED",
                                          }
                                        : b
                                    )
                                  );
                                } catch (err) {
                                  alert("Failed to confirm booking");
                                }
                              }}
                            >
                              ✓ Confirm Booking
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
    </div>
  );
};

export default ServiceProviderBookingsPage;
