/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Heart,
  Filter,
  SortAsc,
  SortDesc,
  Bed,
  Car,
  Utensils,
  Mountain,
  MapPin,
  Star,
  Clock,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import Link from "next/link";

// Type definitions
interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: "accommodations" | "cars" | "restaurants" | "activities";
  title: string;
  description?: string;
  image?: string;
  location?: string;
  price?: number;
  rating?: number;
  dateAdded: string;
  [key: string]: any;
}

type FilterType =
  | "all"
  | "accommodations"
  | "cars"
  | "restaurants"
  | "activities";
type SortType = "latest" | "earliest";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get user ID from cookie
  const getUserId = () => {
    const userId =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1] || null;
    return userId;
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);

    const userId = getUserId();
    if (!userId) {
      setError("User not logged in");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/favorites/user?userId=${userId}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const rawFavorites = await response.json();

      const enrichedFavorites = await Promise.all(
        rawFavorites.map(async (fav: any) => {
          try {
            const itemResponse = await fetch(
              `http://localhost:8080/api/services/${fav.type}/${fav.offerId}`
            );
            if (!itemResponse.ok) throw new Error();

            const itemData = await itemResponse.json();

            return {
              id: fav.id,
              userId: fav.userId,
              itemId: fav.offerId,
              itemType: fav.type,
              dateAdded: fav.createdAt,
              ...itemData, // merges title, description, image, etc.
            };
          } catch {
            return null; // silently skip if item fetch fails
          }
        })
      );

      // Filter out nulls (failed lookups)
      setFavorites(enrichedFavorites.filter(Boolean));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch favorites"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Remove favorite
  const removeFavorite = async (favoriteId: string) => {
    const favorite = favorites.find((fav) => fav.id === favoriteId);
    const userId = getUserId();
    if (!favorite || !userId) {
      console.error("Favorite or userId not found");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/services/${favorite.itemType}/${favorite.itemId}/favorites?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
        console.log("Favorite removed successfully");
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  // Filter and sort favorites
  useEffect(() => {
    let filtered = [...favorites];

    // Apply filter
    if (filterType !== "all") {
      filtered = filtered.filter((fav) => fav.itemType === filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortType === "latest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredFavorites(filtered);
  }, [favorites, filterType, sortType]);

  // Load favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Get icon for item type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "accommodations":
        return <Bed className="w-4 h-4" />;
      case "cars":
        return <Car className="w-4 h-4" />;
      case "restaurants":
        return <Utensils className="w-4 h-4" />;
      case "activities":
        return <Mountain className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "accommodations":
        return "Accommodation";
      case "cars":
        return "Car Rental";
      case "restaurants":
        return "Restaurant";
      case "activities":
        return "Activity";
      default:
        return "Item";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filterOptions = [
    { value: "all", label: "All Favorites", icon: Heart },
    { value: "accommodations", label: "Places to Stay", icon: Bed },
    { value: "cars", label: "Car Rentals", icon: Car },
    { value: "restaurants", label: "Restaurants", icon: Utensils },
    { value: "activities", label: "Activities", icon: Mountain },
  ];

  // Helper to get price for any service type (copied from services page)
  function getServicePrice(service: any, type: string | null): number {
    if (!type) return 0;
    switch (type) {
      case "accommodations":
        return Array.isArray(service.rooms)
          ? Math.min(...service.rooms.map((r: any) => r.pricePerNight))
          : 0;
      case "cars":
        return typeof service.pricePerDay === "number"
          ? service.pricePerDay
          : 0;
      case "restaurants":
        return typeof service.minPrice === "number" ? service.minPrice : 0;
      case "activities":
        return typeof service.price === "number" ? service.price : 0;
      default:
        return 0;
    }
  }

  if (isLoading) {
    return <Loader text="Loading your favorites..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchFavorites}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold text-gray-800">My Favorites</h1>
            </div>
            <p className="text-gray-600">
              Your saved places and experiences in Morocco
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-500 hover:border-slate-900 transition-colors duration-200"
              >
                <Filter className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-medium text-slate-700">
                  {filterOptions.find((opt) => opt.value === filterType)?.label}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform text-slate-700 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterType(option.value as FilterType);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-200 ${
                        filterType === option.value
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() =>
                  setSortType(sortType === "latest" ? "earliest" : "latest")
                }
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-500 hover:border-slate-900 transition-colors duration-200"
              >
                {sortType === "latest" ? (
                  <SortDesc className="w-4 h-4 text-slate-700" />
                ) : (
                  <SortAsc className="w-4 h-4 text-slate-700" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {sortType === "latest" ? "Recently Added" : "Oldest First"}
                </span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredFavorites.length} of {favorites.length} favorites
            </p>
          </div>

          {/* Favorites Grid */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filterType === "all"
                  ? "No favorites yet"
                  : `No ${filterType} favorites`}
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring Morocco and save your favorite places!
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Explore Morocco
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  href={`/services/${favorite.itemType}/${favorite.itemId}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {favorite.images && favorite.images.length > 0 ? (
                      <img
                        src={favorite.images[0]}
                        alt={favorite.title || favorite.name}
                        className="w-full h-full object-cover"
                      />
                    ) : favorite.image ? (
                      <img
                        src={favorite.image}
                        alt={favorite.title || favorite.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(favorite.itemType)}
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(favorite.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 text-slate-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      {getTypeIcon(favorite.itemType)}
                      <span className="text-xs font-medium text-slate-700">
                        {getTypeLabel(favorite.itemType)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {favorite.title || favorite.name}
                    </h3>

                    {favorite.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {favorite.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      {favorite.location &&
                      typeof favorite.location === "string" ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{favorite.location}</span>
                        </div>
                      ) : favorite.location &&
                        typeof favorite.location === "object" &&
                        favorite.location !== null &&
                        ("city" in favorite.location ||
                          "country" in favorite.location) ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {typeof (favorite.location as { city?: string })
                              .city === "string"
                              ? (favorite.location as { city?: string }).city
                              : ""}
                            {typeof (favorite.location as { city?: string })
                              .city === "string" &&
                            typeof (favorite.location as { country?: string })
                              .country === "string" &&
                            (favorite.location as { country?: string }).country
                              ? ", "
                              : ""}
                            {typeof (favorite.location as { country?: string })
                              .country === "string"
                              ? (favorite.location as { country?: string })
                                  .country
                              : ""}
                          </span>
                        </div>
                      ) : null}

                      {typeof favorite.averageRating === "number" && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{favorite.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Use getServicePrice for price display */}
                      {(() => {
                        const price = getServicePrice(
                          favorite,
                          favorite.itemType
                        );
                        return price > 0 ? (
                          <div className="text-lg font-semibold text-blue-600">
                            {price} MAD
                          </div>
                        ) : null;
                      })()}

                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Added {formatDate(favorite.dateAdded)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
