// Base interfaces matching the backend models
export interface Location {
  type: string;
  coordinates: number[];
  address?: string;
  city?: string;
  country?: string;
}

export interface ServiceLocation {
  type: string;
  coordinates: number[];
  address: string;
  city: string;
  country: string;
}

export interface Room {
  startDate: string | Date;
  endDate: string | Date;
  pricePerNight: number;
  maxGuests: number;
}

export enum AccommodationType {
  HOTEL = "HOTEL",
  HOSTEL = "HOSTEL",
  VILLA = "VILLA",
  APARTMENT = "APARTMENT",
  RIAD = "RIAD",
}

export interface Accommodation extends BaseService {
  stars: number;
  type: AccommodationType;
  amenities: string[];
  rooms: Room[];
}

export interface BaseService {
  id: string; // Changed to string to align with backend IDs
  name: string;
  description: string;
  images: string[];
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  favorites: number;
  averageRating: number;
  isFavorite?: boolean;
  location: ServiceLocation;
  serviceProviderId: string;
  offerType: string;
}

// Car model
export interface Car extends BaseService {
  brand: string;
  model: string;
  year: number;
  seats: number;
  transmission: "MANUAL" | "AUTOMATIC";
  fuelType: "DIESEL" | "GASOLINE" | "HYBRID" | "ELECTRIC";
  licencePlate: string;
  pricePerDay: number;
}

// Restaurant model
export interface Restaurant extends BaseService {
  cuisineType: string;
  openingHours: string;
  closingHours: string;
  minPrice: number;
  menu: { name: string; description: string; price: number }[];
}

// Activity model
export interface Activity extends BaseService {
  duration: string;
  price: number;
}

// Union type for all service types
export type Service = Accommodation | Car | Restaurant | Activity;

// Response type for service listings
export interface ServiceResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceData {
  accommodations: Service[];
  cars: Service[];
  restaurants: Service[];
  activities: Service[];
}

// Add User interface to serviceTypes.ts for shared typing
export interface User {
  id: string;
  service: "ACCOMMODATION" | "CAR" | "ACTIVITY" | "RESTAURANT";
  // Add other fields as needed
}
