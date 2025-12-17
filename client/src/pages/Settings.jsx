
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  saveUser,
  getToken,
  clearToken,
  clearUser,
} from "../utils/auth";
import axios from "../api/axiosInstance";
import toast from "react-hot-toast";


export default function Settings() {
  const navigate = useNavigate();

  const loggedIn = !!getToken();

  const initialUser = loggedIn ? getUser() : { username: "Guest", email: "" };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentUser, setCurrentUser] = useState(initialUser);

  const [activeTab, setActiveTab] = useState("profile");
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: initialUser?.username || "",
    email: initialUser?.email || "",
  });

  const [saving, setSaving] = useState(false);

  const menuItems = [
    { key: "profile", label: "Profile" },
    { key: "preferences", label: "Preferences" },
    { key: "account", label: "Account" },
    { key: "about", label: "About" },
  ];


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);


  useEffect(() => {
    if (!loggedIn) {
      setCurrentUser({ username: "Guest", email: "" });
      setFormData({ username: "Guest", email: "" });
    } else {
      const userFromStorage = getUser();
      setCurrentUser(userFromStorage || { username: "Guest", email: "" });
      setFormData({
        username: userFromStorage?.username || "",
        email: userFromStorage?.email || "",
      });
    }
  }, [loggedIn]);

  
  const handleSaveProfile = async () => {
    if (!loggedIn) return;

    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email) {
      setError("Username and email are required");
      setSaving(false);
      return;
    }

    try {
      const res = await axios.put("/api/auth/update-profile", {
        username: formData.username,
        email: formData.email,
      });

      if (res.data?.success) {
        const updated = res.data.user;
        saveUser(updated);

        setCurrentUser(updated);
        setFormData({
          username: updated.username,
          email: updated.email,
        });

        setSuccess("Profile updated!");
        setEditModalOpen(false);

        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(res.data?.message || "Update failed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Update failed";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };


  function handleLogout() {
    clearToken();
    clearUser();

    toast.success("Logged out successfully 👋");
    navigate("/login", { replace: true }); 
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0b0f] text-gray-100 flex flex-col md:flex-row">
      <style>{`
      .glass {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.04);
        backdrop-filter: blur(10px) saturate(120%);
      }
      .glass-strong {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .fade-in-up {
        animation: fadeUp 360ms ease both;
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="relative hidden md:flex flex-col w-64 p-6 gap-6 glass h-screen  top-0">
        <div>
          <a className="absolute top-8 left-5 h-20 w-30 " href="/dashboard">
          <img className=" h-full w-full object-cover" src="Noctura-logo-full.png" alt="" />
          </a>
          <p className="absolute top-35 text-xs text-gray-400 mt-1">Settings</p>
        </div>

        <nav className="absolute top-40 flex-1 mt-4">
          <ul className="space-y-2">
            {menuItems.map((m) => (
              <li key={m.key}>
                <button
                  onClick={() => setActiveTab(m.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    activeTab === m.key
                      ? "bg-indigo-600/20 text-white"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* USER INFO */}
        <div className="mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.username?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <div className="text-sm font-medium">{currentUser?.username}</div>
              <div className="text-xs text-gray-400">{currentUser?.email}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {loggedIn && (
              <button
                onClick={() => {
                  setEditModalOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm"
              >
                Edit Profile
              </button>
            )}

            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-sm"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-10">
        {/* Mobile header */}
        <div className="md:hidden mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-xs text-gray-400">Customize your experience</p>
        </div>

        <div className="glass-strong p-6 rounded-2xl fade-in-up">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <section>
              <h3 className="text-xl font-semibold mb-2">Profile</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile left block */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="w-28 h-28 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold">
                    {currentUser?.username?.[0]?.toUpperCase() || "G"}
                  </div>

                  <div className="text-center md:text-left">
                    <div className="text-lg font-medium">{currentUser?.username}</div>
                    <div className="text-sm text-gray-400">{currentUser?.email || "—"}</div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    {/* EDIT PROFILE ONLY IF LOGGED IN */}
                    {loggedIn && (
                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
                      >
                        Edit
                      </button>
                    )}

                    {/* LOGIN / LOGOUT */}
                    {loggedIn ? (
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                      >
                        Logout
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>

                {/* Right block */}
                <div className="md:col-span-2">
                  <h4 className="text-sm text-gray-300 mb-2">Account details</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 glass rounded-lg">
                      <div className="text-xs text-gray-400">Username</div>
                      <div className="mt-1 font-medium">{currentUser?.username || "—"}</div>
                    </div>

                    <div className="p-4 glass rounded-lg">
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="mt-1 font-medium">{currentUser?.email || "—"}</div>
                    </div>

                    <div className="p-4 glass rounded-lg">
                      <div className="text-xs text-gray-400">Member since</div>
                      <div className="mt-1 font-medium">
                        {currentUser?.createdAt
                          ? new Date(currentUser.createdAt).toDateString()
                          : loggedIn
                          ? "Unknown"
                          : "—"}
                      </div>
                    </div>

                    <div className="p-4 glass rounded-lg">
                      <div className="text-xs text-gray-400">Role</div>
                      <div className="mt-1 font-medium">
                        {loggedIn ? currentUser?.role || "Member" : "Guest"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <section>
              <h3 className="text-xl font-semibold mb-2">Preferences</h3>
              <p className="text-gray-400 mb-4">Tweak Noctura to your liking.</p>

              <div className="bg-[#0000009d] backdrop-blur-md h-full w-full top-0 left-0 z-10  flex items-center justify-center flex-col rounded-xl p-5 mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-indigo-400">🛠</span> Crafting your vibe…
                </h2>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  We’re working on the Preferences area where you’ll be able to switch themes
                  and make Noctura truly yours. Thanks for your patience!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 glass rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Reduce motion</div>
                      <div className="text-xs text-gray-400">Disable animations for a calmer experience.</div>
                    </div>
                    <input type="checkbox" className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-4 glass rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Disable particles</div>
                      <div className="text-xs text-gray-400">Turn off background particles to improve performance.</div>
                    </div>
                    <input type="checkbox" className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-4 glass rounded-lg md:col-span-2">
                  <div className="text-sm font-medium mb-2">Glow intensity</div>
                  <input type="range" min="0" max="100" defaultValue="60" className="w-full" />
                  <div className="text-xs text-gray-400 mt-1">Adjust how strong background glows appear.</div>
                </div>
              </div>
            </section>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <section>
              <h3 className="text-xl font-semibold mb-2">Account</h3>
              <p className="text-gray-400 mb-4">Security & account management.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 glass rounded-lg">
                  <div className="text-sm text-gray-400">Change password</div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">Change</button>
                    <button className="px-3 py-2 rounded-lg border border-white/8">Forgot password</button>
                  </div>
                </div>

                <div className="p-4 glass rounded-lg">
                  <div className="text-sm text-gray-400">Delete account</div>
                  <div className="mt-3">
                    <button
                      className="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600"
                      onClick={() => {
                        if (confirm("Delete account? This action is irreversible.")) {
                        
                          clearToken();
                          clearUser();
                          navigate("/signup", { replace: true });
                        }
                      }}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <section>
              <h3 className="text-xl font-semibold mb-2">About Noctura</h3>
              <p className="text-gray-400 mb-4">Noctura is built for night owls — a minimal, focused productivity suite with modern aesthetics.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 glass rounded-lg">
                  <div className="text-xs text-gray-400">Version</div>
                  <div className="mt-1 font-medium">0.1.0</div>
                </div>

                <div className="p-4 glass rounded-lg">
                  <div className="text-xs text-gray-400">License</div>
                  <div className="mt-1 font-medium">MIT</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM SHEET */}
      {showMobileSheet && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden ">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMobileSheet(false)}
          />

          <div className="relative w-full max-w-md mx-auto">
            <div className="glass rounded-t-3xl p-4 pb-6 shadow-2xl transform translate-y-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Settings</div>
                <button onClick={() => setShowMobileSheet(false)} className="text-gray-300">Close</button>
              </div>

              <nav className="flex flex-col divide-y divide-white/4">
                {menuItems.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setActiveTab(m.key);
                      setShowMobileSheet(false);
                    }}
                    className="w-full text-left py-4 px-2 text-base"
                  >
                    {m.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && loggedIn && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative w-full max-w-md glass rounded-2xl p-6 z-10">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

            <div className="space-y-3">
              <label className="block text-xs text-gray-400">Username</label>
              <input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-black/30 border border-white/8"
              />

              <label className="block text-xs text-gray-400">Email</label>
              <input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-black/30 border border-white/8"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-3 py-2 rounded-lg border border-white/8"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
