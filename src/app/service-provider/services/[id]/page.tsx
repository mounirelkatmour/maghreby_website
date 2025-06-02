/* eslint-disable @typescript-eslint/no-unused-vars */
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
  AlertTriangle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IMGBB_API_KEY = "8c92f0aa791a5e9d6864ec1f327948be";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    serviceId: string | null;
  }>({
    show: false,
    serviceId: null,
  });

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
      // Ensure 'active' is always a boolean
      const payload = {
        ...form,
        active: typeof form.active === "boolean" ? form.active : !!form.active,
      };
      const res = await fetch(
        `http://localhost:8080/api/services/${serviceType}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to save changes");
      const updated = await res.json();
      setService(updated);
      setForm(updated);
      setIsEditing(false);
      toast.success("Service updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setConfirmDelete({ show: true, serviceId: service?.id || null });
  };

  const handleDelete = async () => {
    if (!service) return;
    setConfirmDelete({ show: false, serviceId: null });
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
      toast.success("Service deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      router.push("/service-provider/services");
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const renderServiceSpecificFields = () => {
    if (!service) return null;
    return (
      <>
        {/* Accommodation-specific fields */}
        {["ACCOMMODATION", "accommodations"].includes(service.offerType) && (
          <>
            <div className="flex items-center space-x-2">
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
            <div>
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
            <div>
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
            {/* Rooms management (add/edit/delete) */}
            <div className="text-black">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rooms
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  {Array.isArray((form as any).rooms) &&
                    (form as any).rooms.map((room: any, index: number) => (
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
                              placeholder="Start Date"
                              value={room.startDate || ""}
                              onChange={(e) => {
                                const newRooms = [
                                  ...((form as any).rooms || []),
                                ];
                                newRooms[index] = {
                                  ...newRooms[index],
                                  startDate: e.target.value,
                                };
                                setForm((prev) => ({
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
                              placeholder="End Date"
                              value={room.endDate || ""}
                              onChange={(e) => {
                                const newRooms = [
                                  ...((form as any).rooms || []),
                                ];
                                newRooms[index] = {
                                  ...newRooms[index],
                                  endDate: e.target.value,
                                };
                                setForm((prev) => ({
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
                              placeholder="Price per night"
                              value={room.pricePerNight || ""}
                              onChange={(e) => {
                                const newRooms = [
                                  ...((form as any).rooms || []),
                                ];
                                newRooms[index] = {
                                  ...newRooms[index],
                                  pricePerNight: parseFloat(e.target.value),
                                };
                                setForm((prev) => ({
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
                              placeholder="Max guests"
                              value={room.maxGuests || ""}
                              onChange={(e) => {
                                const newRooms = [
                                  ...((form as any).rooms || []),
                                ];
                                newRooms[index] = {
                                  ...newRooms[index],
                                  maxGuests: parseInt(e.target.value),
                                };
                                setForm((prev) => ({
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
                            const newRooms = ((form as any).rooms || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            setForm((prev) => ({ ...prev, rooms: newRooms }));
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
                        ...((form as any).rooms || []),
                        {
                          startDate: "",
                          endDate: "",
                          pricePerNight: 0,
                          maxGuests: 1,
                        },
                      ];
                      setForm((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 mt-2"
                  >
                    Add Room
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray((service as any).rooms) &&
                  (service as any).rooms.length > 0 ? (
                    (service as any).rooms.map((room: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Dates:</strong> {room.startDate} to{" "}
                          {room.endDate}
                        </p>
                        <p className="text-sm">
                          <strong>Price:</strong> {room.pricePerNight} MAD/night
                        </p>
                        <p className="text-sm">
                          <strong>Max Guests:</strong> {room.maxGuests}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No rooms available</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Car-specific fields */}
        {["CAR", "cars"].includes(service.offerType) && (
          <>
            <div>
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
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              {isEditing ? (
                <select
                  name="fuelType"
                  value={(form as Record<string, any>)["fuelType"] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fuelType: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                >
                  <option value="">Select fuel type</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="GASOLINE">Gasoline</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ELECTRIC">Electric</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {(service as any).fuelType || "Not specified"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="licencePlate"
                  value={(form as Record<string, any>)["licencePlate"] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                />
              ) : (
                <p className="text-gray-900">
                  {(service as any).licencePlate || "Not specified"}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Day
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pricePerDay"
                    min="0"
                    step="0.01"
                    value={(form as Record<string, any>)["pricePerDay"] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">
                    {(service as any).pricePerDay || "N/A"} MAD
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Seats
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="seats"
                  min="1"
                  value={(form as Record<string, any>)["seats"] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                />
              ) : (
                <p className="text-gray-900">
                  {(service as any).seats || "Not specified"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
              {isEditing ? (
                <select
                  name="transmission"
                  value={(form as Record<string, any>)["transmission"] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
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
              ) : (
                <p className="text-gray-900">
                  {(service as any).transmission || "Not specified"}
                </p>
              )}
            </div>
          </>
        )}

        {/* Restaurant-specific fields */}
        {["RESTAURANT", "restaurants"].includes(service.offerType) && (
          <>
            <div>
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
            <div className="flex items-center space-x-2">
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
                      value={
                        (form as Record<string, any>)["openingHours"] || ""
                      }
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                    />
                    <input
                      type="time"
                      name="closingHours"
                      value={
                        (form as Record<string, any>)["closingHours"] || ""
                      }
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {(service as any).openingHours &&
                    (service as any).closingHours
                      ? `${(service as any).openingHours} - ${
                          (service as any).closingHours
                        }`
                      : "Hours not specified"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Price
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    value={(form as Record<string, any>)["minPrice"] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">
                    ${(service as any).minPrice || "0"}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menu Items
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  {Array.isArray((form as any).menu) &&
                    (form as any).menu.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name || ""}
                          onChange={(e) => {
                            const newMenu = [...((form as any).menu || [])];
                            newMenu[index] = {
                              ...newMenu[index],
                              name: e.target.value,
                            };
                            setForm((prev) => ({ ...prev, menu: newMenu }));
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm mb-2"
                        />
                        <textarea
                          placeholder="Description"
                          value={item.description || ""}
                          onChange={(e) => {
                            const newMenu = [...((form as any).menu || [])];
                            newMenu[index] = {
                              ...newMenu[index],
                              description: e.target.value,
                            };
                            setForm((prev) => ({ ...prev, menu: newMenu }));
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm mb-2"
                          rows={2}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price || ""}
                          onChange={(e) => {
                            const newMenu = [...((form as any).menu || [])];
                            newMenu[index] = {
                              ...newMenu[index],
                              price: parseFloat(e.target.value),
                            };
                            setForm((prev) => ({ ...prev, menu: newMenu }));
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newMenu = ((form as any).menu || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            setForm((prev) => ({ ...prev, menu: newMenu }));
                          }}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove Item
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newMenu = [
                        ...((form as any).menu || []),
                        { name: "", description: "", price: 0 },
                      ];
                      setForm((prev) => ({ ...prev, menu: newMenu }));
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add Menu Item
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray((service as any).menu) &&
                  (service as any).menu.length > 0 ? (
                    (service as any).menu.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        <p className="text-sm font-semibold">${item.price}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No menu items available</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Activity-specific fields */}
        {["ACTIVITY", "activities"].includes(service.offerType) && (
          <>
            <div className="flex items-center space-x-2">
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
            <div className="flex items-center space-x-2">
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
          </>
        )}

        {/* Fallback for unknown service type */}
        {![
          "ACCOMMODATION",
          "accommodations",
          "CAR",
          "cars",
          "RESTAURANT",
          "restaurants",
          "ACTIVITY",
          "activities",
        ].includes(service.offerType) && (
          <p className="text-gray-500 italic">
            No additional details available for this service type.
          </p>
        )}
      </>
    );
  };
  const handleServiceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (!data.success) throw new Error("Image upload failed");
      const directImageUrl = data.data.url;
      // Update images array in form state
      setForm((prev: any) => ({
        ...prev,
        images:
          prev.images && Array.isArray(prev.images)
            ? [directImageUrl, ...prev.images.slice(1)]
            : [directImageUrl],
      }));
      toast.success("Image uploaded!", { position: "bottom-right" });
    } catch (err) {
      toast.error("Failed to upload image", { position: "bottom-right" });
    } finally {
      setUploadingImage(false);
    }
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
                      onClick={handleDeleteClick}
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
                {/* Service Images (Profile-style) */}
                <div className="flex flex-col items-center pt-4 mb-6">
                  <div className="relative group mb-2">
                    <label
                      htmlFor="serviceImageUpload"
                      className="block cursor-pointer"
                    >
                      <img
                        src={
                          (isEditing && form.images && form.images[0]) ||
                          (service.images && service.images[0]) ||
                          "/default-avatar.png"
                        }
                        alt="Service Main"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-200 transition-all duration-300 group-hover:ring-blue-300"
                        style={{ objectFit: "cover" }}
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold">
                            Change Image
                          </span>
                        </div>
                      )}
                    </label>
                    {isEditing && (
                      <input
                        type="file"
                        id="serviceImageUpload"
                        accept="image/*"
                        onChange={handleServiceImageUpload}
                        className="hidden"
                      />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">Main Image</span>
                </div>

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
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    name="locationCity"
                                    value={
                                      typeof form.location === "object"
                                        ? form.location?.city || ""
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        location: {
                                          ...prev.location,
                                          city: e.target.value,
                                          address: prev.location?.address || "",
                                          country: prev.location?.country || "",
                                          type: prev.location?.type || "Point",
                                          coordinates: prev.location
                                            ?.coordinates || [0, 0],
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                    placeholder="City"
                                  />
                                  <input
                                    type="text"
                                    name="locationAddress"
                                    value={
                                      typeof form.location === "object"
                                        ? form.location?.address || ""
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        location: {
                                          ...prev.location,
                                          address: e.target.value,
                                          city: prev.location?.city || "",
                                          country: prev.location?.country || "",
                                          type: prev.location?.type || "Point",
                                          coordinates: prev.location
                                            ?.coordinates || [0, 0],
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                                    placeholder="Address"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span>
                                    {typeof service.location === "string"
                                      ? service.location
                                      : `${
                                          service.location.address ||
                                          service.location.city
                                        }, ${service.location.country || ""}`}
                                  </span>
                                </div>
                              )}
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
    </>
  );
};

export default ServiceDetailsPage;
