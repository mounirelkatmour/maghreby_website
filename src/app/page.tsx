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
import {
  fetchAllServices,
  Service,
  addServiceToFavorites,
  removeServiceFromFavorites,
  ServiceData,
} from "./utils/fetch_services";
import {
  Accommodation,
  Car,
  Restaurant,
  Activity,
} from "./utils/fetch_services";
import { useRouter } from "next/navigation";
import Loader from "./components/Loader";

// Helper to get userId from cookie
const getUserIdFromCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/userId=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Type definitions
interface ServiceCardProps {
  service: Service;
  category: string;
  isFavorite: boolean;
  onFavoriteToggle: (
    service: Service,
    category: string,
    newValue: boolean
  ) => void;
  userId: string | null;
}

interface CarouselImage {
  src: string;
  alt: string;
}

interface AutoCarouselProps {
  images: CarouselImage[];
  userId?: string | null;
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
interface ServiceCardProps {
  service: Service;
  category: string;
  isFavorite: boolean;
  onFavoriteToggle: (
    service: Service,
    category: string,
    newValue: boolean
  ) => void;
  userId: string | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  category,
  isFavorite,
  onFavoriteToggle,
  userId,
}) => {
  // Always use isFavorite prop for heart color, and only update local state for loading feedback
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Type guards
  const isAccommodation = (s: Service): s is Accommodation =>
    "stars" in s && "rooms" in s;
  const isCar = (s: Service): s is Car => "brand" in s && "pricePerDay" in s;
  const isRestaurant = (s: Service): s is Restaurant =>
    "cuisineType" in s && "minPrice" in s;
  const isActivity = (s: Service): s is Activity =>
    "duration" in s && "price" in s;

  // Get display fields
  const displayName = service.name;
  const displayImage =
    service.images && service.images.length > 0
      ? service.images[0]
      : "/placeholder-image.jpg";
  let displayPrice = "";
  let extraInfo: React.ReactNode = null;

  if (isAccommodation(service)) {
    // Show lowest room price if available
    const minRoom =
      service.rooms && service.rooms.length > 0
        ? Math.min(...service.rooms.map((r) => r.pricePerNight))
        : undefined;
    displayPrice = minRoom ? `${minRoom} MAD/night` : "Price on request";
    extraInfo = (
      <div className="text-xs text-gray-500 mt-1">
        ⭐ {service.stars} • {service.type}
      </div>
    );
  } else if (isCar(service)) {
    displayPrice = `${service.pricePerDay} MAD/day`;
    extraInfo = (
      <div className="text-xs text-gray-500 mt-1">
        {service.brand} {service.model} • {service.year} • {service.seats} seats
      </div>
    );
  } else if (isRestaurant(service)) {
    displayPrice = `${service.minPrice} MAD/person`;
    extraInfo = (
      <div className="text-xs text-gray-500 mt-1">
        Cuisine: {service.cuisineType}
      </div>
    );
  } else if (isActivity(service)) {
    displayPrice = `${service.price} MAD/person`;
    extraInfo = (
      <div className="text-xs text-gray-500 mt-1">
        Duration: {service.duration}
      </div>
    );
  } else {
    displayPrice = "Price on request";
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    setLoading(true);
    try {
      if (isFavorite) {
        await removeServiceFromFavorites(
          category as keyof ServiceData,
          service.id,
          userId
        );
        onFavoriteToggle(service, category, false);
      } else {
        try {
          await addServiceToFavorites(
            category as keyof ServiceData,
            service.id,
            userId
          );
          onFavoriteToggle(service, category, true);
        } catch (err) {
          if (
            err instanceof Error &&
            err.message &&
            err.message.includes("already in your favorites")
          ) {
            onFavoriteToggle(service, category, true);
          } else {
            // Optionally show error
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-blue-300 relative group"
      onClick={() => router.push(`/services/${category}/${service.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={displayImage}
          alt={displayName}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleFavoriteClick}
          disabled={loading}
          className={
            "absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-300"
          }
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={20}
            className={`h-5 w-5 transition-colors duration-300 ${
              isFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>
        {service.averageRating !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center bg-yellow-50 px-2 py-1 rounded-full">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700">
              {service.averageRating?.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mt-1 mb-2">
          <MapPin size={14} />
          <span className="text-sm">
            {service.location &&
            (service.location.address || service.location.city)
              ? `${
                  service.location.address
                    ? service.location.address + ", "
                    : ""
                }${service.location.city ?? ""}`
                  .trim()
                  .replace(/,$/, "")
              : "N/A"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2 flex-grow">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">{displayPrice}</div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {category}
          </span>
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

// Auto-scrolling Carousel Component
interface AutoCarouselProps {
  images: CarouselImage[];
  userId?: string | null;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({ images, userId }) => {
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
        <div className="max-w-5xl px-6 py-12 rounded-3xl border border-white/10">
          <h1 className="text-6xl md:text-8xl font-light text-white mb-8 tracking-tight drop-shadow-lg animate-fadeIn">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Maghreby
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Curated luxury travel experiences that redefine extraordinary
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              className="group bg-gradient-to-r from-white to-gray-100 text-gray-900 px-10 py-5 rounded-full font-medium hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                const staysSection = document.getElementById("stays");
                if (staysSection) {
                  staysSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <span>Start Your Journey</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            {/* Debug logs for provider join button */}
            {(() => {
              if (typeof window !== "undefined") {
                const cookieUserId = getUserIdFromCookie();
                if (!cookieUserId) {
                  return (
                    <button
                      className="group bg-transparent border-2 backdrop-blur-sm border-white/50 text-white px-10 py-5 rounded-full font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={() => (window.location.href = "/api/auth/service-provider-request")}
                    >
                      <span>Become a Service Provider</span>
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  );
                }
              }
              return null;
            })()}
          </div>
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
    activities: [] as Service[],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const userId = getUserIdFromCookie();

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

        const servicesData = await fetchAllServices(userId || undefined);
        setServices(servicesData);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [userId]);

  useEffect(() => {
    if (services) {
      const map: Record<string, boolean> = {};
      Object.values(services)
        .flat()
        .forEach((service: Service) => {
          map[service.id] = Boolean(service.isFavorite);
        });
      setFavoriteMap(map);
    }
  }, [services]);

  const handleFavoriteToggle = (
    service: Service,
    category: string,
    newValue: boolean
  ) => {
    setFavoriteMap((prev) => ({ ...prev, [service.id]: newValue }));
  };

  // Loading state
  if (loading) {
    return <Loader text="Loading experiences..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
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
            onClick={() =>
              (window.location.href = `/services?type=${category}`)
            }
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
            <ServiceCard
              key={service.id}
              service={service}
              category={category}
              isFavorite={!!favoriteMap[service.id]}
              onFavoriteToggle={handleFavoriteToggle}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <AutoCarousel images={heroImages} userId={userId} />

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
