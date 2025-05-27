/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  ArrowRight,
  Plane,
  Car as CarIcon,
  Utensils,
  Camera,
  LucideIcon,
  Loader2,
} from "lucide-react";
import NavbarComponent from "./components/Navbar";
import { fetchAllServices, Service } from "./utils/fetch_services";
import { Accommodation, Car, Restaurant, Activity } from "./utils/fetch_services";
import { useRouter } from "next/navigation";
import Loader from "./components/Loader";

// Type definitions
interface ServiceCardProps {
  service: Service;
  category: string;
}

interface CarouselImage {
  src: string;
  alt: string;
}

interface AutoCarouselProps {
  images: CarouselImage[];
}

interface ServiceSectionProps {
  title: string;
  services: Service[];
  category: string;
  icon: LucideIcon;
}

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Reusable Service Card Component
const ServiceCard: React.FC<ServiceCardProps> = ({ service, category }) => {
  const [isLiked, setIsLiked] = useState(service.isFavorite ?? false);

  // Type guards

  const isAccommodation = (s: Service): s is Accommodation =>
    "stars" in s && "rooms" in s;
  const isCar = (s: Service): s is Car =>
    "brand" in s && "pricePerDay" in s;
  const isRestaurant = (s: Service): s is Restaurant =>
    "cuisineType" in s && "minPrice" in s;
  const isActivity = (s: Service): s is Activity =>
    "duration" in s && "price" in s;

  // Get display fields
  const displayName = service.name;
  const displayImage = service.images && service.images.length > 0 ? service.images[0] : "/placeholder-image.jpg";
  let displayPrice = "";
  let extraInfo: React.ReactNode = null;

  if (isAccommodation(service)) {
    // Show lowest room price if available
    const minRoom = service.rooms && service.rooms.length > 0
      ? Math.min(...service.rooms.map(r => r.pricePerNight))
      : undefined;
    displayPrice = minRoom ? `${minRoom} MAD/night` : "Price on request";
    extraInfo = <div className="text-xs text-gray-500 mt-1">⭐ {service.stars} • {service.type}</div>;
  } else if (isCar(service)) {
    displayPrice = `${service.pricePerDay} MAD/day`;
    extraInfo = <div className="text-xs text-gray-500 mt-1">{service.brand} {service.model} • {service.year} • {service.seats} seats</div>;
  } else if (isRestaurant(service)) {
    displayPrice = `${service.minPrice} MAD/person`;
    extraInfo = <div className="text-xs text-gray-500 mt-1">Cuisine: {service.cuisineType}</div>;
  } else if (isActivity(service)) {
    displayPrice = `${service.price} MAD/person`;
    extraInfo = <div className="text-xs text-gray-500 mt-1">Duration: {service.duration}</div>;
  } else {
    displayPrice = "Price on request";
  }

  const router = useRouter();
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      onClick={() => router.push(`/services/${category}/${service.id}`)} // This endpoint redirects to the details page of the service, with the service ID and type as query param.
      style={{ cursor: "pointer" }}
    >
      <div className="relative overflow-hidden">
        <img
          src={displayImage}
          alt={displayName}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>
        {service.averageRating !== undefined && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{service.averageRating}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <MapPin size={14} />
          <span className="text-sm">
            {/* Show address/city if available, fallback to 'N/A' */}
            {service.location && (service.location.address || service.location.city) ?
              `${service.location.address ? service.location.address + ', ' : ''}${service.location.city ?? ''}`.trim().replace(/,$/, '') :
              'N/A'}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {displayPrice}
            </span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

//Navbar Component
// User type definition
interface User {
  name?: string;
  picture?: string;
  [key: string]: string | number | boolean | undefined | null;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user authentication status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const userData = JSON.parse(text);
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-blue-100/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Travel-friendly Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-white overflow-hidden">
            <img
              src="https://iili.io/3Z5wIb1.png"
              alt="Maghreby Logo"
              className="w-10 h-10 object-cover"
            />
          </div>
          <div className="text-2xl font-medium text-gray-800 tracking-tight">
            Maghreby
            <div className="text-xs text-blue-600 font-normal -mt-1">
              Discover Morocco
            </div>
          </div>
        </div>

        {/* Friendly Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700">
          <a
            href="#stays"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Places to Stay</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </a>
          <a
            href="#cars"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span>Car Rentals</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </a>
          <a
            href="#restaurants"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Local Cuisine</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </a>
          <a
            href="#activities"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 001 1h4M9 10V9a1 1 0 011-1h4a1 1 0 011 1v1"
                />
              </svg>
              <span>Experiences</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </a>
        </div>

        {/* Friendly CTA Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {isLoading ? (
            <div className="w-24 h-10 animate-pulse bg-gray-200 rounded-lg"></div>
          ) : user ? (
            <a
              href="/profile"
              className="flex items-center space-x-2 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "Profile"}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span>{user.name || "My Account"}</span>
            </a>
          ) : (
            <>
              <a
                href="/api/auth/login"
                className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Log In
              </a>
              <a
                href="/api/auth/login?screen_hint=signup"
                className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Your Journey</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-blue-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-blue-100/50 shadow-lg">
          <div className="px-6 py-6 space-y-4">
            <a
              href="#stays"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">Places to Stay</span>
            </a>
            <a
              href="#cars"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="font-medium">Car Rentals</span>
            </a>
            <a
              href="#restaurants"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-medium">Local Cuisine</span>
            </a>
            <a
              href="#activities"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 001 1h4M9 10V9a1 1 0 011-1h4a1 1 0 011 1v1"
                />
              </svg>
              <span className="font-medium">Experiences</span>
            </a>
            <div className="pt-4 space-y-3 border-t border-blue-100">
              {isLoading ? (
                <div className="h-10 animate-pulse bg-gray-200 rounded-lg mb-3"></div>
              ) : user ? (
                <>
                  <a
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "Profile"}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span>My Profile</span>
                  </a>
                  <a
                    href="/api/auth/logout"
                    className="block w-full text-left text-gray-600 font-medium py-3 px-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Out
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/api/auth/login"
                    className="block w-full text-left text-gray-600 font-medium py-3 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/api/auth/login?screen_hint=signup"
                    className="block w-full bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Your Journey
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Auto-scrolling Carousel Component
const AutoCarousel: React.FC<AutoCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative h-screen overflow-hidden">
      <NavbarComponent />
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-center z-10">
        <div className="max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
            Maghreby
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light max-w-2xl mx-auto">
            Curated luxury travel experiences that redefine extraordinary
          </p>
          <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            Start Your Journey
          </button>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Main Search Component
const SearchInterface = () => {
  const [activeTab, setActiveTab] = useState("accommodations");

  const categories: Category[] = [
    { id: "accommodations", label: "Stay", icon: Plane },
    { id: "cars", label: "Drive", icon: CarIcon },
    { id: "restaurants", label: "Dine", icon: Utensils },
    { id: "activities", label: "Explore", icon: Camera },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex-1 justify-center ${
                  activeTab === category.id
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <IconComponent size={18} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where to?
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === "accommodations" ? "Check in" : "Pick up"}
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === "accommodations" ? "Check out" : "Drop off"}
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span>2 guests</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Maghreby() {
  const [services, setServices] = useState({
    accommodations: [] as Service[],
    cars: [] as Service[],
    restaurants: [] as Service[],
    activities: [] as Service[]
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const heroImages = [
    { src: "/listing1.jpg", alt: "Luxury resort overlooking ocean" },
    { src: "/listing2.jpg", alt: "Elegant city penthouse" },
    { src: "/listing3.jpg", alt: "Mountain retreat with panoramic views" },
    { src: "/hero.jpg", alt: "Private villa with infinity pool" },
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const servicesData = await fetchAllServices();
        setServices(servicesData);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Loader 
        text="Loading experiences..."/>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const ServiceSection: React.FC<ServiceSectionProps> = ({
    title,
    services,
    category,
    icon: Icon,
  }) => (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Icon className="text-blue-600" size={24} />
            </div>
            <h2 className="text-4xl font-light text-gray-900">{title}</h2>
          </div>
            <button
            className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
            onClick={() => window.location.href = `/services?type=${category}`}
            >
            View All
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: Service, index: number) => (
            <ServiceCard key={index} service={service} category={category} />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <AutoCarousel images={heroImages} />

      {/* Search Interface */}
      <SearchInterface />

      {/* Featured Categories */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Discover Extraordinary
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            From luxurious accommodations to exclusive experiences, every detail
            is crafted to exceed your expectations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Plane,
                title: "Premium Stays",
                description: "Handpicked luxury accommodations worldwide",
              },
              {
                icon: CarIcon,
                title: "Luxury Vehicles",
                description: "Premium car rentals for every occasion",
              },
              {
                icon: Utensils,
                title: "Fine Dining",
                description:
                  "Michelin-starred restaurants and culinary experiences",
              },
              {
                icon: Camera,
                title: "Unique Activities",
                description: "Exclusive experiences money can't usually buy",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="p-4 bg-blue-50 rounded-2xl w-fit mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Sections */}
      <section id="stays">
        <ServiceSection
          title="Luxury Accommodations"
          services={services.accommodations.slice(0, 3)}
          category="accommodations"
          icon={Plane}
        />
      </section>
      <ServiceSection
        title="Luxury Vehicles"
        services={services.cars.slice(0, 3)}
        category="cars"
        icon={CarIcon}
      />
      <ServiceSection
        title="Fine Dining"
        services={services.restaurants.slice(0, 3)}
        category="restaurants"
        icon={Utensils}
      />
      <ServiceSection
        title="Unique Activities"
        services={services.activities.slice(0, 3)}
        category="activities"
        icon={Camera}
      />

      {/* Footer CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-light mb-6">Ready for Luxury?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of discerning travelers who trust Luxora for their
            most important journeys
          </p>
          <button className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            Plan Your Trip
          </button>
        </div>
      </section>
    </div>
  );
}
