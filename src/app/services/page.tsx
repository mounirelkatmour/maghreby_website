/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  addServiceToFavorites,
  removeServiceFromFavorites,
  fetchAllServices,
  Service,
  ServiceData,
} from "@/app/utils/fetch_services";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import {
  Bed,
  Utensils,
  Car,
  Mountain,
  MapPin,
  Heart,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import Loader from "../components/Loader";

// Type for our filter state
type FilterState = {
  minPrice: number | "";
  maxPrice: number | "";
  searchQuery: string;
  cityQuery: string; // <-- Added for city search
  sortBy: "name" | "price" | "rating";
  sortOrder: "asc" | "desc";
};

type ViewType = "grid" | "list";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const validTypes = [
    "accommodations",
    "cars",
    "restaurants",
    "activities",
  ] as const;
  type ValidType = (typeof validTypes)[number];
  const type =
    typeParam && validTypes.includes(typeParam as ValidType)
      ? (typeParam as keyof ServiceData)
      : null;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    searchQuery: "",
    cityQuery: "", // <-- Added for city search
    sortBy: "name",
    sortOrder: "asc",
  });

  // Favorite state for each service
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});

  // Helper to get userId from cookie
  const getUserIdFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/userId=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const userId = getUserIdFromCookie();

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        // Pass userId to fetchAllServices so backend can return isFavorite for each service
        const data = await fetchAllServices(userId || undefined);

        if (
          !type ||
          !["accommodations", "cars", "restaurants", "activities"].includes(
            type
          )
        ) {
          router.push("/404");
          return;
        }

        setServices(data[type] || []);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [type, router, userId]);

  // Initialize favoriteMap when services change
  useEffect(() => {
    const map: Record<string, boolean> = {};
    services.forEach((service) => {
      map[service.id] = !!service.isFavorite;
    });
    setFavoriteMap(map);
  }, [services]);

  // Log unique cities available in the loaded services
  useEffect(() => {
    const citySet = new Set<string>();
    services.forEach((service) => {
      // Try both location.city and address.city for compatibility
      let city = "";
      if ("location" in service && service.location && service.location.city) {
        city = service.location.city;
      } else if (
        "address" in service &&
        service.location &&
        service.location.city
      ) {
        city = service.location.city;
      }
      if (city) citySet.add(city);
    });
    // Log the unique cities
    console.log("Available cities:", Array.from(citySet));
  }, [services]);

  const filteredServices = services
    .filter((service) => {
      // Filter by search query
      if (
        filters.searchQuery &&
        !service.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !service.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by city query
      if (filters.cityQuery) {
        let city = "";
        if (
          "location" in service &&
          service.location &&
          service.location.city
        ) {
          city = service.location.city.toLowerCase();
        } else if (
          "address" in service &&
          service.address &&
          (service.address as { city?: string }).city
        ) {
          city = (
            (service.address as { city?: string }).city || ""
          ).toLowerCase();
        }
        if (!city.includes(filters.cityQuery.toLowerCase())) {
          return false;
        }
      }

      // Filter by price range based on service type
      if (filters.minPrice !== "" && type) {
        const minPrice = Number(filters.minPrice);

        if (type === "accommodations" && "rooms" in service) {
          const minRoomPrice = Math.min(
            ...service.rooms.map((r) => r.pricePerNight)
          );
          if (minRoomPrice < minPrice) return false;
        } else if (type === "cars" && "pricePerDay" in service) {
          if (service.pricePerDay < minPrice) return false;
        } else if (type === "restaurants" && "minPrice" in service) {
          if (service.minPrice < minPrice) return false;
        } else if (type === "activities" && "price" in service) {
          if (service.price < minPrice) return false;
        }
      }

      if (filters.maxPrice !== "" && type) {
        const maxPrice = Number(filters.maxPrice);

        if (type === "accommodations" && "rooms" in service) {
          const maxRoomPrice = Math.max(
            ...service.rooms.map((r) => r.pricePerNight)
          );
          if (maxRoomPrice > maxPrice) return false;
        } else if (type === "cars" && "pricePerDay" in service) {
          if (service.pricePerDay > maxPrice) return false;
        } else if (type === "restaurants" && "minPrice" in service) {
          if (service.minPrice > maxPrice) return false;
        } else if (type === "activities" && "price" in service) {
          if (service.price > maxPrice) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;

      switch (filters.sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "price":
          const aPrice = getServicePrice(a, type);
          const bPrice = getServicePrice(b, type);
          compareValue = aPrice - bPrice;
          break;
        case "rating":
          compareValue = (a.averageRating || 0) - (b.averageRating || 0);
          break;
      }

      return filters.sortOrder === "asc" ? compareValue : -compareValue;
    });

  function getServicePrice(service: Service, type: string | null): number {
    if (!type) return 0;

    switch (type) {
      case "accommodations":
        return "rooms" in service
          ? Math.min(...service.rooms.map((r) => r.pricePerNight))
          : 0;
      case "cars":
        return "pricePerDay" in service ? service.pricePerDay : 0;
      case "restaurants":
        return "minPrice" in service ? service.minPrice : 0;
      case "activities":
        return "price" in service ? service.price : 0;
      default:
        return 0;
    }
  }

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "minPrice" || name === "maxPrice"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      searchQuery: "",
      cityQuery: "", // <-- Reset city query
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const handleFavoriteClick = async (
    service: Service,
    type: keyof ServiceData
  ) => {
    if (!userId) return;
    try {
      if (favoriteMap[service.id]) {
        await removeServiceFromFavorites(type, service.id, userId);
        setFavoriteMap((prev) => ({ ...prev, [service.id]: false }));
      } else {
        await addServiceToFavorites(type, service.id, userId);
        setFavoriteMap((prev) => ({ ...prev, [service.id]: true }));
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: keyof ServiceData | null) => {
    switch (type) {
      case "accommodations":
        return "Places to Stay";
      case "cars":
        return "Car Rentals";
      case "restaurants":
        return "Restaurants";
      case "activities":
        return "Activities";
      default:
        return "Services";
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 mt-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {getTypeLabel(type)}
          </h1>

          {/* Enhanced Filter Panel */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters & Search
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Search
                </label>
                <input
                  type="text"
                  name="searchQuery"
                  value={filters.searchQuery}
                  onChange={handleFilterChange}
                  placeholder="Search by name or description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏙️ City
                </label>
                <input
                  type="text"
                  name="cityQuery"
                  value={filters.cityQuery}
                  onChange={handleFilterChange}
                  placeholder="Search by city..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Min Price (MAD)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min price"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Max Price (MAD)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max price"
                  min={filters.minPrice || 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Sort Options
                </label>
                <div className="space-y-3">
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="rating">Sort by Rating</option>
                  </select>

                  <select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  >
                    <option value="asc">
                      {filters.sortBy === "price"
                        ? "Lowest to Highest"
                        : filters.sortBy === "rating"
                        ? "Lowest to Highest"
                        : "A to Z"}
                    </option>
                    <option value="desc">
                      {filters.sortBy === "price"
                        ? "Highest to Lowest"
                        : filters.sortBy === "rating"
                        ? "Highest to Lowest"
                        : "Z to A"}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                🔄 Reset All Filters
              </button>

              {/* View Type Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewType("grid")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      viewType === "grid"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4 inline mr-1" />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewType("list")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      viewType === "list"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    aria-label="List view"
                  >
                    <ListIcon className="w-4 h-4 inline mr-1" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredServices.length}</span>{" "}
              of <span className="font-semibold">{services.length}</span>{" "}
              {filteredServices.length === 1 ? "result" : "results"}
            </p>
          </div>

          {/* Services display */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No services found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <div className="mt-6">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  🔄 Reset all filters
                </button>
              </div>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${type}/${service.id}`}
                  className="group"
                >
                  <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-blue-300 relative">
                    {service.images && service.images[0] && (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFavoriteClick(service, type!);
                          }}
                          className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-300"
                          aria-label={
                            favoriteMap[service.id]
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors duration-300 ${
                              favoriteMap[service.id]
                                ? "text-red-500 fill-red-500"
                                : "text-gray-600 hover:text-red-500"
                            }`}
                          />
                        </button>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h3>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <svg
                            className="h-4 w-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm font-medium text-gray-700">
                            {service.averageRating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-600 line-clamp-2 flex-grow">
                        {service.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-lg font-bold text-blue-600">
                          {type === "accommodations" && "rooms" in service
                            ? `From ${Math.min(
                                ...service.rooms.map((r) => r.pricePerNight)
                              )} MAD`
                            : type === "cars" && "pricePerDay" in service
                            ? `${service.pricePerDay} MAD/day`
                            : type === "restaurants" && "minPrice" in service
                            ? `From ${service.minPrice} MAD`
                            : type === "activities" && "price" in service
                            ? `${service.price} MAD`
                            : "Price not available"}
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {type
                            ? `${type.charAt(0).toUpperCase()}${type.slice(
                                1,
                                -1
                              )}`
                            : "Service"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Enhanced Luxurious List View */
            <div className="space-y-6">
              {filteredServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${type}/${service.id}`}
                  className="group block"
                >
                  <div className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gold-300 relative">
                    <div className="flex flex-col md:flex-row">
                      {service.images && service.images[0] && (
                        <div className="h-full w-full md:w-64 flex-shrink-0 relative min-h-[12rem] md:h-auto">
                          <img
                            src={service.images[0]}
                            alt={service.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            style={{ position: "absolute", inset: 0 }}
                          />
                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleFavoriteClick(service, type!);
                            }}
                            className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-300"
                            aria-label={
                              favoriteMap[service.id]
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <Heart
                              className={`h-5 w-5 transition-colors duration-300 ${
                                favoriteMap[service.id]
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600 hover:text-red-500"
                              }`}
                            />
                          </button>
                        </div>
                      )}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {service.name}
                            </h3>
                            <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full shadow-sm">
                              <svg
                                className="h-5 w-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1.5 text-sm font-semibold text-gray-800">
                                {service.averageRating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-base mb-4 line-clamp-3 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Features/Amenities Section */}
                          <div className="mt-2 mb-4">
                            <div className="flex flex-wrap gap-2">
                              {type === "accommodations" &&
                                "rooms" in service && (
                                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium inline-flex items-center">
                                    <Bed
                                      className="w-3.5 h-3.5 mr-1"
                                      strokeWidth={2}
                                    />
                                    {service.rooms.length} Room Types
                                  </span>
                                )}
                              {type === "restaurants" && (
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium inline-flex items-center">
                                  <Utensils
                                    className="w-3.5 h-3.5 mr-1"
                                    strokeWidth={2}
                                  />
                                  Restaurant
                                </span>
                              )}
                              {type === "cars" && (
                                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium inline-flex items-center">
                                  <Car
                                    className="w-3.5 h-3.5 mr-1"
                                    strokeWidth={2}
                                  />
                                  Vehicle
                                </span>
                              )}
                              {type === "activities" && (
                                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium inline-flex items-center">
                                  <Mountain
                                    className="w-3.5 h-3.5 mr-1"
                                    strokeWidth={2}
                                  />
                                  Activity
                                </span>
                              )}
                              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium inline-flex items-center">
                                <MapPin
                                  className="w-3.5 h-3.5 mr-1"
                                  strokeWidth={2}
                                />
                                {("address" in service
                                  ? (service as { address?: { city?: string } })
                                      .address?.city
                                  : null) || "Location Available"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                              Starting From
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                              {type === "accommodations" && "rooms" in service
                                ? `${Math.min(
                                    ...service.rooms.map((r) => r.pricePerNight)
                                  )} MAD`
                                : type === "cars" && "pricePerDay" in service
                                ? `${service.pricePerDay} MAD/day`
                                : type === "restaurants" &&
                                  "minPrice" in service
                                ? `${service.minPrice} MAD`
                                : type === "activities" && "price" in service
                                ? `${service.price} MAD`
                                : "Price not available"}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="group-hover:translate-x-1 transition-transform duration-200 text-blue-600 font-medium flex items-center">
                              View Details
                              <svg
                                className="ml-2 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
