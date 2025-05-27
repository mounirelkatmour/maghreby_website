/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bed,
  Utensils,
  Car as CarIcon,
  Mountain,
  MapPin,
  Star,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  fetchServiceById,
  fetchAllServices,
  Service,
  ServiceData,
  Accommodation,
  Car,
  Restaurant,
  Activity,
  addServiceToFavorites,
  removeServiceFromFavorites,
} from "../utils/fetch_services";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";
import Loader from "./Loader";

// Type guards
function isAccommodation(service: Service): service is Accommodation {
  return (
    (service as Accommodation).stars !== undefined &&
    (service as Accommodation).rooms !== undefined
  );
}
function isCar(service: Service): service is Car {
  return (
    (service as Car).brand !== undefined &&
    (service as Car).pricePerDay !== undefined
  );
}
function isRestaurant(service: Service): service is Restaurant {
  return (
    (service as Restaurant).cuisineType !== undefined &&
    (service as Restaurant).menu !== undefined
  );
}
function isActivity(service: Service): service is Activity {
  return (
    (service as Activity).duration !== undefined &&
    (service as Activity).price !== undefined
  );
}

interface DetailsPageProps {
  serviceId: string;
  serviceType: keyof ServiceData;
}

interface CarouselImage {
  src: string;
  alt: string;
}

const ImageGallery: React.FC<{
  images: CarouselImage[];
  serviceName: string;
  isFavorite: boolean;
  onFavoriteClick: () => void;
}> = ({ images, serviceName, isFavorite, onFavoriteClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleThumbnails, setVisibleThumbnails] = useState<number[]>([]);
  const maxVisibleThumbnails = 5;

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Update visible thumbnails based on current index
  useEffect(() => {
    const totalImages = images.length;
    let start = Math.max(
      0,
      currentIndex - Math.floor(maxVisibleThumbnails / 2)
    );
    const end = Math.min(totalImages, start + maxVisibleThumbnails);

    if (end - start < maxVisibleThumbnails) {
      start = Math.max(0, end - maxVisibleThumbnails);
    }

    const visibleIndices = [];
    for (let i = start; i < end; i++) {
      visibleIndices.push(i);
    }
    setVisibleThumbnails(visibleIndices);
  }, [currentIndex, images.length]);

  if (images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const scrollToThumbnail = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Thumbnail Gallery - Left Side */}
        <div className="lg:col-span-1 order-2 lg:order-1 relative">
          {/* Navigation Buttons */}
          <div className="flex flex-col items-center gap-4 absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={onFavoriteClick}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-300 hover:bg-white z-20"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`h-5 w-5 transition-colors duration-300 ${
                  isFavorite
                    ? "text-red-500 fill-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            </motion.button>

            {images.length > 1 && (
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={nextImage}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 shadow-lg z-20 transition-all duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* Thumbnails Container */}
          <div className="h-full overflow-y-auto pr-12 hide-scrollbar">
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 lg:gap-3">
              {visibleThumbnails.map((idx) => (
                <motion.div
                  key={images[idx].src}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative h-20 lg:h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    idx === currentIndex
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-1"
                  }`}
                  onClick={() => scrollToThumbnail(idx)}
                >
                  <img
                    src={images[idx].src}
                    alt={`${serviceName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      idx === currentIndex
                        ? "bg-blue-500/20"
                        : "bg-black/0 hover:bg-black/10"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Image Preview - Right Side */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="relative h-64 md:h-[32rem] lg:h-[36rem] rounded-xl overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.4 },
                }}
                className="absolute inset-0"
              >
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Bottom Right */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>

                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-lg">
                  {currentIndex + 1} / {images.length}
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "bg-white scale-125 shadow-lg"
                      : "bg-white/60"
                  }`}
                  aria-label={`Show slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

const DetailsPage: React.FC<DetailsPageProps> = ({
  serviceId,
  serviceType,
}) => {
  const [service, setService] = useState<Service | null>(null);
  const [recommendations, setRecommendations] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const router = useRouter();

  // Get userId from cookie (client-side only)
  const getUserIdFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/userId=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const userId = getUserIdFromCookie();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main service
        const fetchedService = await fetchServiceById(
          serviceType,
          serviceId,
          userId || undefined
        );
        setService(fetchedService || null);
        setIsFavorite(!!fetchedService?.isFavorite);
        console.log("isFavorite: ", fetchedService?.isFavorite);
        // Fetch recommendations (exclude current service)
        const allServices = await fetchAllServices();
        const sameTypeServices = (allServices[serviceType] || []).filter(
          (s: Service) => String(s.id) !== String(serviceId)
        );
        setRecommendations(sameTypeServices.slice(0, 4));
      } catch {
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId, serviceType, userId]);

  const handleFavoriteClick = async () => {
    if (!service || !userId) return;
    try {
      if (isFavorite) {
        await removeServiceFromFavorites(serviceType, service.id, userId);
        setIsFavorite(false);
      } else {
        await addServiceToFavorites(serviceType, service.id, userId);
        setIsFavorite(true);
      }
    } catch (err) {
      // Optionally show an error message
      console.error("Failed to update favorite:", err);
    }
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <Loader text="Loading..." />
      </div>
    );

  if (error || !service)
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 mt-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-red-600 mb-4">
                  Service Not Found
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {error || "The service you're looking for doesn't exist."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                >
                  Go Back
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 mt-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {service.images && service.images.length > 0 && (
              <ImageGallery
                images={service.images.map((src, idx) => ({
                  src,
                  alt: service.name + " " + (idx + 1),
                }))}
                serviceName={service.name}
                isFavorite={isFavorite}
                onFavoriteClick={handleFavoriteClick}
              />
            )}
          </motion.div>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 mb-8 border border-white/20"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
                >
                  {service.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center mb-4"
                >
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-2 text-lg font-semibold text-gray-800">
                      {service.averageRating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="ml-2 text-gray-600 text-sm">
                      (
                      {typeof (service as { reviewCount?: number })
                        .reviewCount === "number"
                        ? (service as { reviewCount?: number }).reviewCount
                        : 0}{" "}
                      reviews)
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center text-gray-600 mb-6"
                >
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-lg">
                    {service.location?.city}, {service.location?.country}
                  </span>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:ml-8 mt-4 lg:mt-0 flex flex-col items-end"
              >
                <div className="text-sm font-light text-slate-400 uppercase tracking-widest">
                  {isRestaurant(service) ? "From" : ""}
                </div>
                <div className="text-5xl lg:text-6xl font-light mb-1 text-slate-800">
                  {isAccommodation(service)
                    ? service.rooms && service.rooms.length > 0
                      ? Math.min(...service.rooms.map((r) => r.pricePerNight))
                      : "—"
                    : isCar(service)
                    ? service.pricePerDay
                    : isRestaurant(service)
                    ? Math.min(...service.menu.map((r) => r.price))
                    : isActivity(service)
                    ? service.price
                    : "—"}
                  <span className="text-lg font-normal text-slate-500 ml-2">
                    MAD
                  </span>
                </div>
                <div className="text-sm font-light text-slate-400 uppercase tracking-widest">
                  {isAccommodation(service)
                    ? "per night"
                    : isCar(service)
                    ? "per day"
                    : isRestaurant(service)
                    ? ""
                    : isActivity(service)
                    ? "per person"
                    : ""}
                </div>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-700 text-lg leading-relaxed mb-8 bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500"
            >
              {service.description}
            </motion.p>

            {/* Service-specific details with enhanced styling */}
            {isAccommodation(service) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Bed className="h-6 w-6 mr-3 text-blue-600" />
                    Accommodation Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-700 font-medium">Stars:</span>
                      <span className="font-bold text-gray-900">
                        {service.stars}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">Type:</span>
                      <span className="font-bold text-gray-900">
                        {service.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.amenities?.map((amenity, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        {amenity}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {isCar(service) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CarIcon className="h-6 w-6 mr-3 text-orange-600" />
                    Car Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Brand", value: service.brand },
                      { label: "Model", value: service.model },
                      { label: "Year", value: service.year },
                      { label: "Fuel Type", value: service.fuelType },
                      { label: "Transmission", value: service.transmission },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-orange-200 last:border-b-0"
                      >
                        <span className="text-gray-700 font-medium">
                          {item.label}:
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">Seats:</span>
                      <span className="font-bold flex items-center text-gray-900">
                        <Users className="h-4 w-4 mr-1" />
                        {service.seats}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isRestaurant(service) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Utensils className="h-6 w-6 mr-3 text-purple-600" />
                    Restaurant Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-purple-200">
                      <span className="text-gray-700 font-medium">
                        Cuisine:
                      </span>
                      <span className="font-bold text-gray-900">
                        {service.cuisineType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-purple-200">
                      <span className="text-gray-700 font-medium">Hours:</span>
                      <span className="font-bold text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.openingHours} - {service.closingHours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">From:</span>
                      <span className="font-bold text-gray-900">
                        {Math.min(...service.menu.map((r) => r.price))} MAD
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Menu Highlights
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {service.menu?.slice(0, 4).map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + idx * 0.1 }}
                        className="bg-white rounded-lg p-3 shadow-sm border border-pink-200"
                      >
                        <div className="font-semibold text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {item.description}
                        </div>
                        <div className="text-sm font-bold text-pink-600">
                          {item.price} MAD
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {isActivity(service) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Mountain className="h-6 w-6 mr-3 text-green-600" />
                    Activity Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">
                        Duration:
                      </span>
                      <span className="font-bold text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-lg">Book Now</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
                Similar{" "}
                {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
                    onClick={() =>
                      router.push(`/services/${serviceType}/${rec.id}`)
                    }
                  >
                    {rec.images && rec.images.length > 0 && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={rec.images[0]}
                          alt={rec.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2 truncate text-lg">
                        {rec.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-bold text-gray-800">
                            {rec.averageRating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {isAccommodation(rec)
                            ? rec.rooms && rec.rooms.length > 0
                              ? `${Math.min(
                                  ...rec.rooms.map((r) => r.pricePerNight)
                                )} MAD/night`
                              : "Price N/A"
                            : isRestaurant(rec)
                            ? `From ${Math.min(
                                ...rec.menu.map((r) => r.price)
                              )} MAD`
                            : isCar(rec)
                            ? `${rec.pricePerDay} MAD/day`
                            : isActivity(rec)
                            ? `${rec.price} MAD/person`
                            : "Price N/A"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
