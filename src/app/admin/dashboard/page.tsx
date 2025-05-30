/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  MessageSquare,
  Briefcase,
  Activity,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";
import Loader from "@/app/components/Loader";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";

async function fetchDashboardStats() {
  try {
    const [usersRes, servicesRes, reviewsRes, requestsRes] = await Promise.all([
      fetch("http://localhost:8080/api/users"),
      fetch("http://localhost:8080/api/services"),
      fetch("http://localhost:8080/api/reviews"),
      fetch("http://localhost:8080/api/service-provider-requests"),
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const services = servicesRes.ok ? await servicesRes.json() : [];
    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
    const requests = requestsRes.ok ? await requestsRes.json() : [];

    return {
      totalUsers: Array.isArray(users) ? users.length : 0,
      totalServices: Array.isArray(services) ? services.length : 0,
      totalReviews: Array.isArray(reviews) ? reviews.length : 0,
      pendingRequests: Array.isArray(requests)
        ? requests.filter((req) => req.status === "PENDING").length
        : 0,
    };
  } catch {
    return {
      totalUsers: 0,
      totalServices: 0,
      totalReviews: 0,
      pendingRequests: 0,
    };
  }
}

async function fetchRecentActivity() {
  try {
    const [usersRes, servicesRes, reviewsRes, requestsRes] = await Promise.all([
      fetch("http://localhost:8080/api/users"),
      fetch("http://localhost:8080/api/services"),
      fetch("http://localhost:8080/api/reviews"),
      fetch("http://localhost:8080/api/service-provider-requests"),
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const services = servicesRes.ok ? await servicesRes.json() : [];
    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
    const requests = requestsRes.ok ? await requestsRes.json() : [];

    const activities: any[] = [];

    if (Array.isArray(users)) {
      users.forEach((user: any) =>
        activities.push({
          type: "New User",
          description: `User ${
            user.username || user.email || user.id
          } registered.`,
          timestamp:
            user.createdAt || user.timestamp || new Date().toISOString(),
          id: `user-${user.id}`,
        })
      );
    }

    if (Array.isArray(services)) {
      services.forEach((service: any) =>
        activities.push({
          type: "New Service",
          description: `Service "${
            service.name || service.title || service.id
          }" was added.`,
          timestamp:
            service.createdAt || service.timestamp || new Date().toISOString(),
          id: `service-${service.id}`,
        })
      );
    }

    if (Array.isArray(reviews)) {
      reviews.forEach((review: any) =>
        activities.push({
          type: "New Review",
          description: `A new review was submitted (ID: ${review.id}).`,
          timestamp:
            review.createdAt || review.timestamp || new Date().toISOString(),
          id: `review-${review.id}`,
        })
      );
    }

    if (Array.isArray(requests)) {
      requests.forEach((request: any) =>
        activities.push({
          type: "Provider Request",
          description: `Request from ${request.firstName || ""} ${
            request.lastName || ""
          } (${request.occupation || "N/A"}) - Status: ${request.status}.`,
          timestamp:
            request.createdAt || request.timestamp || new Date().toISOString(),
          id: `request-${request.id}`,
        })
      );
    }

    // Sort activities by timestamp in descending order
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return the top 10 recent activities
    return activities.slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

type DashboardStats = {
  totalUsers: number;
  totalServices: number;
  totalReviews: number;
  pendingRequests: number;
};

export default function AdminDashboardPage() {
  const { loading, isAdmin } = useAdminGuard();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalServices: 0,
    totalReviews: 0,
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && isAdmin) {
      // Fetch dashboard data only if admin
      (async () => {
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
        const activity = await fetchRecentActivity();
        setRecentActivity(activity);
      })();
    }
  }, [loading, isAdmin]);

  if (loading) {
    return <Loader text="Loading admin dashboard..." />;
  }

  if (!isAdmin) return null;

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/users",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: UserCheck,
      color: "bg-orange-500",
      link: "/admin/service-provider-requests",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "bg-green-500",
      link: "/admin/reviews",
    },
    {
      label: "Total Services",
      value: stats.totalServices,
      icon: Briefcase,
      color: "bg-purple-500",
      link: "/admin/services",
    },
  ];

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "New User":
        return "bg-sky-500";
      case "New Service":
        return "bg-emerald-500";
      case "New Review":
        return "bg-yellow-500";
      case "Provider Request":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (isoString: string) => {
    if (!isoString) return "No date";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex  min-h-screen bg-gray-100">
        <div className="fixed left-0 top-0 h-full z-30">
          <AdminSideBar />
        </div>
        <main className="flex-1 pt-24 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                  onClick={() => stat.link && router.push(stat.link)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${stat.color.replace(
                            "bg-",
                            "text-"
                          )}`}
                        />
                      </div>
                      <Activity className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-black mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity (Top 10)
              </h2>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.slice(0, 10).map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 ${getActivityTypeColor(
                            activity.type
                          )} rounded-full`}
                        ></div>
                        <div>
                          <span className="text-black font-medium block">
                            {activity.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {activity.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity found</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
