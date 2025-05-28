"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";

async function fetchUserById(userId: string) {
  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type Stat = {
  label: string;
  value: string | number;
  icon: string;
  link?: string;
};

const stats: Stat[] = [
  { label: "Users", value: 1240, icon: "👤" },
  { label: "Orders", value: 320, icon: "🛒" },
  { label: "Revenue", value: "$12,400", icon: "💰" },
  { label: "Feedback", value: 87, icon: "💬" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    async function checkAdminAndFetchStats() {
      // Get userId from cookies
      let userId = null;
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/userId=([^;]+)/);
        userId = match ? decodeURIComponent(match[1]) : null;
      }
      if (!userId) {
        router.replace("/unauthorized");
        return;
      }
      // Fetch user from backend
      const user = await fetchUserById(userId);
      if (user?.role === "ADMIN") {
        setIsAdmin(true);
      } else {
        router.replace("/unauthorized");
      }
      setLoading(false);
    }
    checkAdminAndFetchStats();
  }, [router]);

  useEffect(() => {
    // Fetch user count
    async function fetchUserCount() {
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (res.ok) {
          const users = await res.json();
          setUserCount(Array.isArray(users) ? users.length : null);
        }
      } catch {}
    }
    fetchUserCount();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Checking admin access...
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full z-30">
          <AdminSideBar />
        </div>
        <main className="flex-1 ml-64 p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Admin Dashboard
          </h1>
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              {
                label: "Users",
                value: userCount ?? "-",
                icon: "👤",
                link: "/admin/users",
              },
              ...stats.slice(1),
            ].map((stat) =>
              stat.label === "Users" ? (
                <button
                  key={stat.label}
                  className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => router.push(stat.link!)}
                  type="button"
                >
                  <span className="text-4xl mb-2">{stat.icon}</span>
                  <span className="text-2xl font-semibold text-gray-700">
                    {stat.value}
                  </span>
                  <span className="text-gray-500">{stat.label}</span>
                </button>
              ) : (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl shadow p-6 flex flex-col items-center"
                >
                  <span className="text-4xl mb-2">{stat.icon}</span>
                  <span className="text-2xl font-semibold text-gray-700">
                    {stat.value}
                  </span>
                  <span className="text-gray-500">{stat.label}</span>
                </div>
              )
            )}
          </section>
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Recent Activity
            </h2>
            <ul className="divide-y divide-gray-200">
              <li className="py-2 flex justify-between">
                <span>New user registered</span>
                <span className="text-gray-400 text-sm">2 mins ago</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Order #1234 completed</span>
                <span className="text-gray-400 text-sm">10 mins ago</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Feedback received</span>
                <span className="text-gray-400 text-sm">30 mins ago</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}
