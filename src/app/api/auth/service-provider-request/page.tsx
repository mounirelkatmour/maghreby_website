/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Camera,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Select from "react-select";
import countries from "country-list";
import { useUser } from "@auth0/nextjs-auth0/client";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
  city: string;
  bio: string;
  birthDate: string;
  occupation: string;
  profilImg: string;
  serviceType: string;
  languagePreference: string;
}

enum ServiceType {
  ACCOMMODATION = "ACCOMMODATION",
  CAR = "CAR",
  RESTAURANT = "RESTAURANT",
  ACTIVITY = "ACTIVITY",
}

enum LanguagePreference {
  ENGLISH = "ENGLISH",
  FRENCH = "FRENCH",
  ARABIC = "ARABIC",
}

const countryOptions = countries
  .getData()
  .filter((country) => country.code !== "IL")
  .map((country) => ({ value: country.name, label: country.name }));

const ServiceProviderRequest = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    country: "",
    city: "",
    bio: "",
    birthDate: "",
    occupation: "",
    profilImg: "",
    serviceType: "",
    languagePreference: "",
  });

  const totalSteps = 4;

  // Redirect if logged in
  useEffect(() => {
    // Check Auth0 user
    if (!isLoading && user) {
      router.replace("/");
      return;
    }
    // Check userId cookie
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    if (userId) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear email error when user types
    if (name === "email") {
      setEmailError("");
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8080/api/users`);
      if (response.ok) {
        const users = await response.json();
        return users.some((user: any) => user.email === email);
      }
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.password
        ) {
          return false;
        }
        // Check email exists
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setEmailError(
            "This email is already registered. Please use a different email."
          );
          return false;
        }
        return true;
      case 2:
        return !!(
          formData.phoneNumber &&
          formData.country &&
          formData.city &&
          formData.birthDate
        );
      case 3:
        return !!(formData.occupation && formData.bio && formData.serviceType);
      case 4:
        return !!formData.languagePreference;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    setLoading(true);
    const isValid = await validateStep(currentStep);
    setLoading(false);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const requestData = {
        ...formData,
        birthDate: new Date(formData.birthDate),
        createdAt: new Date(),
        status: "PENDING",
      };

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
        <span className="ml-2 text-lg">Checking authentication...</span>
      </div>
    );
  }
  if (user) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Request Submitted Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              An admin will evaluate your request soon. Thank you for your
              patience!
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600">
                Let&apos;s start with your basic details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full text-black pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                      emailError
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {emailError && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {emailError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contact & Location
              </h2>
              <p className="text-gray-600">Help us know where to reach you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="+212 XXX XXX XXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={18}
                  />
                  {/* Removed pl-10 from this div, padding will be handled by react-select styles */}
                  <div>
                    <Select
                      options={countryOptions}
                      value={countryOptions.find(
                        (opt) => opt.value === formData.country
                      )}
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: selected ? selected.value : "",
                        }))
                      }
                      classNamePrefix="react-select"
                      placeholder="Select country"
                      isClearable
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: "48px",
                          paddingLeft: "30px", // Added padding for the icon
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb", // Tailwind blue-500 for focus, gray-200 default
                          boxShadow: state.isFocused
                            ? "0 0 0 1px #3b82f6"
                            : "none", // Basic focus ring
                          "&:hover": {
                            borderColor: state.isFocused
                              ? "#3b82f6"
                              : "#d1d5db", // Tailwind gray-300 for hover
                          },
                          backgroundColor: "white",
                        }),
                        input: (base) => ({
                          ...base,
                          color: "black", // Input text color
                          paddingLeft: "0px", // Reset default padding if any
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: "black", // Selected value text color
                          marginLeft: "0px", // Adjust if icon overlaps
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: "black", // Placeholder text color
                          marginLeft: "0px", // Adjust if icon overlaps
                        }),
                        option: (base, state) => ({
                          ...base,
                          color: "black", // Option text color
                          backgroundColor: state.isSelected
                            ? "#dbeafe" // Tailwind blue-200 for selected option (good contrast with black text)
                            : state.isFocused
                            ? "#eff6ff" // Tailwind blue-50 for focused/hovered option
                            : "white",
                          "&:active": {
                            ...base[":active"],
                            backgroundColor: state.isSelected
                              ? "#bfdbfe" // Tailwind blue-300 for active selected
                              : state.isFocused
                              ? "#e0f2fe" // Lighter blue for active focused
                              : "white",
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 20, // Ensure dropdown is above other elements
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Casablanca"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Professional Details
              </h2>
              <p className="text-gray-600">Tell us about your services</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation *
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Hotel Manager, Restaurant Owner, Tour Guide..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select service type</option>
                  <option value={ServiceType.ACCOMMODATION}>
                    Accommodation
                  </option>
                  <option value={ServiceType.CAR}>Car Rental</option>
                  <option value={ServiceType.RESTAURANT}>Restaurant</option>
                  <option value={ServiceType.ACTIVITY}>Activity/Tours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio/Description *
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                    placeholder="Tell us about yourself and your services..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL (Optional)
                </label>
                <div className="relative">
                  <Camera
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="url"
                    name="profilImg"
                    value={formData.profilImg}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Language Preference
              </h2>
              <p className="text-gray-600">
                Choose your preferred language for communication
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language *
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  name="languagePreference"
                  value={formData.languagePreference}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select preferred language</option>
                  <option value={LanguagePreference.ENGLISH}>English</option>
                  <option value={LanguagePreference.FRENCH}>French</option>
                  <option value={LanguagePreference.ARABIC}>Arabic</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Review Your Information
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Name:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Service Type:</strong> {formData.serviceType}
                </p>
                <p>
                  <strong>Location:</strong> {formData.city}, {formData.country}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Maghreby as a Service Provider
          </h1>
          <p className="text-gray-600">
            Share your amazing services with travelers around the world
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Submit Request
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderRequest;
