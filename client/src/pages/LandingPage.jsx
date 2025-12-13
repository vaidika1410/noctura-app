import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  // Responsive particle count 
  const [particleCount, setParticleCount] = useState(70);

  useEffect(() => {
    function calcCount() {
      const w = window.innerWidth;
      if (w < 640) return 20; 
      if (w < 1024) return 40; 
      return 70; 
    }
    setParticleCount(calcCount());

    let t;
    function onResize() {
      clearTimeout(t);
      t = setTimeout(() => setParticleCount(calcCount()), 120);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      top: Math.floor(Math.random() * 100),
      left: Math.floor(Math.random() * 100),
      scale: (0.6 + Math.random() * 1.6).toFixed(2),
      opacity: (0.12 + Math.random() * 0.78).toFixed(2),
      duration: 7 + Math.floor(Math.random() * 14),
      delay: (Math.random() * 8).toFixed(2),
    }));
  }, [particleCount]);

  const featureList = [
    { title: "Task Management", text: "Organize tasks with priorities, filters and powerful views." },
    { title: "Habit Tracking", text: "Build streaks and visualize progress." },
    { title: "Kanban Workflow", text: "Drag-and-drop boards for clean workflows." },
    { title: "Night Planner", text: "Wind down with guided evening routines." },
    { title: "Calendar View", text: "See tasks, reminders and plans at a glance." },
    { title: "Dark Aesthetic", text: "A premium UI optimized for night owls." },
  ];

  const featureDetails = {
  "Task Management": {
    route: "/dashboard?section=todo",
    description:
      "Noctura’s task system helps you stay organized with a clean workflow. Prioritize, schedule, and manage tasks effortlessly using a beautifully crafted UI.",
    points: [
      "Create, edit, and delete tasks quickly",
      "Priorities & deadlines with visual indicators",
      "Filters for pending, completed, and priority levels",
      "Calendar integration for date-based planning",
      "Clean and distraction-free layout"
    ]
  },

  "Habit Tracking": {
    route: "/dashboard?section=habits",
    description:
      "Track habits and build consistency with streaks, weekly insights, and minimal habit cards designed to keep you motivated.",
    points: [
      "Daily, weekly, and monthly habit schedules",
      "Automatic streak tracking",
      "Minimal and clear habit cards",
      "Progress insights and habit analytics"
    ]
  },

  "Kanban Workflow": {
    route: "/dashboard?section=kanban",
    description:
      "Visualize and manage your tasks using a Kanban board designed for clarity, speed, and smooth drag-and-drop interaction.",
    points: [
      "Drag & drop task movement",
      "Custom workflow stages",
      "Clean swimlane visualization",
      "Fast and responsive UI"
    ]
  },

  "Night Planner": {
    route: "/dashboard?section=nightPlanner",
    description:
      "Plan your evenings with a calming night-routine system. Reduce stress, reflect on your day, and reset your mind.",
    points: [
      "Build a relaxing nightly checklist",
      "Daily reflection logging",
      "Self-care reminders",
      "Supports consistent, healthy sleep habits"
    ]
  },

  "Calendar View": {
    route: "/dashboard?section=calendar",
    description:
      "A powerful calendar that lets you see tasks, reminders, and priorities at a glance.",
    points: [
      "Daily overview of tasks & reminders",
      "Color-coded priority indicators",
      "Sidebar view when selecting a date",
      "Integrated with all Noctura modules"
    ]
  },

  "Dark Aesthetic": {
    route: "/settings",
    description:
      "Enjoy Noctura’s signature premium dark theme with glassmorphism, gradients, and soft neon accents.",
    points: [
      "Glassy UI with premium gradients",
      "Eye-friendly low-contrast palette",
      "Neon accents and subtle glows",
      "Modern, minimal, night-optimized design"
    ]
  }
};


  // Modal State
  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const LearnModal = () => {
    if (!learnModalOpen || !activeFeature) return null;

    const data = featureDetails[activeFeature];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-200">
        <div className="bg-[#1a1a22]/80 border border-white/10 rounded-2xl p-6 w-full max-w-md backdrop-blur-2xl shadow-2xl relative">

          <h2 className="text-2xl font-bold bg-linear-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            {activeFeature}
          </h2>

          <p className="text-gray-300 mt-3 text-sm leading-relaxed">
            {data.description}
          </p>

          <ul className="mt-4 space-y-2 text-gray-400 text-sm">
            {data.points.map((p, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-indigo-400">•</span>
                {p}
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setLearnModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition text-sm"
            >
              Close
            </button>

            <button
              onClick={() => navigate(data.route)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition text-sm"
            >
              Go to Module
            </button>
          </div>
        </div>
      </div>
    );
  };

  // scroll reveal
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { threshold: 0.14 }
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0b0b0f] text-gray-100 relative">

      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
        @keyframes neonShift {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(12deg); }
          100% { filter: hue-rotate(0deg); }
        }
        .noct-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.04));
          will-change: transform, opacity;
          filter: blur(0.6px);
        }
        .animate-float {
          animation-name: floatY;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[15%] rounded-full blur-3xl"
          style={{
            width: "82vw",
            maxWidth: "1100px",
            height: "42vw",
            maxHeight: "520px",
            background:
              "radial-gradient(circle, rgba(111,93,247,0.16), rgba(147,92,240,0.07) 40%, rgba(12,12,20,0) 70%)",
          }}
        />
      </div>

      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="noct-particle animate-float"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: `scale(${p.scale})`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">

        <nav className="fixed top-0 left-0 w-full z-30 backdrop-blur-md bg-[#0b0b10]/28 border-b border-gray-500/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6">
            {/* <h1
              onClick={() => navigate("/")}
              className="text-lg sm:text-xl font-semibold cursor-pointer bg-linear-to-br from-indigo-300 to-purple-300 bg-clip-text text-transparent"
            >
              Noctura
            </h1> */}
            <a className=" h-15 w-30 overflow-hidden" href="/">
            <img className="h-full w-full object-cover scale-[1.3]" src="Noctura-logo-full.png" alt="Noctura" />
            </a>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-3 py-2 text-sm border border-gray-600 hover:bg-gray-800 rounded-lg transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        <header className="relative flex flex-col items-center text-center px-4 pt-24 pb-16 max-w-xl mx-auto">
          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold reveal opacity-0 translate-y-6 transition-all duration-700">
            <span className="bg-linear-to-br from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Noctura
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg mt-4 leading-relaxed reveal opacity-0 translate-y-6 transition-all duration-700 delay-100">
            Own your day. Rule your night. A beautifully crafted productivity suite designed for night owls and deep thinkers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 reveal opacity-0 translate-y-6 transition-all duration-700 delay-200">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-all shadow-md"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 border border-gray-700 hover:bg-gray-800 rounded-lg font-medium transition-all"
            >
              Sign Up
            </button>
          </div>
        </header>

        {/* FEATURES GRID */}
        <main className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-24 overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12 bg-linear-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent reveal opacity-0 translate-y-6 transition-all duration-700">
            What Noctura Offers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featureList.map((f, i) => (
              <article
                key={i}
                style={{ transitionDelay: `${120 + i * 70}ms` }}
                className="reveal opacity-0 translate-y-6 transition-all duration-700"
              >
                <div className="neon-card">
                  <div className="neon-accent" />
                  <div className="neon-card-inner p-5 sm:p-6 rounded-xl">

                    <h3 className="feature-title text-base sm:text-lg font-semibold text-white mb-1">
                      {f.title}
                    </h3>

                    <p className="text-gray-300 text-sm">{f.text}</p>

                    {/* Explore + Learn Buttons */}
                    <div className="mt-4 flex items-center gap-3">

                      {/* EXPLORE BUTTON → navigate */}
                      <button
                        className="px-3 py-1 text-xs rounded-md bg-white/10 border border-white/50 cursor-pointer text-white hover:bg-white/20 transition"
                        onClick={() => navigate(featureDetails[f.title].route)}
                      >
                        Explore
                      </button>

                      {/* LEARN BUTTON → modal */}
                      <button
                        className="px-3 py-1 text-xs rounded-md bg-indigo-900/20 border border-white-700/70 text-indigo-300 cursor-pointer hover:bg-indigo-900/40 transition"
                        onClick={() => {
                          setActiveFeature(f.title);
                          setLearnModalOpen(true);
                        }}
                      >
                        Learn
                      </button>

                    </div>

                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="mt-6 py-10 backdrop-blur-lg bg-white/5 border-t border-gray-800/30 text-center">
          <p className="text-gray-400 mb-4">
            © {new Date().getFullYear()} Noctura • Created by Vaidika Kaul
          </p>
          <div className="flex justify-center gap-6 text-gray-400">
            <a href="#" className="hover:text-indigo-400 transition">GitHub</a>
            <a href="#" className="hover:text-indigo-400 transition">Twitter</a>
            <a href="#" className="hover:text-indigo-400 transition">Contact</a>
          </div>
        </footer>

        {learnModalOpen && <LearnModal />}

      </div>
    </div>
  );
}
