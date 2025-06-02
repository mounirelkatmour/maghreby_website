/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { Service, ServiceResponse, User } from "./serviceTypes";
import Navbar from "@/app/components/Navbar";
import ServiceProviderSideBar from "@/app/components/ServiceProviderSideBar";
import ImageUploadSection from "../../components/ImageUploadSection";
import { useRouter } from "next/navigation";
import {
  Trash2,
  MapPin,
  Car,
  Activity,
  Utensils,
  Home,
  ChevronRight,
  Search,
  Plus,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

interface ServicesPageProps {
  userId?: string;
}

const ServicesPage: React.FC<ServicesPageProps> = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, any>>({});
  const [addLoading, setAddLoading] = useState(false);
  const [userServiceType, setUserServiceType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    serviceId: string | null;
  }>({
    show: false,
    serviceId: null,
  });
  const router = useRouter();

  // Helper to get userId from document.cookie
  const getUserIdFromCookie = (): string | undefined => {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(/(?:^|;\s*)userId=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  // Get service icon based on type
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "ACCOMMODATION":
        return <Home className="w-5 h-5 text-blue-600" />;
      case "CAR":
        return <Car className="w-5 h-5 text-green-600" />;
      case "ACTIVITY":
        return <Activity className="w-5 h-5 text-purple-600" />;
      case "RESTAURANT":
        return <Utensils className="w-5 h-5 text-orange-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  // Filter services based on search term
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteClick = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete({ show: true, serviceId });
  };

  const handleDelete = async () => {
    if (!confirmDelete.serviceId) return;
    const serviceId = confirmDelete.serviceId;
    setConfirmDelete({ show: false, serviceId: null });
    setError(null);

    try {
      let endpoint = "";
      switch (userServiceType) {
        case "ACCOMMODATION":
          endpoint = `http://localhost:8080/api/services/accommodations/${serviceId}`;
          break;
        case "CAR":
          endpoint = `http://localhost:8080/api/services/cars/${serviceId}`;
          break;
        case "ACTIVITY":
          endpoint = `http://localhost:8080/api/services/activities/${serviceId}`;
          break;
        case "RESTAURANT":
          endpoint = `http://localhost:8080/api/services/restaurants/${serviceId}`;
          break;
        default:
          throw new Error("Unknown service type");
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete service");

      toast.success("Service deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      toast.error((err as Error).message || "An error occurred", {
        position: "top-right",
        autoClose: 5000,
      });
      setError((err as Error).message || "An error occurred");
    }
  };

  useEffect(() => {
    const userId = getUserIdFromCookie() || "1";
    setUserId(userId);
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user
        const userRes = await fetch(
          `http://localhost:8080/api/users/${userId}`
        );
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const user: User = await userRes.json();

        let serviceUrl = "";
        switch (user.service) {
          case "ACCOMMODATION":
            serviceUrl = "http://localhost:8080/api/services/accommodations";
            break;
          case "CAR":
            serviceUrl = "http://localhost:8080/api/services/cars";
            break;
          case "ACTIVITY":
            serviceUrl = "http://localhost:8080/api/services/activities";
            break;
          case "RESTAURANT":
            serviceUrl = "http://localhost:8080/api/services/restaurants";
            break;
          default:
            throw new Error("Unknown service type");
        }

        const serviceRes = await fetch(serviceUrl);
        if (!serviceRes.ok) throw new Error("Failed to fetch services");
        const serviceDataRaw = await serviceRes.json();

        let serviceArray: Service[] = [];
        if (Array.isArray(serviceDataRaw)) {
          serviceArray = serviceDataRaw;
        } else if (Array.isArray(serviceDataRaw.data)) {
          serviceArray = serviceDataRaw.data;
        } else {
          serviceArray = [];
        }

        const filteredServices = serviceArray.filter(
          (service: Service) => service.serviceProviderId === user.id
        );
        setServices(filteredServices);
        setUserServiceType(user.service);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "An error occurred");
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    try {
      let endpoint = "";
      const now = new Date().toISOString();
      const payload = {
        ...addForm,
        serviceProviderId: userId,
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      switch (userServiceType) {
        case "ACCOMMODATION":
          endpoint = "http://localhost:8080/api/services/accommodations";
          break;
        case "CAR":
          endpoint = "http://localhost:8080/api/services/cars";
          break;
        case "ACTIVITY":
          endpoint = "http://localhost:8080/api/services/activities";
          break;
        case "RESTAURANT":
          endpoint = "http://localhost:8080/api/services/restaurants";
          break;
        default:
          throw new Error("Unknown service type");
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add service");

      const newService = await res.json();
      setServices((prev) => [newService, ...prev]);
      setShowAddForm(false);
      setAddForm({});

      toast.success("Service added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      toast.error((err as Error).message || "An error occurred", {
        position: "top-right",
        autoClose: 5000,
      });
      setError((err as Error).message || "An error occurred");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen bg-gray-50">
        <ServiceProviderSideBar />
        <div className="flex-1 flex flex-col w-full max-w-screen-xl mx-auto">
          <div className="bg-white shadow-sm border-b">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  My Services
                </h1>
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading services...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-3">
                      <MapPin className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No services found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by adding your first service"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredServices.map((service, index) => (
                      <div
                        key={service.id}
                        className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() =>
                          router.push(
                            `/service-provider/services/${service.id}`
                          )
                        }
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Image Placeholder - Replace with actual image */}
                          <div className="flex-shrink-0">
                            {service.images && service.images.length > 0 ? (
                              <img
                                src={service.images[0]}
                                alt={service.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                {getServiceIcon(service.offerType)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p
                                className="text-sm text-gray-500 mt-1 overflow-hidden"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {service.description}
                              </p>
                            )}
                            {service.location && (
                              <div className="flex items-center mt-2 text-sm text-gray-400 truncate">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {typeof service.location === "string"
                                    ? service.location
                                    : `${service.location.address}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {" "}
                          <button
                            onClick={(e) => handleDeleteClick(service.id, e)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 overflow-y-auto py-10">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div className="flex items-center">
                {userServiceType === "ACCOMMODATION" && (
                  <Home className="w-6 h-6 text-blue-600 mr-3" />
                )}
                {userServiceType === "CAR" && (
                  <Car className="w-6 h-6 text-green-600 mr-3" />
                )}
                {userServiceType === "RESTAURANT" && (
                  <Utensils className="w-6 h-6 text-orange-600 mr-3" />
                )}
                {userServiceType === "ACTIVITY" && (
                  <Activity className="w-6 h-6 text-purple-600 mr-3" />
                )}
                <h2 className="text-xl font-bold text-gray-800">
                  Add New{" "}
                  {userServiceType.charAt(0) +
                    userServiceType.slice(1).toLowerCase()}{" "}
                  Service
                </h2>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowAddForm(false)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleAddService} className="space-y-6">
                {/* Image Upload Section */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Service Images
                  </h3>
                  <ImageUploadSection
                    addForm={addForm}
                    setAddForm={setAddForm}
                  />
                </div>

                {/* Basic Information Section */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={addForm.name || ""}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                        placeholder="Enter service name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={addForm.description || ""}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                        placeholder="Describe your service"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={addForm.location?.city || ""}
                          onChange={(e) =>
                            setAddForm((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                city: e.target.value,
                                type: "Point",
                                coordinates: [0, 0],
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={addForm.location?.address || ""}
                          onChange={(e) =>
                            setAddForm((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                address: e.target.value,
                                type: "Point",
                                coordinates: [0, 0],
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          placeholder="Street address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service-Specific Fields */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Service Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dynamic fields by type */}
                    {userServiceType === "ACCOMMODATION" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={addForm.type || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          >
                            <option value="">Select type</option>
                            <option value="HOTEL">Hotel</option>
                            <option value="HOSTEL">Hostel</option>
                            <option value="VILLA">Villa</option>
                            <option value="APARTMENT">Apartment</option>
                            <option value="RIAD">Riad</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stars
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={addForm.stars || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                stars: parseInt(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amenities (comma separated)
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(addForm.amenities)
                                ? addForm.amenities.join(", ")
                                : addForm.amenities || ""
                            }
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                amenities: e.target.value
                                  .split(",")
                                  .map((a) => a.trim())
                                  .filter((a) => a),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="WiFi, Pool, Parking, etc."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rooms
                          </label>
                          <div className="space-y-3">
                            {Array.isArray(addForm.rooms) &&
                              addForm.rooms.length > 0 &&
                              addForm.rooms.map((room: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-2"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Start Date
                                      </label>
                                      <input
                                        type="date"
                                        value={room.startDate || ""}
                                        onChange={(e) => {
                                          const newRooms = [
                                            ...(addForm.rooms || []),
                                          ];
                                          newRooms[index] = {
                                            ...newRooms[index],
                                            startDate: e.target.value,
                                          };
                                          setAddForm((prev) => ({
                                            ...prev,
                                            rooms: newRooms,
                                          }));
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        End Date
                                      </label>
                                      <input
                                        type="date"
                                        value={room.endDate || ""}
                                        onChange={(e) => {
                                          const newRooms = [
                                            ...(addForm.rooms || []),
                                          ];
                                          newRooms[index] = {
                                            ...newRooms[index],
                                            endDate: e.target.value,
                                          };
                                          setAddForm((prev) => ({
                                            ...prev,
                                            rooms: newRooms,
                                          }));
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Price per Night (MAD)
                                      </label>
                                      <input
                                        type="number"
                                        value={room.pricePerNight || ""}
                                        onChange={(e) => {
                                          const newRooms = [
                                            ...(addForm.rooms || []),
                                          ];
                                          newRooms[index] = {
                                            ...newRooms[index],
                                            pricePerNight: parseFloat(
                                              e.target.value
                                            ),
                                          };
                                          setAddForm((prev) => ({
                                            ...prev,
                                            rooms: newRooms,
                                          }));
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Max Guests
                                      </label>
                                      <input
                                        type="number"
                                        value={room.maxGuests || ""}
                                        onChange={(e) => {
                                          const newRooms = [
                                            ...(addForm.rooms || []),
                                          ];
                                          newRooms[index] = {
                                            ...newRooms[index],
                                            maxGuests: parseInt(e.target.value),
                                          };
                                          setAddForm((prev) => ({
                                            ...prev,
                                            rooms: newRooms,
                                          }));
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newRooms = (
                                        addForm.rooms || []
                                      ).filter(
                                        (_: any, i: number) => i !== index
                                      );
                                      setAddForm((prev) => ({
                                        ...prev,
                                        rooms: newRooms,
                                      }));
                                    }}
                                    className="mt-4 p-2 rounded-sm bg-red-500 text-white text-xs hover:text-white hover:bg-red-700 duration-250"
                                  >
                                    Remove Room
                                  </button>
                                </div>
                              ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newRooms = [
                                  ...(addForm.rooms || []),
                                  {
                                    startDate: "",
                                    endDate: "",
                                    pricePerNight: 0,
                                    maxGuests: 1,
                                  },
                                ];
                                setAddForm((prev) => ({
                                  ...prev,
                                  rooms: newRooms,
                                }));
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 mt-2"
                            >
                              Add Room
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {userServiceType === "CAR" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand
                          </label>
                          <input
                            type="text"
                            value={addForm.brand || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                brand: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="Toyota, BMW, Mercedes, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <input
                            type="text"
                            value={addForm.model || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                model: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="Camry, X5, C-Class, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fuel Type
                          </label>
                          <select
                            value={addForm.fuelType || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                fuelType: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          >
                            <option value="">Select fuel type</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="GASOLINE">Gasoline</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ELECTRIC">Electric</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transmission
                          </label>
                          <select
                            value={addForm.transmission || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                transmission: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          >
                            <option value="">Select transmission</option>
                            <option value="MANUAL">Manual</option>
                            <option value="AUTOMATIC">Automatic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            License Plate
                          </label>
                          <input
                            type="text"
                            value={addForm.licencePlate || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                licencePlate: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="ABC-123"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Seats
                          </label>
                          <input
                            type="number"
                            value={addForm.seats || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                seats: parseInt(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price Per Day (MAD)
                          </label>
                          <input
                            type="number"
                            value={addForm.pricePerDay || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                pricePerDay: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="500"
                          />
                        </div>
                      </>
                    )}
                    {userServiceType === "RESTAURANT" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cuisine Type
                          </label>
                          <input
                            type="text"
                            value={addForm.cuisineType || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                cuisineType: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="Italian, Moroccan, Japanese, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Price (MAD)
                          </label>
                          <input
                            type="number"
                            value={addForm.minPrice || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                minPrice: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opening Hours
                          </label>
                          <input
                            type="time"
                            value={addForm.openingHours || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                openingHours: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Closing Hours
                          </label>
                          <input
                            type="time"
                            value={addForm.closingHours || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                closingHours: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          />
                        </div>
                      </>
                    )}
                    {userServiceType === "ACTIVITY" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={addForm.duration || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                duration: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="2 hours, Half day, Full day, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (MAD)
                          </label>
                          <input
                            type="number"
                            value={addForm.price || ""}
                            onChange={(e) =>
                              setAddForm((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                            placeholder="300"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    {addLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Adding Service...
                      </span>
                    ) : (
                      "Add Service"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between bg-red-50 p-5">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Confirm Deletion
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setConfirmDelete({ show: false, serviceId: null })
                }
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-gray-600">
                Are you sure you want to delete this service? This action cannot
                be undone.
              </p>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setConfirmDelete({ show: false, serviceId: null })
                  }
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default ServicesPage;
