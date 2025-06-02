/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AdminSideBar from "@/app/components/AdminSideBar";
import Select from "react-select";
import countries from "country-list";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import Loader from "@/app/components/Loader";
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Users,
  ChevronDown,
} from "lucide-react";

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
  const { loading, isAdmin } = useAdminGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<User> & { showPassword?: boolean }>({
    showPassword: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [roleFilter, setRoleFilter] = useState("");
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
      if (!isAdmin) return;
      try {
        const res = await fetch("http://localhost:8080/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users");
      }
    }
    fetchUsers();
  }, [isAdmin]);

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
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
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
    }
  };

  // Helper to determine subtype fields
  const isRegularUser = (role: string) => role === "USER";
  const isServiceProvider = (role: string) => role === "SERVICE_PROVIDER";
  const isAdminUser = (role: string) => role === "ADMIN";

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    let matchesSearch = true;
    if (search) {
      if (searchField === "firstName") {
        matchesSearch =
          user.firstName?.toLowerCase().includes(searchLower) ?? false;
      } else if (searchField === "lastName") {
        matchesSearch =
          user.lastName?.toLowerCase().includes(searchLower) ?? false;
      } else if (searchField === "email") {
        matchesSearch =
          user.email?.toLowerCase().includes(searchLower) ?? false;
      } else if (searchField === "phoneNumber") {
        matchesSearch = user.phoneNumber
          ? user.phoneNumber.toLowerCase().includes(searchLower)
          : false;
      } else if (searchField === "id") {
        matchesSearch = user.id?.toLowerCase().includes(searchLower) ?? false;
      }
    }
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <Loader text="Loading users..." />;
  }
  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <div className="flex pt-16 min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 h-full z-30">
          <AdminSideBar />
        </div>{" "}
        <main className="flex-1 ml-64 p-8">
          {/* Enhanced Filter Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Search & Filter Users
              </h2>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 gap-4">
              {/* Search Section */}
              <div className="flex-1 flex gap-2">
                <div className="relative">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="appearance-none border border-gray-300 px-4 py-3 pr-8 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="id">ID</option>
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="email">Email</option>
                    <option value="phoneNumber">Phone Number</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder={`Search by ${searchField
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="w-full lg:w-64">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none w-full border border-gray-300 pl-10 pr-8 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">Regular Users</option>
                    <option value="SERVICE_PROVIDER">Service Providers</option>
                    <option value="ADMIN">Administrators</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {users.length}
                </span>{" "}
                users
              </p>
            </div>
          </div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                User Management
              </h1>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => {
                setCreating(true);
                setForm({});
                setEditingUser(null);
              }}
            >
              <UserPlus className="h-5 w-5" />
              Add New User
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}{" "}
          {/* Create/Edit Form */}
          {(creating || editingUser) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                {creating ? (
                  <>
                    <UserPlus className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      Create New User
                    </h2>
                  </>
                ) : (
                  <>
                    <Edit2 className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      Edit User
                    </h2>
                  </>
                )}
              </div>
              <form
                onSubmit={creating ? handleCreate : handleUpdate}
                className="flex flex-col gap-6"
              >
                {/* Profile Image Upload */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-gray-700 font-semibold mb-3">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={form.profilImg || "/default-avatar.png"}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
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
                        className={`inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingImage ? "Uploading..." : "Change Image"}
                      </label>
                      {uploadingImage && (
                        <p className="mt-2 text-sm text-gray-500">
                          Please wait while we upload your image...
                        </p>
                      )}
                    </div>
                  </div>
                </div>{" "}
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={form.role || "USER"}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="USER">Regular User</option>
                      <option value="SERVICE_PROVIDER">Service Provider</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Language Preference
                    </label>
                    <select
                      name="languagePreference"
                      value={form.languagePreference || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select a language...</option>
                      <option value="ARABIC">Arabic</option>
                      <option value="FRENCH">French</option>
                      <option value="ENGLISH">English</option>
                    </select>
                  </div>
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
                </div>{" "}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={form.showPassword ? "text" : "password"}
                      value={form.password || ""}
                      onChange={handleInput}
                      className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          showPassword: !prev.showPassword,
                        }))
                      }
                    >
                      {form.showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
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
                      <label className="block text-black mb-1">
                        Is Approved
                      </label>
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
                )}{" "}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={uploadingImage}
                  >
                    {creating ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create User
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4" />
                        Update User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
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
            </div>
          )}{" "}
          {/* Enhanced Users Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <img
                          src={
                            user.profilImg && user.profilImg !== "undefined"
                              ? user.profilImg
                              : "/default-avatar.png"
                          }
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
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
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.phoneNumber || "No phone"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "SERVICE_PROVIDER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role === "SERVICE_PROVIDER"
                            ? "Service Provider"
                            : user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            {user.country || "Not specified"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.city || "No city"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                            onClick={() => handleDelete(user.id)}
                            title="Delete user"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 px-6 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-gray-300" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">
                            Try adjusting your search criteria or add a new
                            user.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
