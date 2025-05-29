/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";
import Select from "react-select";
import countries from "country-list";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  occupation?: string;
  birthDate?: string;
  bio?: string;
  auth0Id?: string;
  languagePreference?: string;
  createdAt?: string;
  profilImg?: string;
  interests?: Record<string, string[]>;
  active?: boolean;
  role: string;
  service?: string;
  firstTimeLogin?: boolean;
  isApproved?: boolean;
}

interface RegularUser extends User {
  firstTimeLogin?: boolean;
}

interface ServiceProvider extends User {
  isApproved?: boolean;
  service?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<User> & { showPassword?: boolean }>({ showPassword: false });
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  // Replace with your actual ImgBB API key
  const IMGBB_API_KEY = "8c92f0aa791a5e9d6864ec1f327948be";

  // Generate country options once using useMemo for performance
  const countryOptions = React.useMemo(() => {
    return countries
      .getData()
      .filter((country) => country.code !== "IL") // Exclude by code
      .map((country) => ({ value: country.code, label: country.name }));
  }, []);

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Upload image to ImgBB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      console.log("Full ImgBB response:", data); // Log full response

      if (!data.success) throw new Error("Image upload failed");

      const directImageUrl = data.data.url;
      console.log("Direct image URL:", directImageUrl); // Log just the URL

      setForm({ ...form, profilImg: directImageUrl });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form input
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create user");
      setForm({});
      setCreating(false);
      // Refresh users
      const usersRes = await fetch("http://localhost:8080/api/users");
      setUsers(await usersRes.json());
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // When editing a user, convert birthDate to yyyy-MM-dd for input compatibility
  const handleEdit = (user: User) => {
    let birthDate = user.birthDate;
    if (birthDate && birthDate.length > 10) {
      // Try to extract yyyy-MM-dd from ISO or timestamp string
      const match = birthDate.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) birthDate = match[0];
    }
    setEditingUser(user);
    setForm({ ...user, birthDate });
  };

  // Update user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError(null);
    try {
      // Prepare payload: only include password if provided, and encode it
      const payload = { ...form };
      if (payload.password) {
        payload.password = btoa(payload.password);
      } else {
        delete payload.password;
      }
      const res = await fetch(
        `http://localhost:8080/api/users/${editingUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update user");
      setEditingUser(null);
      setForm({});
      // Refresh users
      const usersRes = await fetch("http://localhost:8080/api/users");
      setUsers(await usersRes.json());
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      // Refresh users
      const usersRes = await fetch("http://localhost:8080/api/users");
      setUsers(await usersRes.json());
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine subtype fields
  const isRegularUser = (role: string) => role === "USER";
  const isServiceProvider = (role: string) => role === "SERVICE_PROVIDER";
  const isAdminUser = (role: string) => role === "ADMIN";

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full z-30">
          <AdminSideBar />
        </div>
        <main className="flex-1 ml-64 p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">All Users</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-6 flex justify-between items-center">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setCreating(true);
                setForm({});
                setEditingUser(null);
              }}
            >
              + Add User
            </button>
          </div>

          {/* Create/Edit Form */}
          {(creating || editingUser) && (
            <form
              className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col gap-4 max-w-lg"
              onSubmit={creating ? handleCreate : handleUpdate}
            >
              {/* Profile Image Upload */}
              <div>
                <label className="block text-black mb-1">Profile Image</label>
                <div className="flex items-center gap-4">
                  <img
                    src={form.profilImg || "/default-avatar.png"}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-avatar.png";
                    }}
                  />
                  <div>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className={`inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded cursor-pointer ${
                        uploadingImage ? "opacity-50" : ""
                      }`}
                    >
                      {uploadingImage ? "Uploading..." : "Change Image"}
                    </label>
                    {uploadingImage && (
                      <span className="ml-2 text-sm text-gray-500">
                        Uploading...
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-black mb-1">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-black mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-black mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-black mb-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-black mb-1">Role</label>
                <select
                  name="role"
                  value={form.role || "USER"}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 focus:bg-white"
                  required
                >
                  <option value="USER">USER</option>
                  <option value="SERVICE_PROVIDER">SERVICE PROVIDER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-black mb-1">Country</label>
                <Select
                  name="country"
                  options={countryOptions}
                  value={countryOptions.find(
                    (option) => option.value === form.country
                  )}
                  onChange={(option) =>
                    setForm({ ...form, country: option ? option.value : "" })
                  }
                  classNamePrefix="react-select"
                  placeholder="Select a country..."
                  isClearable
                  isSearchable
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "1px solid black",
                      borderRadius: "0.375rem", // Tailwind rounded
                      backgroundColor: "#f3f4f6",
                      minHeight: "40px",
                      boxShadow: "none",
                      color: "black",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "black",
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: "black",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "black",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      color: "black",
                      zIndex: 10,
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      color: "black",
                      backgroundColor: state.isSelected
                        ? "#e0e7ef"
                        : state.isFocused
                        ? "#f1f5f9"
                        : "#fff",
                    }),
                  }}
                />
              </div>
              <div>
                <label className="block text-black mb-1">City</label>
                <input
                  name="city"
                  value={form.city || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-black mb-1">Occupation</label>
                <input
                  name="occupation"
                  value={form.occupation || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-black mb-1">Birth Date</label>
                <input
                  name="birthDate"
                  type="date"
                  value={form.birthDate || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-black mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-black mb-1">
                  Language Preference
                </label>
                <select
                  name="languagePreference"
                  value={form.languagePreference || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 focus:bg-white"
                  required
                >
                  <option value="">Select a language...</option>
                  <option value="ARABIC">ARABIC</option>
                  <option value="FRENCH">FRENCH</option>
                  <option value="ENGLISH">ENGLISH</option>
                </select>
              </div>
              <div>
                <label className="block text-black mb-1">Active</label>
                <select
                  name="active"
                  value={
                    form.active === undefined
                      ? ""
                      : form.active
                      ? "true"
                      : "false"
                  }
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.value === "true" })
                  }
                  className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 focus:bg-white"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
                <div>
                <label className="block text-black mb-1">Password</label>
                <div className="relative">
                  <input
                  name="password"
                  type={form.showPassword ? "text" : "password"}
                  value={form.password || ""}
                  onChange={handleInput}
                  className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white pr-10"
                  required
                  />
                  <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() =>
                    setForm((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                    }))
                  }
                  >
                  {form.showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                </div>
              {/* Subtype-specific fields */}
              {isRegularUser(form.role || "") && (
                <div>
                  <label className="block text-black mb-1">
                    First Time Login
                  </label>
                  <select
                    name="firstTimeLogin"
                    value={
                      form.firstTimeLogin === undefined
                        ? ""
                        : form.firstTimeLogin
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        firstTimeLogin: e.target.value === "true",
                      })
                    }
                    className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 focus:bg-white"
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              )}
              {isServiceProvider(form.role || "") && (
                <>
                  <div>
                    <label className="block text-black mb-1">Service</label>
                    <input
                      name="service"
                      value={form.service || ""}
                      onChange={handleInput}
                      className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-700 bg-gray-100 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-black mb-1">Is Approved</label>
                    <select
                      name="isApproved"
                      value={
                        form.isApproved === undefined
                          ? ""
                          : form.isApproved
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isApproved: e.target.value === "true",
                        })
                      }
                      className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 focus:bg-white"
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loading || uploadingImage}
                >
                  {creating ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => {
                    setCreating(false);
                    setEditingUser(null);
                    setForm({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Users Table (unchanged) */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-slate-900 text-slate-900 rounded-xl shadow">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left">Image</th>
                  <th className="py-3 px-4 border-b text-left">First Name</th>
                  <th className="py-3 px-4 border-b text-left">Last Name</th>
                  <th className="py-3 px-4 border-b text-left">Email</th>
                  <th className="py-3 px-4 border-b text-left">Phone Number</th>
                  <th className="py-3 px-4 border-b text-left">Role</th>
                  <th className="py-3 px-4 border-b text-left">Country</th>
                  <th className="py-3 px-4 border-b text-left">City</th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-900 text-slate-900 hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">
                      <img
                        src={
                          user.profilImg && user.profilImg !== "undefined"
                            ? user.profilImg
                            : "/default-avatar.png"
                        }
                        alt={user.firstName + " " + user.lastName}
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (
                            target.src !==
                            window.location.origin + "/default-avatar.png"
                          ) {
                            target.src = "/default-avatar.png";
                          }
                        }}
                      />
                    </td>
                    <td className="py-2 px-4">{user.firstName}</td>
                    <td className="py-2 px-4">{user.lastName}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.phoneNumber || "-"}</td>
                    <td className="py-2 px-4">{user.role}</td>
                    <td className="py-2 px-4">{user.country || "-"}</td>
                    <td className="py-2 px-4">{user.city || "-"}</td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
