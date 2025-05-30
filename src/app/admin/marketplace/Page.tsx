"use client";
import React from 'react';
import Navbar from '@/app/components/Navbar';
import AdminSideBar from "@/app/components/AdminSideBar";
import {useAdminGuard} from '@/app/hooks/useAdminGuard';



const AdminMarketplacePage: React.FC = () => {
    useAdminGuard();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex flex-1"> {/* pt-16 to offset for fixed Navbar height */}
                <AdminSideBar />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-700 mb-4">
                            Marketplace Management
                        </h1>
                        <p className="text-xl text-gray-500">
                            This page is coming soon...
                        </p>
                        <p className="text-gray-400 mt-2">
                            We are working hard to bring you this feature. Stay tuned!
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminMarketplacePage;