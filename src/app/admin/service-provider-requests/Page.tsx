/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Loader from "@/app/components/Loader";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import { useRouter } from "next/navigation";

interface ServiceProviderRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  serviceType: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description?: string;
  city?: string;
  occupation?: string;
  bio?: string;
  profilImg?: string;
  // Add other fields as needed
}

const ServiceProviderRequestsPage = () => {
  const { loading, isAdmin } = useAdminGuard();
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceProviderRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<ServiceProviderRequest | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setDataLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/service-provider-requests"
      );
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch service provider requests. Please try again later."
      );
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && isAdmin) {
      // Fetch requests only if admin
      fetchRequests();
    }
  }, [loading, isAdmin]);

  const handleApprove = async (requestId: string) => {
    try {
      await axios.put(
        `http://localhost:8080/api/service-provider-requests/approve/${requestId}`
      );
      toast.success("Request approved successfully");
      fetchRequests();
      setSelectedRequest((prev) =>
        prev && prev.id === requestId ? { ...prev, status: "APPROVED" } : null
      );
    } catch (err) {
      toast.error("Failed to approve request");
      console.error(err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await axios.put(
        `http://localhost:8080/api/service-provider-requests/reject/${requestId}`
      );
      toast.success("Request rejected successfully");
      fetchRequests();
      setSelectedRequest((prev) =>
        prev && prev.id === requestId ? { ...prev, status: "REJECTED" } : null
      );
    } catch (err) {
      toast.error("Failed to reject request");
      console.error(err);
    }
  };

  const handleRowClick = (request: ServiceProviderRequest) => {
    setSelectedRequest(request);
  };

  const getStatusClass = (status: ServiceProviderRequest["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDotClass = (status: ServiceProviderRequest["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <Loader text="Loading service provider requests..." />;
  }

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex flex-1">
        <AdminSideBar />
        <main className="flex-1 p-6 pt-24 md:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">
              Service Provider Requests
            </h1>
          </header>

          {dataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader text="Loading requests..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 flex items-center gap-3 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          ) : selectedRequest ? (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fadeIn">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  &larr; Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                {[
                  { label: "First Name", value: selectedRequest.firstName },
                  { label: "Last Name", value: selectedRequest.lastName },
                  { label: "Email", value: selectedRequest.email },
                  { label: "Phone Number", value: selectedRequest.phoneNumber },
                  { label: "Country", value: selectedRequest.country },
                  { label: "Service Type", value: selectedRequest.serviceType },
                  {
                    label: "City",
                    value: selectedRequest.city,
                    optional: true,
                  },
                  {
                    label: "Occupation",
                    value: selectedRequest.occupation,
                    optional: true,
                  },
                  {
                    label: "Status",
                    value: (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                          selectedRequest.status
                        )}`}
                      >
                        <span
                          className={`w-2 h-2 mr-2 rounded-full ${getStatusDotClass(
                            selectedRequest.status
                          )}`}
                        ></span>
                        {selectedRequest.status}
                      </span>
                    ),
                  },
                  {
                    label: "Date Submitted",
                    value: new Date(
                      selectedRequest.createdAt
                    ).toLocaleDateString(),
                  },
                ].map((item, index) =>
                  item.optional && !item.value ? null : (
                    <div key={index}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {item.label}:
                      </p>
                      <p className="text-gray-800 mt-1 text-sm md:text-base">
                        {item.value}
                      </p>
                    </div>
                  )
                )}
              </div>

              {selectedRequest.bio && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bio:
                  </p>
                  <p className="mt-1 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.bio}
                  </p>
                </div>
              )}

              {selectedRequest.profilImg && (
                <div className="mb-8">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Profile Image:
                  </p>
                  <img
                    src={selectedRequest.profilImg}
                    alt={`${selectedRequest.firstName} ${selectedRequest.lastName}'s profile`}
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                  />
                </div>
              )}

              {selectedRequest.status === "PENDING" && (
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white overflow-x-auto rounded-xl shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    {["Name", "Service Type", "Status", "Date", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No service provider requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => handleRowClick(request)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.firstName} {request.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {request.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                              request.status
                            )}`}
                          >
                            <span
                              className={`w-2 h-2 mr-1.5 rounded-full ${getStatusDotClass(
                                request.status
                              )}`}
                            ></span>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === "PENDING" ? (
                            <div
                              className="flex space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(request.id);
                                }}
                                className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors duration-150 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(request.id);
                                }}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-150 font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              {" "}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceProviderRequestsPage;
