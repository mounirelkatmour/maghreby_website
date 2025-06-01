"use client";
import Navbar from '@/app/components/Navbar';
import ServiceProviderSidebar from '@/app/components/ServiceProviderSideBar';
import React from 'react';

const ServiceProviderDashboard: React.FC = () => {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 pt-16"> {/* Added pt-16 to account for fixed Navbar height */}
                <ServiceProviderSidebar />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-2xl font-semibold text-gray-800">Service Provider Dashboard</h1>
                    {/* Add your dashboard content here */}
                    <div className="mt-4">
                        <p className="text-gray-600">Welcome to your dashboard. Here you can manage your services, view bookings, and update your profile.</p>
                        {/* Example widgets or sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            <div className="bg-white p-4 shadow rounded-lg">
                                <h2 className="text-lg font-medium text-gray-700">My Services</h2>
                                {/* Content for services */}
                            </div>
                            <div className="bg-white p-4 shadow rounded-lg">
                                <h2 className="text-lg font-medium text-gray-700">Upcoming Bookings</h2>
                                {/* Content for bookings */}
                            </div>
                            <div className="bg-white p-4 shadow rounded-lg">
                                <h2 className="text-lg font-medium text-gray-700">Profile Settings</h2>
                                {/* Content for profile settings */}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ServiceProviderDashboard;