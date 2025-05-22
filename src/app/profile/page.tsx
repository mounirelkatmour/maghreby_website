/* eslint-disable @next/next/no-img-element */
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Redirect unauthenticated users in useEffect
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    setLogoutLoading(true);
    window.location.href = "/api/auth/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error.message}</p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    // While redirecting, render nothing
    return null;
  }

  // All user usages below this point are safe
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 p-6 text-center">
          <div className="mx-auto h-32 w-32 rounded-full overflow-hidden border-4 border-white mb-4">
            {user && user.picture ? (
              <img
                src={user.picture}
                alt={user.name || "Profile"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600 text-4xl font-bold">
                {user && user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{user && user.name}</h1>
          <p className="text-blue-50">{user && user.email}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Account Information
            </h2>
            <div className="bg-gray-50 rounded-md p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900 break-all">
                    {user && user.sub}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className="font-medium text-gray-900">
                    {user && user.email_verified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {user && user.updated_at
                    ? new Date(user.updated_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/"
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {logoutLoading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
