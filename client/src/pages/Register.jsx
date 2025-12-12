import React, { useState, useEffect, useMemo } from "react";
import axios from "../api/axiosInstance";
import { saveToken, saveUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
    const count = isMobile ? 20 : 35;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      scale: 0.7 + Math.random(),
      opacity: 0.25 + Math.random() * 0.5,
      duration: 10 + Math.random() * 12,
    }));
  }, []);

  const handleSubmit = async (e) => {

    console.log({
  username: name,
  email,
  password,
});

    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      return setError("All fields are required");
    }

    try {
      setBusy(true);

      const res = await axios.post("/auth/register", {
        username: name.trim(),
        email: email.trim(),
        password,
      });

      const token = res?.data?.token;
      const user = res?.data?.user;

     
      if (token) saveToken(token);
      if (user) saveUser(user);

      navigate("/dashboard");

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message;
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center relative overflow-hidden px-4">

      {/* --- Styles for glow + particles --- */}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }
        .float { animation: floatY 14s ease-in-out infinite; }

        .noct-particle {
          position: absolute;
          width: 2px; height: 2px;
          border-radius: 999px;
          background: white;
          filter: blur(1.5px);
        }

        @media (max-width: 640px) {
          .noct-glow-main {
            opacity: 0.4 !important;
            filter: blur(38px) !important;
          }
        }
      `}</style>

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[22%] w-[820px] h-[460px] rounded-full blur-3xl noct-glow-main"
          style={{
            background:
              "radial-gradient(circle, rgba(111,93,247,0.18), rgba(20,20,30,0) 70%)",
            opacity: 0.7,
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

      {/* REGISTER BOX */}
      <div
        className="
          w-full max-w-md p-8 sm:p-10
          rounded-2xl reveal opacity-0 translate-y-6
          transition-all duration-700
        "
        style={{
          background: "rgba(20, 17, 28, 0.55)",
          backdropFilter: "blur(10px) saturate(130%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "0 0 40px rgba(111,93,247,0.12), 0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-center bg-linear-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
          Join <span className="text-indigo-400 font-medium">Noctura</span>
        </p>

        {/* === FORM === */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="mt-2 w-full p-3 bg-[#1d1b25] border border-white/10 rounded-xl text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full p-3 bg-[#1d1b25] border border-white/10 rounded-xl text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="mt-2 w-full p-3 bg-[#1d1b25] border border-white/10 rounded-xl text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Error message */}
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
              w-full py-3 rounded-xl font-medium text-white
              bg-linear-to-r from-indigo-600 to-purple-600
              hover:from-indigo-500 hover:to-purple-500
              transition-all duration-300 shadow-lg disabled:opacity-60
            "
          >
            {busy ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
