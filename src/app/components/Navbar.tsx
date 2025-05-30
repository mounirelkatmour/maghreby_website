/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bed,
  Car,
  Utensils,
  Mountain,
  User,
  ShoppingCart,
  Heart,
  Settings,
  ChevronDown,
  LogOut,
  ShieldUser,
} from "lucide-react";

// User type definition
interface User {
  name?: string;
  picture?: string;
  [key: string]: string | number | boolean | undefined | null;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Fetch backend user info after Auth0 user is loaded
  useEffect(() => {
    if (!isLoading && user) {
      // Get userId from cookies
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];
      if (userId) {
        fetch(`http://localhost:8080/api/users/${userId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => setBackendUser(data))
          .catch(() => setBackendUser(null));
      }
    }
  }, [user, isLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setLogoutLoading(true);
    // Clear all cookies (especially userId)
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
    window.location.href = "/api/auth/logout";
  };

  const profileMenuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: ShoppingCart, label: "Cart", href: "/cart" },
    { icon: Heart, label: "Favorites", href: "/favorites" },
    { icon: Settings, label: "Settings", href: "/settings" },
    {
      icon: LogOut,
      label: "Logout",
      href: "#",
      isLogout: true,
      onClick: handleLogout,
    },
  ];

  // Add Admin Dashboard menu item if backendUser.role === 'ADMIN'
  const enhancedProfileMenuItems =
    backendUser && backendUser.role === "ADMIN"
      ? [
          ...profileMenuItems.slice(0, 4), // Profile, Cart, Favorites, Settings
          {
            icon: ShieldUser,
            label: "Admin dashboard",
            href: "/admin/dashboard",
          },
          ...profileMenuItems.slice(4), // Logout
        ]
      : profileMenuItems;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-blue-100/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Travel-friendly Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
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
          <Link
            href="/services?type=accommodations"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <Bed className="w-4 h-4" strokeWidth={2} />
              <span>Places to Stay</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>

          <Link
            href="/services?type=cars"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <Car className="w-4 h-4" strokeWidth={2} />
              <span>Car Rentals</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>

          <Link
            href="/services?type=restaurants"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <Utensils className="w-4 h-4" strokeWidth={2} />
              <span>Local Cuisine</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>

          <Link
            href="/services?type=activities"
            className="relative group text-sm font-medium hover:text-blue-600 transition-all duration-300 py-2"
          >
            <span className="flex items-center space-x-1">
              <Mountain className="w-4 h-4" strokeWidth={2} />
              <span>Experiences</span>
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>
        </div>

        {/* Friendly CTA Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {isLoading ? (
            <div className="w-24 h-10 animate-pulse bg-gray-200 rounded-lg"></div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                {backendUser &&
                backendUser.profilImg &&
                backendUser.profilImg !== "assets/images/default_user.png" ? (
                  <img
                    src={backendUser.profilImg}
                    alt={
                      (backendUser.firstName || "") +
                      " " +
                      (backendUser.lastName || "")
                    }
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                ) : user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "Profile"}
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {backendUser && backendUser.firstName
                      ? backendUser.firstName.charAt(0).toUpperCase()
                      : user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
                <span>
                  {backendUser
                    ? `${backendUser.firstName || ""} ${
                        backendUser.lastName || ""
                      }`.trim()
                    : user.name || "My Account"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  {enhancedProfileMenuItems.map((item, index) => (
                    <div key={index}>
                      {item.isLogout && index > 0 && (
                        <div className="border-t border-gray-200 my-1"></div>
                      )}
                      {item.isLogout ? (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            item.onClick?.();
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 text-left ${
                            item.isLogout
                              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          } ${
                            logoutLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={logoutLoading}
                        >
                          <item.icon className="w-4 h-4" strokeWidth={2} />
                          <span>
                            {logoutLoading ? "Logging out..." : item.label}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${
                            item.isLogout
                              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <item.icon className="w-4 h-4" strokeWidth={2} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <Link
              href="/services?type=accommodations"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bed className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">Places to Stay</span>
            </Link>

            <Link
              href="/services?type=cars"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Car className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">Car Rentals</span>
            </Link>

            <Link
              href="/services?type=restaurants"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Utensils className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">Local Cuisine</span>
            </Link>

            <Link
              href="/services?type=activities"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300 py-3 px-3 rounded-lg hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Mountain className="w-5 h-5" strokeWidth={2} />
              <span className="font-medium">Experiences</span>
            </Link>

            {/* Mobile User Menu */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isLoading ? (
                <div className="w-full h-10 animate-pulse bg-gray-200 rounded-lg"></div>
              ) : user ? (
                <div className="space-y-2">
                  {profileMenuItems.map((item, index) => (
                    <div key={index}>
                      {item.isLogout && index > 0 && (
                        <div className="border-t border-gray-200 my-2 mx-3"></div>
                      )}
                      {item.isLogout ? (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            item.onClick?.();
                          }}
                          className={`w-full flex items-center space-x-3 transition-colors duration-300 py-3 px-3 rounded-lg text-left ${
                            item.isLogout
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          } ${
                            logoutLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={logoutLoading}
                        >
                          <item.icon className="w-5 h-5" strokeWidth={2} />
                          <span className="font-medium">
                            {logoutLoading ? "Logging out..." : item.label}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 transition-colors duration-300 py-3 px-3 rounded-lg ${
                            item.isLogout
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" strokeWidth={2} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <a
                    href="/api/auth/login"
                    className="block text-center text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </a>
                  <a
                    href="/api/auth/login?screen_hint=signup"
                    className="block text-center bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Your Journey
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
