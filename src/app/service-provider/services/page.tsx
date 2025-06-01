/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { Service, ServiceResponse, User } from "./serviceTypes";
import Navbar from "@/app/components/Navbar";
import ServiceProviderSideBar from "@/app/components/ServiceProviderSideBar";
import { useRouter } from "next/navigation";
import { 
    Trash2, 
    MapPin, 
    Car, 
    Activity, 
    Utensils, 
    Home, 
    ChevronRight,
    Search,
    Plus
} from "lucide-react";

interface ServicesPageProps {
    userId?: string;
}

const ServicesPage: React.FC<ServicesPageProps> = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    // Helper to get userId from document.cookie
    const getUserIdFromCookie = (): string | undefined => {
        if (typeof document === "undefined") return undefined;
        const match = document.cookie.match(/(?:^|;\s*)userId=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : undefined;
    };

    // Get service icon based on type
    const getServiceIcon = (serviceType: string) => {
        switch (serviceType) {
            case "ACCOMMODATION":
                return <Home className="w-5 h-5 text-blue-600" />;
            case "CAR":
                return <Car className="w-5 h-5 text-green-600" />;
            case "ACTIVITY":
                return <Activity className="w-5 h-5 text-purple-600" />;
            case "RESTAURANT":
                return <Utensils className="w-5 h-5 text-orange-600" />;
            default:
                return <MapPin className="w-5 h-5 text-gray-600" />;
        }
    };

    // Filter services based on search term
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (serviceId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                // Add your delete API call here
                console.log("Deleting service:", serviceId);
                // Remove from state after successful deletion
                setServices(services.filter(service => service.id !== serviceId));
            } catch (error) {
                console.error("Failed to delete service:", error);
            }
        }
    };

    useEffect(() => {
        const userId = getUserIdFromCookie() || "1";

        const fetchServices = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user
                const userRes = await fetch(
                    `http://localhost:8080/api/users/${userId}`
                );
                if (!userRes.ok) throw new Error("Failed to fetch user");
                const user: User = await userRes.json();

                let serviceUrl = "";
                switch (user.service) {
                    case "ACCOMMODATION":
                        serviceUrl = "http://localhost:8080/api/services/accommodations";
                        break;
                    case "CAR":
                        serviceUrl = "http://localhost:8080/api/services/cars";
                        break;
                    case "ACTIVITY":
                        serviceUrl = "http://localhost:8080/api/services/activities";
                        break;
                    case "RESTAURANT":
                        serviceUrl = "http://localhost:8080/api/services/restaurants";
                        break;
                    default:
                        throw new Error("Unknown service type");
                }

                const serviceRes = await fetch(serviceUrl);
                if (!serviceRes.ok) throw new Error("Failed to fetch services");
                const serviceDataRaw = await serviceRes.json();

                let serviceArray: Service[] = [];
                if (Array.isArray(serviceDataRaw)) {
                    serviceArray = serviceDataRaw;
                } else if (Array.isArray(serviceDataRaw.data)) {
                    serviceArray = serviceDataRaw.data;
                } else {
                    serviceArray = [];
                }

                const filteredServices = serviceArray.filter(
                    (service: Service) => service.serviceProviderId === user.id
                );
                setServices(filteredServices);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message || "An error occurred");
                } else {
                    setError("An error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <>
            <Navbar />
            <div className="flex pt-16 min-h-screen bg-gray-50">
                <ServiceProviderSideBar />
                <div className="flex-1 flex flex-col w-full max-w-screen-xl mx-auto">
                    <div className="bg-white shadow-sm border-b">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
                                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Service
                                </button>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6">
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading services...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                {filteredServices.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-3">
                                            <MapPin className="w-12 h-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No services found
                                        </h3>
                                        <p className="text-gray-500">
                                            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first service"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {filteredServices.map((service, index) => (
                                            <div
                                                key={service.id}
                                                className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/service-provider/services/${service.id}`)}
                                            >
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    {/* Image Placeholder - Replace with actual image */}
                                                    <div className="flex-shrink-0">
                                                        {service.images && service.images.length > 0 ? (
                                                            <img 
                                                                src={service.images[0]} 
                                                                alt={service.name} 
                                                                className="w-16 h-16 object-cover rounded-lg" 
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                {getServiceIcon(service.offerType)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                                            {service.name}
                                                        </h3>
                                                        {service.description && (
                                                            <p className="text-sm text-gray-500 mt-1 overflow-hidden"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                textOverflow: 'ellipsis'
                                                            }}>
                                                                {service.description}
                                                            </p>
                                                        )}
                                                        {service.location && (
                                                            <div className="flex items-center mt-2 text-sm text-gray-400 truncate">
                                                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                <span className="truncate">
                                                                    {typeof service.location === 'string' ? service.location : `${service.location.address}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => handleDelete(service.id, e)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete service"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicesPage;
