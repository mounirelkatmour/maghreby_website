/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";
import {
  Star,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
} from "lucide-react";
import Loader from "@/app/components/Loader";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";

// Define the Location interface based on your error message
interface ServiceLocation {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  // Add any other properties your location object might have
}

interface Service {
  menu?: any[]; // Changed from boolean to array (adjust type as needed)
  id: string;
  name: string;
  images?: string[]; // Array of image URLs
  averageRating: number;
  serviceProviderId: string;
  description: string;
  offerType: string;
  price: number;
  // pricePerNight is not a direct property of Service; it's inside rooms
  rooms?: {
    pricePerNight?: number;
    startDate?: string;
    endDate?: string;
    maxGuests?: number;
  }[];
  pricePerDay?: number; // Optional, if applicable
  minPrice?: number; // Optional, if applicable
  location: ServiceLocation;
}

interface ServiceProvider {
  id: string;
  firstName: string;
  lastName: string;
  profilImg?: string;
}

const AdminServicesPage: React.FC = () => {
  const { loading, isAdmin } = useAdminGuard();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceProviders, setServiceProviders] = useState<
    Record<string, ServiceProvider>
  >({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<null | Service>(
    null
  );

  useEffect(() => {
    if (!loading && isAdmin) {
      async function fetchServices() {
        setError(null);
        try {
          const res = await fetch("http://localhost:8080/api/services");
          if (!res.ok) {
            throw new Error(`Failed to fetch services (status: ${res.status})`);
          }
          const data = await res.json();
          setServices(data);

          const serviceProvidersRes = await fetch(
            "http://localhost:8080/api/users"
          );
          if (!serviceProvidersRes.ok) {
            throw new Error(
              `Failed to fetch service providers (status: ${serviceProvidersRes.status})`
            );
          }
          const serviceProvidersData = await serviceProvidersRes.json();
          const serviceProvidersMap: Record<string, ServiceProvider> = {};
          serviceProvidersData.forEach((sp: any) => {
            serviceProvidersMap[sp.id] = sp;
          });
          setServiceProviders(serviceProvidersMap);
        } catch (err: any) {
          setError(err.message || "Failed to load services");
          console.error("Fetch error:", err);
        }
      }
      fetchServices();
    }
  }, [loading, isAdmin]);

  const handleDeleteInitiate = (service: Service) => {
    setSelectedService(service);
    setShowConfirmModal(service);
  };

  const confirmDelete = async () => {
    if (!showConfirmModal) return;
    const serviceToDelete = showConfirmModal;

    setDeleting(serviceToDelete.id);
    setError(null);
    try {
      const url = `http://localhost:8080/api/services/${serviceToDelete.id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Failed to delete service" }));
        throw new Error(
          errorData.message ||
            `Failed to delete service (status: ${res.status})`
        );
      }
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      if (selectedService?.id === serviceToDelete.id) {
        setSelectedService(null);
      }
      setShowConfirmModal(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete service");
      console.error("Delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  const renderStars = (rating: number, serviceId: string) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`${serviceId}-star-${i}`}
          className={`w-5 h-5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return <Loader text="Loading services..." />;
  }

  if (!isAdmin) return null;

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
              Manage Services
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
            <Loader text="Loading services..." />
          ) : selectedService && !showConfirmModal ? (
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={
                    selectedService.images && selectedService.images.length > 0
                      ? selectedService.images[0]
                      : "/default-service.png"
                  }
                  alt={selectedService.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h2 className="font-bold text-xl text-slate-800">
                    {selectedService.name}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Provided by:{" "}
                    <span className="font-medium text-sky-700">
                      {selectedService.serviceProviderId || "Unknown Provider"}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Service ID: {selectedService.id}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                {renderStars(selectedService.averageRating, selectedService.id)}
                <span className="font-bold text-yellow-500 text-lg">
                  ({selectedService.averageRating.toFixed(1)})
                </span>
              </div>
              <p className="mb-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedService.description || "No description available."}
              </p>
              <div className="text-slate-400 text-xs mb-8">
                Price:
                {selectedService.offerType === "cars"
                  ? selectedService.pricePerDay?.toFixed(2) || "N/A"
                  : selectedService.offerType === "accommodations"
                  ? selectedService.rooms && selectedService.rooms.length > 0
                    ? Math.min(
                        ...selectedService.rooms
                          .map((room) => room.pricePerNight ?? Infinity)
                          .filter(
                            (price) =>
                              price !== undefined &&
                              price !== null &&
                              price !== Infinity
                          )
                      ).toFixed(2)
                    : "N/A"
                  : selectedService.offerType === "activities"
                  ? selectedService.price?.toFixed(2) || "N/A"
                  : selectedService.offerType === "restaurants"
                  ? selectedService.menu && selectedService.menu.length > 0
                    ? Math.min(
                        ...selectedService.menu
                          .map((item: any) => item.price ?? Infinity)
                          .filter(
                            (price: number) =>
                              price !== undefined &&
                              price !== null &&
                              price !== Infinity
                          )
                      ).toFixed(2)
                    : "N/A"
                  : selectedService.price?.toFixed(2) || "N/A"}
                {" MAD | "}Location:{" "}
                {selectedService.location
                  ? `${selectedService.location.address}, ${selectedService.location.city}`
                  : "N/A"}
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50"
                  onClick={() => handleDeleteInitiate(selectedService)}
                  disabled={deleting === selectedService.id}
                >
                  {deleting === selectedService.id ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 mr-2" />
                  )}
                  {deleting === selectedService.id
                    ? "Deleting..."
                    : "Delete Service"}
                </button>
                <button
                  className="flex items-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
                  onClick={() => setSelectedService(null)}
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
                        Image
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service Name
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Average Rating
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service Provider
                      </th>
                      <th className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {services.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10 text-slate-500"
                        >
                          No services found.
                        </td>
                      </tr>
                    )}
                    {services.map((service) => (
                      <tr
                        key={service.id}
                        className="hover:bg-slate-50 transition-colors duration-150 ease-in-out cursor-pointer"
                        onClick={() => setSelectedService(service)}
                      >
                        <td className="py-3 px-5 whitespace-nowrap">
                          <img
                            src={
                              service.images && service.images.length > 0
                                ? service.images[0]
                                : "/default-service.png"
                            }
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap text-sm font-medium text-slate-800">
                          {service.name}
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap">
                          {renderStars(service.averageRating, service.id)}
                          <span className="ml-2 text-sm text-slate-600">
                            ({service.averageRating.toFixed(1)})
                          </span>
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap text-sm text-slate-600">
                          {service.serviceProviderId || "Unknown Provider"}
                        </td>
                        <td className="py-3 px-5 whitespace-nowrap">
                          <button
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInitiate(service);
                            }}
                            disabled={deleting === service.id}
                            title="Delete service"
                          >
                            {deleting === service.id ? (
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
          {/* Deletion Confirmation Modal */}
          {showConfirmModal && (
            <div
              className={`fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out ${
                showConfirmModal ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`bg-white p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-md w-11/12 transform transition-all duration-300 ease-in-out ${
                  showConfirmModal
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-3 text-slate-800">
                  Confirm Deletion
                </h2>
                <p className="mb-6 text-slate-600">
                  Are you sure you want to delete the service: &quot;
                  <span className="font-semibold">{showConfirmModal.name}</span>
                  &quot;? This action cannot be undone.
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
                    onClick={() => setShowConfirmModal(null)}
                    disabled={!!deleting}
                  >
                    <X className="w-5 h-5 mr-1 sm:mr-0 inline sm:hidden" />
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminServicesPage;
