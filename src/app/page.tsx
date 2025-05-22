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
  Car,
  Utensils,
  Camera,
  LucideIcon,
} from "lucide-react";

// Type definitions
interface Service {
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  category: string;
  description: string;
  image: string;
}

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
  const [isLiked, setIsLiked] = useState(false);

  const getPricingText = (category: string, price: number) => {
    switch (category) {
      case "accommodations":
        return `$${price}/night`;
      case "cars":
        return `$${price}/day`;
      case "restaurants":
        return `$${price}/person`;
      case "activities":
        return `$${price}/person`;
      default:
        return `$${price}`;
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
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
            {service.category}
          </span>
        </div>
        {service.rating && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{service.rating}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <MapPin size={14} />
          <span className="text-sm">{service.location}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {getPricingText(category, service.price)}
            </span>
            {service.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${service.originalPrice}
              </span>
            )}
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
      <Navbar />
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
    { id: "cars", label: "Drive", icon: Car },
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

export default function Luxora() {
  const heroImages = [
    { src: "/listing1.jpg", alt: "Luxury resort overlooking ocean" },
    { src: "/listing2.jpg", alt: "Elegant city penthouse" },
    { src: "/listing3.jpg", alt: "Mountain retreat with panoramic views" },
    { src: "/hero.jpg", alt: "Private villa with infinity pool" },
  ];

  const accommodations = [
    {
      title: "Oceanfront Villa Malibu",
      location: "Malibu, California",
      price: 850,
      originalPrice: 1200,
      rating: 4.9,
      category: "Luxury Villa",
      description:
        "Stunning oceanfront villa with private beach access and infinity pool",
      image: "/listing1.jpg",
    },
    {
      title: "Manhattan Penthouse",
      location: "New York, NY",
      price: 1200,
      rating: 4.8,
      category: "Penthouse",
      description:
        "Luxury penthouse in the heart of Manhattan with skyline views",
      image: "/listing2.jpg",
    },
    {
      title: "Alpine Chalet Sanctuary",
      location: "Aspen, Colorado",
      price: 750,
      rating: 4.9,
      category: "Chalet",
      description: "Private mountain chalet with ski-in/ski-out access",
      image: "/listing3.jpg",
    },
  ];

  const cars = [
    {
      title: "Tesla Model S Plaid",
      location: "Los Angeles, CA",
      price: 299,
      rating: 4.9,
      category: "Electric Luxury",
      description: "Premium electric vehicle with autopilot and ludicrous mode",
      image: "/car1.jpg",
    },
    {
      title: "BMW M8 Competition",
      location: "Miami, FL",
      price: 450,
      rating: 4.8,
      category: "Sports Car",
      description: "High-performance luxury coupe with track-tuned suspension",
      image: "/car2.jpg",
    },
    {
      title: "Range Rover Sport",
      location: "Denver, CO",
      price: 199,
      rating: 4.7,
      category: "SUV",
      description:
        "Luxury SUV perfect for mountain adventures and city driving",
      image: "/car3.jpg",
    },
  ];

  const restaurants = [
    {
      title: "Le Bernardin",
      location: "New York, NY",
      price: 195,
      rating: 4.9,
      category: "Fine Dining",
      description:
        "Michelin three-star seafood restaurant with exquisite French cuisine",
      image: "/api/placeholder/400/300",
    },
    {
      title: "Nobu Malibu",
      location: "Malibu, CA",
      price: 120,
      rating: 4.8,
      category: "Japanese",
      description:
        "Oceanfront Japanese cuisine with innovative sushi and sashimi",
      image: "/api/placeholder/400/300",
    },
    {
      title: "The French Laundry",
      location: "Napa Valley, CA",
      price: 350,
      rating: 4.9,
      category: "Michelin Star",
      description:
        "World-renowned restaurant offering exceptional French cuisine",
      image: "/api/placeholder/400/300",
    },
  ];

  const activities = [
    {
      title: "Private Helicopter Tour",
      location: "Manhattan, NY",
      price: 299,
      rating: 4.9,
      category: "Adventure",
      description:
        "Breathtaking aerial views of Manhattan and the Statue of Liberty",
      image: "/api/placeholder/400/300",
    },
    {
      title: "Wine Tasting Experience",
      location: "Napa Valley, CA",
      price: 150,
      rating: 4.8,
      category: "Culinary",
      description: "Private vineyard tour with sommelier-guided tastings",
      image: "/api/placeholder/400/300",
    },
    {
      title: "Sunset Yacht Charter",
      location: "Miami, FL",
      price: 500,
      rating: 4.9,
      category: "Water Sports",
      description:
        "Luxury yacht experience with champagne and gourmet catering",
      image: "/api/placeholder/400/300",
    },
  ];

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
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group">
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
                icon: Car,
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
      <ServiceSection
        title="Premium Accommodations"
        services={accommodations}
        category="accommodations"
        icon={Plane}
      />
      <ServiceSection
        title="Luxury Vehicles"
        services={cars}
        category="cars"
        icon={Car}
      />
      <ServiceSection
        title="Fine Dining"
        services={restaurants}
        category="restaurants"
        icon={Utensils}
      />
      <ServiceSection
        title="Exclusive Activities"
        services={activities}
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
