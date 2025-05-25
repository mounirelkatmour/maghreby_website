/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react"; // Add useMemo
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Edit3,
  Save,
  LogOut,
  Image as ImageIcon,
  Globe,
} from "lucide-react";

// Import react-select and country-list
import Select from 'react-select';
import countries from 'country-list'; // Import the default export

interface ExtendedUser {
  sub?: string;
  id?: string;
  name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  role?: string;
  updated_at?: string;
  created_at?: string;
  bio?: string;
  birthdate?: string;
  city?: string;
  country?: string;
  phone?: string;
  occupation?: string;
}

function calculateAge(birthdate?: string) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const diffMs = Date.now() - birth.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function formatDate(dateStr?: string, options?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, options || {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleState, setRoleState] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [memberSince, setMemberSince] = useState("");

  // Generate country options once using useMemo for performance
  const countryOptions = useMemo(() => {
    return countries.getData()
        .filter(country => country.code !== 'IL') // Exclude by code
        // Or, to exclude by name: .filter(country => country.name !== 'Israel')
        .map((country: { code: string; name: string }) => ({
        value: country.code,
        label: country.name,
        }));
    }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      const fetchUserData = async () => {
        let backendUser: any = null;
        const auth0Sub = user.sub;

        if (auth0Sub) {
          try {
            const res = await fetch(`http://localhost:8080/api/users/auth0/${auth0Sub}`);
            if (res.ok) {
              backendUser = await res.json();
            } else if (res.status === 404) {
              console.log("User not found by auth0_id, might be a new user.");
            } else {
              console.error("Failed to fetch user by auth0_id:", res.status);
            }
          } catch (e) {
            console.error("Error fetching user by auth0_id:", e);
          }
        }
        
        if (backendUser) {
          setUserId(backendUser.id);
          setFirstName(
            backendUser.firstName ||
            (typeof user.given_name === "string" ? user.given_name.split(' ')[0] : '')
          );
          setLastName(backendUser.lastName || (user.family_name || (user.name || '').split(' ').slice(1).join(' ')));
          setRoleState(backendUser.role || "USER");
          setBio(backendUser.bio || "");
          setBirthdate(backendUser.birthDate ? new Date(backendUser.birthDate).toISOString().split('T')[0] : "");
          setCity(backendUser.city || "");
          setCountry(backendUser.country || "");
          setPhone(backendUser.phoneNumber || "");
          setOccupation(backendUser.occupation || "");
          setEmail(backendUser.email || user.email || "");
          setProfilePicture(user.picture || backendUser.pictureUrl || "");
          setMemberSince(backendUser.createdAt || user.created_at || "");
        } else {
          const nameParts = (user.name || "").split(" ");
          setFirstName(typeof user.given_name === "string" ? user.given_name : (typeof nameParts[0] === "string" ? nameParts[0] : ""));
          setLastName(typeof user.family_name === "string" ? user.family_name : (nameParts.slice(1).join(" ")));
          setRoleState((user as ExtendedUser).role || "USER");
          setEmail(typeof user.email === "string" ? user.email : "");
          setProfilePicture(typeof user.picture === "string" ? user.picture : "");
          setMemberSince(typeof user.created_at === "string" ? user.created_at : "");
          setBio("");
          setBirthdate("");
          setCity("");
          setCountry("");
          setPhone("");
          setOccupation("");
        }
        setEmailVerified(user.email_verified ?? false);
      };
      fetchUserData();
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    setLogoutLoading(true);
    window.location.href = "/api/auth/logout";
  };

  const handleSave = async () => {
    if (!userId && !user?.sub) {
        console.error("User identifier not found, cannot save profile.");
        // Add user feedback here, e.g., a toast notification
        return;
    }
    setSaving(true);
    try {
      const payload = {
        firstName,
        lastName,
        bio,
        birthDate: birthdate ? new Date(birthdate).toISOString() : null,
        city,
        country,
        phoneNumber: phone,
        occupation,
        ...( !userId && user?.sub && { email: user.email, auth0_id: user.sub } )
      };

      const targetUrl = userId 
        ? `http://localhost:8080/api/users/${userId}` 
        : `http://localhost:8080/api/users`;
      
      const method = userId ? "PATCH" : "POST";

      const res = await fetch(targetUrl, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      const result = await res.json();
      if (!userId && result.id) {
        setUserId(result.id);
      }
      console.log(`✅ Profile ${method === 'POST' ? 'created' : 'updated'}:`, result);
      // Add user feedback here (e.g., toast notification "Profile Saved!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("❌ Failed to save profile:", errorMsg);
      // Add user feedback here (e.g., toast notification with errorMsg)
    } finally {
      setSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-red-200 max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Profile</h2>
          <p className="mb-6 text-gray-700">
            {error?.message || "An unknown error occurred."}
          </p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) return null;

  const userAge = calculateAge(birthdate);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-26 pb-12 px-4 sm:px-6 lg:px-8">
        <header className="max-w-6xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">Manage your profile, and personal information.</p>
        </header>

        <div className="max-w-6xl mx-auto md:grid md:grid-cols-3 md:gap-8 lg:gap-12">
          {/* Left Column: Profile Overview */}
          <aside className="md:col-span-1 mb-8 md:mb-0">
            <div className="p-4 sm:p-6 bg-white shadow-sm rounded-lg border border-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={profilePicture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-200"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">{`${firstName} ${lastName}`}</h2>
                <p className="text-sm text-slate-500 mb-1">{email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${
                  roleState === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {roleState}
                </span>

                <div className="text-xs text-slate-500 w-full pt-3 mt-3 border-t border-slate-200">
                  <p>Joined: {formatDate(memberSince, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  {emailVerified ? (
                    <p className="text-green-600">Email Verified</p>
                  ) : (
                    <p className="text-amber-600">Email Not Verified</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50"
              >
                {logoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500 mr-2"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Right Column: Form */}
          <main className="md:col-span-2">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSave(); }}
              className="bg-white shadow-sm rounded-lg border border-slate-200"
            >
              {/* Personal Information Section */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Personal Information</h3>
                <p className="mt-1 text-sm text-slate-500">Update your personal details here.</p>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                    <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 resize-y" placeholder="A little about yourself..."></textarea>
                  </div>
                  <div>
                    <label htmlFor="birthdate" className="block text-sm font-medium text-slate-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />Date of Birth
                    </label>
                    <input type="date" id="birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900" />
                  </div>
                  {userAge !== null && (
                    <div className="flex flex-col justify-end">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                      <div className="cursor-not-allowed flex items-center px-3 py-2 bg-slate-100 rounded-md border border-slate-200 text-slate-700">
                        <span className="mr-1 text-slate-500">{userAge} years old</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Contact Details Section */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Contact Details</h3>
                <p className="mt-1 text-sm text-slate-500">How we can get in touch with you.</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-display" className="block text-sm font-medium text-slate-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />Email Address
                    </label>
                    <input
                      type="email"
                      id="email-display"
                      value={email}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                      title="Email cannot be changed here"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                      <Globe className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />Country
                    </label>
                    <div>
                      <Select
                        id="country"
                        options={countryOptions}
                        value={countryOptions.find(option => option.value === country) || null}
                        onChange={(selectedOption) => setCountry(selectedOption ? selectedOption.value : '')}
                        classNamePrefix="react-select"
                        placeholder="Select a country..."
                        isClearable
                        isSearchable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor: '#cbd5e1',
                            borderRadius: '0.375rem',
                            boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
                            minHeight: '40px',
                            backgroundColor: 'white',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: '#0f172a',
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: '#0f172a',
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#0f172a',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            color: '#0f172a',
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            color: '#0f172a',
                            backgroundColor: state.isSelected
                              ? '#e0e7ef'
                              : state.isFocused
                              ? '#f1f5f9'
                              : 'white',
                          }),
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Professional Details Section */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Professional Details</h3>
                <p className="mt-1 text-sm text-slate-500">Information about your work.</p>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                    <div className="sm:col-span-2">
                        <label htmlFor="occupation" className="block text-sm font-medium text-slate-700 mb-1">
                        <Briefcase className="w-4 h-4 inline mr-1.5 relative -top-px text-slate-500" />Occupation
                        </label>
                        <input type="text" id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400" placeholder="e.g., Software Engineer" />
                    </div>
                </div>
              </div>

              {/* Save Button Footer */}
              <div className="px-4 py-4 sm:px-6 border-t border-slate-200 bg-slate-50/50 flex justify-end rounded-b-lg">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}