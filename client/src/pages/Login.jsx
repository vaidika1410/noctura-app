import React, { useState, useEffect, useMemo } from "react";
import axios from "../api/axiosInstance";
import { saveToken, saveUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Login() {

  localStorage.removeItem("reminders");
  localStorage.removeItem("night-planner");
  localStorage.removeItem("calendar-data");
  localStorage.removeItem("habit-tracker");
  localStorage.removeItem("kanban-cache");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const particles = useMemo(() => {
    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 25 : 40;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      scale: 0.8 + Math.random(),
      opacity: 0.2 + Math.random() * 0.6,
      duration: 10 + Math.random() * 10,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const toastId = toast.loading("Signing in...");
      setBusy(true);

      // FIXED API ENDPOINT
      const res = await axios.post("/api/auth/login", { email, password });

      toast.success("Welcome back 👋", { id: toastId });
      const token = res?.data?.token;
      const user = res?.data?.user;

      if (!token) {
        setError("Login succeeded but no token received");
        return;
      }

      saveToken(token);
      if (user) saveUser(user);

      navigate("/dashboard");
    } catch (err) {
      const res = err?.response?.data;

      if (res?.needsVerification) {
        toast.error("Please verify your email first");
        navigate("/verify-otp", { state: { email: res.email } });
        return;
      }

      const msg =
        res?.error ||
        err?.message ||
        "Login failed";

      toast.error(msg);
      setError(msg);
    }
    finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center relative overflow-hidden px-4">

      {/* Animations + utilities */}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .float {
          animation: floatY 12s ease-in-out infinite;
        }
        .noct-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 999px;
          background: white;
          filter: blur(1px);
        }

        /* MOBILE GLOW REDUCTION */
        @media (max-width: 640px) {
          .noct-glow-main {
            opacity: 0.45 !important;
            filter: blur(40px) !important;
          }
        }
      `}</style>

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[22%] w-[850px] h-[480px] rounded-full blur-3xl noct-glow-main"
          style={{
            background:
              "radial-gradient(circle, rgba(111,93,247,0.18), rgba(20,20,30,0) 70%)",
            opacity: 0.75,
          }}
        />
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="noct-particle float"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: `scale(${p.scale})`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* LOGIN BOX */}
      <div
        className="
          w-full max-w-md p-8 sm:p-10 
          rounded-2xl reveal opacity-0 translate-y-6 transition-all duration-700
        "
        style={{
          background: "rgba(20, 17, 28, 0.55)",
          backdropFilter: "blur(10px) saturate(130%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 0 40px rgba(111,93,247,0.12), 0 0 20px rgba(0,0,0,0.45)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-center bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
          Sign in to <a href="/"><span className="text-indigo-400 font-medium">Noctura</span></a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="
                mt-2 w-full p-3 sm:p-3.5
                bg-[#1d1b25] border border-white/10 
                rounded-xl text-gray-200 focus:outline-none 
                focus:ring-2 focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="
                mt-2 w-full p-3 sm:p-3.5 
                bg-[#1d1b25] border border-white/10 
                rounded-xl text-gray-200 focus:outline-none 
                focus:ring-2 focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={busy}
            className="
              w-full py-3 sm:py-3.5 rounded-xl font-medium text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-500 hover:to-purple-500
              transition-all duration-300 shadow-lg disabled:opacity-60
            "
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}
