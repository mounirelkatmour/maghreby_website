/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// API configuration
const API_BASE_URL = 'http://localhost:8080';
const API_PREFIX = '/api';
const BASE_URL = `${API_BASE_URL}${API_PREFIX}`;

console.log('API Configuration:', {
  API_BASE_URL,
  API_PREFIX,
  FULL_BASE_URL: BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

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
  HOTEL = 'HOTEL',
  HOSTEL = 'HOSTEL',
  VILLA = 'VILLA',
  APARTMENT = 'APARTMENT',
  RIAD = 'RIAD'
}

export interface Accommodation extends BaseService {
  stars: number;
  type: AccommodationType;
  amenities: string[];
  rooms: Room[];
}

export interface BaseService {
  id: string;  // Changed to string to align with backend IDs
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
}

// Car model
export interface Car extends BaseService {
  brand: string;
  model: string;
  year: number;
  seats: number;
  transmission: 'MANUAL' | 'AUTOMATIC';
  fuelType: 'DIESEL' | 'GASOLINE' | 'HYBRID' | 'ELECTRIC';
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

// --- Review Types ---
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface Review {
  id: string;
  userId: string;
  user: UserProfile;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Getting userId from cookies
const userId = (() => {
  if (typeof document === 'undefined') return null; // No cookies in server-side rendering
  const match = document.cookie.match(/userId=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
})();

// Generic function to fetch data from the backend
async function fetchData<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
        try {
          errorData = JSON.parse(errorData);
        } catch (e) {
          // If not JSON, keep as text
        }
      } catch (e) {
        errorData = 'Failed to parse error response';
      }
      
      const errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
      console.error('API Error Details:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw new Error(`Failed to fetch data from ${endpoint}. Please check your network connection and try again.`);
  }
}

// Helper function to transform service data to match our frontend needs
const transformService = (service: any, type: 'accommodations' | 'cars' | 'restaurants' | 'activities'): Service => {
  switch (type) {
    case 'accommodations':
      return {
        ...service,
        images: service.images || [],
        amenities: service.amenities || [],
        rooms: service.rooms || [],
      } as Accommodation;
    case 'cars':
      return {
        ...service,
        images: service.images || [],
        pricePerDay: service.pricePerDay ?? 0,
      } as Car;
    case 'restaurants':
      return {
        ...service,
        images: service.images || [],
        menu: service.menu || [],
        minPrice: service.minPrice ?? 0,
      } as Restaurant;
    case 'activities':
      return {
        ...service,
        images: service.images || [],
        price: service.price ?? 0,
      } as Activity;
    default:
      return service as Service;
  }
};

// Fetch all services in parallel
export const fetchAllServices = async (userId?: string): Promise<ServiceData> => {
  console.log('Starting to fetch all services...');
  
  try {
    const userIdParam = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    
    const [accommodations, cars, restaurants, activities] = await Promise.all([
      fetchData<Accommodation[]>(`/services/accommodations${userIdParam}`)
        .then(data => data.map((item: any) => transformService(item, 'accommodations')))
        .catch(err => {
          console.error('Error in accommodations fetch:', err);
          return [];
        }),
      fetchData<Car[]>(`/services/cars${userIdParam}`)
        .then(data => data.map((item: any) => transformService(item, 'cars')))
        .catch(err => {
          console.error('Error in cars fetch:', err);
          return [];
        }),
      fetchData<Restaurant[]>(`/services/restaurants${userIdParam}`)
        .then(data => data.map((item: any) => transformService(item, 'restaurants')))
        .catch(err => {
          console.error('Error in restaurants fetch:', err);
          return [];
        }),
      fetchData<Activity[]>(`/services/activities${userIdParam}`)
        .then(data => data.map((item: any) => transformService(item, 'activities')))
        .catch(err => {
          console.error('Error in activities fetch:', err);
          return [];
        })
    ]);
    console.log("These are services:", {
      accommodations,
      cars,
      restaurants,
      activities
    });
    console.log('Successfully fetched services:', {
      accommodations: accommodations.length,
      cars: cars.length,
      restaurants: restaurants.length,
      activities: activities.length
    });

    return {
      accommodations,
      cars,
      restaurants,
      activities
    };
  } catch (error) {
    console.error('Critical error in fetchAllServices:', error);
    return {
      accommodations: [],
      cars: [],
      restaurants: [],
      activities: []
    };
  }
};

// Fetch a single service by ID and type
export const fetchServiceById = async (
  type: keyof ServiceData,
  id: string,
  userId?: string
): Promise<Service | undefined> => {
  try {
    const userIdParam = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const service = await fetchData<Service>(`/services/${type}/${id}${userIdParam}`);
    return transformService(service, type);
  } catch (error) {
    console.error(`Error fetching ${type} with id ${id}:`, error);
    throw error;
  }
};

// Add a service to favorites
export const addServiceToFavorites = async (
  type: keyof ServiceData,
  serviceId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${BASE_URL}/services/${type}/${serviceId}/favorites?userId=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId, userId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to add service to favorites: ${errorData.message}`);
    }

    console.log(`Service ${serviceId} added to favorites for user ${userId}`);
  } catch (error) {
    console.error('Error adding service to favorites:', error);
    throw error;
  }
};

// Remove a service from favorites
export const removeServiceFromFavorites = async (
  type: keyof ServiceData,
  serviceId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${BASE_URL}/services/${type}/${serviceId}/favorites?userId=${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to remove service from favorites: ${errorData.message}`);
    }

    console.log(`Service ${serviceId} removed from favorites for user ${userId}`);
  } catch (error) {
    console.error('Error removing service from favorites:', error);
    throw error;
  }
};

// --- Review API Functions ---
export const fetchReviews = async (
  type: keyof ServiceData,
  serviceId: string
): Promise<Review[]> => {
  const res = await fetch(`${BASE_URL}/services/${type}/${serviceId}/reviews`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
};

export const fetchAverageRating = async (
  type: keyof ServiceData,
  serviceId: string
): Promise<number> => {
  const res = await fetch(`${BASE_URL}/services/${type}/${serviceId}/reviews/average`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch average rating');
  const data = await res.json();
  return typeof data === 'number' ? data : data.averageRating;
};

export const addReview = async (
  type: keyof ServiceData,
  serviceId: string,
  review: Omit<Review, 'id' | 'user' | 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
): Promise<Review> => {
  const res = await fetch(`${BASE_URL}/services/${type}/${serviceId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to add review');
  return res.json();
};

export const updateReview = async (
  type: keyof ServiceData,
  serviceId: string,
  reviewId: string,
  review: Partial<Omit<Review, 'id' | 'user' | 'createdAt' | 'updatedAt'>> & { updatedAt: string }
): Promise<Review> => {
  const res = await fetch(`${BASE_URL}/services/${type}/${serviceId}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to update review');
  return res.json();
};

export const deleteReview = async (
  type: keyof ServiceData,
  serviceId: string,
  reviewId: string
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/services/${type}/${serviceId}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to delete review');
};

export default {
  fetchAllServices,
  fetchServiceById,
  addServiceToFavorites,
  removeServiceFromFavorites,
  fetchReviews,
  fetchAverageRating,
  addReview,
  updateReview,
  deleteReview
};
