/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Service } from "../serviceTypes";
import Navbar from "@/app/components/Navbar";
import ServiceProviderSideBar from "@/app/components/ServiceProviderSideBar";
import {
  Trash2,
  MapPin,
  Car,
  Activity,
  Utensils,
  Home,
  Edit3,
  Save,
  X,
  Star,
  Clock,
  Calendar,
  DollarSign,
} from "lucide-react";

const ServiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Partial<Service>>({});
  const [serviceType, setServiceType] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Get service icon based on type
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "accommodations":
        return <Home className="w-8 h-8 text-blue-600" />;
      case "cars":
        return <Car className="w-8 h-8 text-green-600" />;
      case "activities":
        return <Activity className="w-8 h-8 text-purple-600" />;
      case "restaurants":
        return <Utensils className="w-8 h-8 text-orange-600" />;
      default:
        return <MapPin className="w-8 h-8 text-gray-600" />;
    }
  };

  // Get service type display name
  const getServiceTypeName = (type: string) => {
    switch (type) {
      case "accommodations":
        return "Accommodation";
      case "cars":
        return "Car";
      case "activities":
        return "Activity";
      case "restaurants":
        return "Restaurant";
      default:
        return "Service";
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        const types = ["accommodations", "cars", "restaurants", "activities"];
        let found: Service | null = null;
        let foundType = "";
        for (const type of types) {
          const res = await fetch(
            `http://localhost:8080/api/services/${type}/${id}`
          );
          if (res.ok) {
            found = await res.json();
            foundType = type;
            break;
          }
        }
        if (!found) throw new Error("Service not found");
        setService(found);
        setForm(found);
        setServiceType(foundType);
      } catch (err) {
        setError((err as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchService();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/services/${serviceType}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to save changes");
      const updated = await res.json();
      setService(updated);
      setForm(updated);
      setIsEditing(false);
      alert("Service updated successfully!");
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (!confirm("Are you sure you want to delete this service?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/services/${serviceType}/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete service");
      alert("Service deleted successfully!");
      router.push("/service-provider/services");
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };
  const renderServiceSpecificFields = () => {
    if (!service) return null;

    const fields = [];

    // Accommodation-specific fields
    if (service.offerType === "ACCOMMODATION") {
      fields.push(
        <div key="stars" className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Rating
            </label>
            {isEditing ? (
              <input
                type="number"
                name="stars"
                min="1"
                max="5"
                value={(form as Record<string, any>)["stars"] || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              />
            ) : (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < ((service as any).stars || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {(service as any).stars || 0} stars
                </span>
              </div>
            )}
          </div>
        </div>
      );

      fields.push(
        <div key="type">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accommodation Type
          </label>
          {isEditing ? (
            <input
              type="text"
              name="type"
              value={(form as Record<string, any>)["type"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              placeholder="Hotel, Apartment, Villa, etc."
            />
          ) : (
            <p className="text-gray-900">
              {(service as any).type || "Not specified"}
            </p>
          )}
        </div>
      );

      fields.push(
        <div key="amenities">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amenities
          </label>
          {isEditing ? (
            <textarea
              name="amenities"
              value={
                Array.isArray((form as Record<string, any>)["amenities"])
                  ? (form as Record<string, any>)["amenities"].join(", ")
                  : ""
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  amenities: e.target.value
                    .split(",")
                    .map((item) => item.trim()),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              placeholder="WiFi, Pool, Parking, etc."
              rows={2}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.isArray((service as any).amenities) &&
              (service as any).amenities.length > 0 ? (
                (service as any).amenities.map(
                  (amenity: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  )
                )
              ) : (
                <p className="text-gray-500">No amenities listed</p>
              )}
            </div>
          )}
        </div>
      );
    }

    // Car-specific fields
    if (service.offerType === "CAR") {
      fields.push(
        <div key="brand">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          {isEditing ? (
            <input
              type="text"
              name="brand"
              value={(form as Record<string, any>)["brand"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
            />
          ) : (
            <p className="text-gray-900">
              {(service as any).brand || "Not specified"}
            </p>
          )}
        </div>
      );

      fields.push(
        <div key="model">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          {isEditing ? (
            <input
              type="text"
              name="model"
              value={(form as Record<string, any>)["model"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
            />
          ) : (
            <p className="text-gray-900">
              {(service as any).model || "Not specified"}
            </p>
          )}
        </div>
      );

      fields.push(
        <div key="year" className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            {isEditing ? (
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={(form as Record<string, any>)["year"] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              />
            ) : (
              <p className="text-gray-900">
                {(service as any).year || "Not specified"}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Restaurant-specific fields
    if (service.offerType === "RESTAURANT") {
      fields.push(
        <div key="cuisineType">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine Type
          </label>
          {isEditing ? (
            <input
              type="text"
              name="cuisineType"
              value={(form as Record<string, any>)["cuisineType"] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              placeholder="Italian, Chinese, Mediterranean, etc."
            />
          ) : (
            <p className="text-gray-900">
              {(service as any).cuisineType || "Not specified"}
            </p>
          )}
        </div>
      );

      fields.push(
        <div key="hours" className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operating Hours
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  name="openingHours"
                  value={(form as Record<string, any>)["openingHours"] || ""}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                />
                <input
                  type="time"
                  name="closingHours"
                  value={(form as Record<string, any>)["closingHours"] || ""}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                />
              </div>
            ) : (
              <p className="text-gray-900">
                {(service as any).openingHours && (service as any).closingHours
                  ? `${(service as any).openingHours} - ${
                      (service as any).closingHours
                    }`
                  : "Hours not specified"}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Activity-specific fields
    if (service.offerType === "ACTIVITY") {
      fields.push(
        <div key="duration" className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            {isEditing ? (
              <input
                type="text"
                name="duration"
                value={(form as Record<string, any>)["duration"] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                placeholder="e.g., 2 hours, Half day, Full day"
              />
            ) : (
              <p className="text-gray-900">
                {(service as any).duration || "Not specified"}
              </p>
            )}
          </div>
        </div>
      );

      fields.push(
        <div key="price" className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            {isEditing ? (
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={(form as Record<string, any>)["price"] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
              />
            ) : (
              <p className="text-gray-900 font-semibold">
                ${(service as any).price || "0"}
              </p>
            )}
          </div>
        </div>
      );
    }

    return fields.length > 0 ? (
      fields
    ) : (
      <p className="text-gray-500 italic">
        No additional details available for this service type.
      </p>
    );
  };
  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen bg-gray-50">
        <ServiceProviderSideBar />
        <div className="flex-1 flex flex-col w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push("/service-provider/services")}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {loading
                      ? "Loading..."
                      : service
                      ? `${service.name}`
                      : "Service Details"}
                  </h1>
                  {service && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getServiceTypeName(serviceType)}
                    </span>
                  )}
                </div>
                {service && !isEditing && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Service
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
                {isEditing && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setForm(service || {});
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading service details...
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && service && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Service Images */}
                {service.images && service.images.length > 0 && (
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                      {service.images.slice(0, 3).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-video overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${service.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {service.images.length > 3 && (
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
                        +{service.images.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* Service Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          {getServiceIcon(serviceType)}
                          <span className="ml-3">Basic Information</span>
                        </h2>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Service Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="name"
                                value={form.name || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                              />
                            ) : (
                              <p className="text-gray-900 text-lg font-medium">
                                {service.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            {isEditing ? (
                              <textarea
                                name="description"
                                value={form.description || ""}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                              />
                            ) : (
                              <p className="text-gray-600">
                                {service.description ||
                                  "No description available"}
                              </p>
                            )}
                          </div>

                          {service.location && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                              </label>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>
                                  {typeof service.location === "string"
                                    ? service.location
                                    : `${
                                        service.location.address ||
                                        service.location.city
                                      }, ${service.location.country}`}
                                </span>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            {isEditing ? (
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="active"
                                  checked={!!form.active}
                                  onChange={handleChange}
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Active
                                </span>
                              </label>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  service.active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {service.active ? "Active" : "Inactive"}
                              </span>
                            )}
                          </div>

                          {isEditing && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images (comma separated URLs)
                              </label>
                              <textarea
                                name="images"
                                value={
                                  Array.isArray(form.images)
                                    ? form.images.join(",")
                                    : ""
                                }
                                onChange={(e) =>
                                  setForm((prev: any) => ({
                                    ...prev,
                                    images: e.target.value
                                      .split(",")
                                      .filter((url) => url.trim()),
                                  }))
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service-Specific Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Service Details
                        </h3>
                        <div className="space-y-4">
                          {renderServiceSpecificFields()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetailsPage;
