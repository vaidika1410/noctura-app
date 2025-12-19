import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import TodoList from '../components/todo/TodoList';
import KanbanBoard from '../components/kanban/KanbanBoard';
import HabitTracker from '../components/habits/HabitTracker';
import NightPlanner from '../components/nightPlanner/NightPlanner';
import { useLocation } from "react-router-dom";

import { getUser } from "../utils/auth";
import CalendarWidget from '../components/calendar/CalendarWidget';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('todo');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openAddTodoModal, setOpenAddTodoModal] = useState(false);
  const navigate = useNavigate();
  const [showMobileNavSheet, setShowMobileNavSheet] = useState(false);


  const savedUser = getUser();
  const location = useLocation();

  const getSectionFromPath = (pathname) => {
  if (pathname.includes("/kanban")) return "kanban";
  if (pathname.includes("/habits")) return "habits";
  if (pathname.includes("/nightPlanner")) return "nightPlanner";
  if (pathname.includes("/calendar")) return "calendar";
  return "todo";
};


  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 1️⃣ Highest priority: URL path
  const sectionFromPath = getSectionFromPath(location.pathname);
  setActiveSection(sectionFromPath);

  // 2️⃣ Optional: legacy ?section= support (keep if you want)
  const params = new URLSearchParams(location.search);
  const sectionFromQuery = params.get("section");

  if (sectionFromQuery) {
    const validSections = ["todo", "kanban", "habits", "nightPlanner", "calendar"];
    if (validSections.includes(sectionFromQuery)) {
      if (sectionFromQuery === "calendar") {
        navigate("/calendar", { replace: true });
      } else {
        setActiveSection(sectionFromQuery);
      }
    }
  }
}, [location.pathname, location.search]);



  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#151517', color: 'white' }}>

      {/* SIDEBAR */}
      <aside
        className="hidden md:flex flex-col w-48 p-4 fixed h-[100%] z-30"
        style={{ backgroundColor: '#1B1B1D', borderRight: '1px solid #202022' }}
      >
        {/* <h1 className="text-2xl font-semibold mb-6">Noctura</h1> */}
        {/* <h1
              onClick={() => navigate("/")}
              className="text-lg sm:text-xl font-semibold cursor-pointer bg-linear-to-br from-indigo-300 to-purple-300 bg-clip-text text-transparent"
            >
              Noctura
            </h1> */}
            <a className=' h-18 w-15 mb-5' href="/">
            <img className='h-full w-full object-cover' src="Noctura-logo.png" alt="Noctura" />
            </a>

        <nav className="flex flex-col space-y-2">
          {[
            { key: "todo", label: "Tasks" },
            { key: "kanban", label: "Pipeline" },
            { key: "habits", label: "Routine" },
            { key: "nightPlanner", label: "Shutdown" },
            { key: "calendar", label: "Calendar" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "calendar") {
                  navigate("/calendar");
                } else {
                  setActiveSection(item.key);
                }
              }}
              className="text-left p-2 rounded transition cursor-pointer"
              style={{
                backgroundColor:
                  activeSection === item.key ? "#202022" : "transparent",
                color: activeSection === item.key ? "white" : "#A1A1A5",
                fontWeight: activeSection === item.key ? "600" : "400",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {/* SETTINGS ICON BUTTON */}
        <div className="flex justify-end absolute bottom-4">
          <button
            onClick={() => navigate("/settings")}
            className="settings p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all 
               backdrop-blur-lg shadow-md hover:shadow-gray-500/20"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cog-icon lucide-cog"><path d="M11 10.27 7 3.34" /><path d="m11 13.73-4 6.93" /><path d="M12 22v-2" /><path d="M12 2v2" /><path d="M14 12h8" /><path d="m17 20.66-1-1.73" /><path d="m17 3.34-1 1.73" /><path d="M2 12h2" /><path d="m20.66 17-1.73-1" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path d="m3.34 7 1.73 1" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="12" r="8" /></svg>
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-0 md:ml-48 p-4 md:p-8">

        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-200">
            Welcome, {savedUser?.username || "Guest"} 👋
          </h1>
          <p style={{ color: "#A1A1A5" }}>
            Here's your productivity overview.
          </p>
        </div>

        {/* Desktop Calendar */}
        <div className="hidden md:flex justify-end mb-4">
          <CalendarWidget
            onDateSelect={(d) => setSelectedDate(d)}
            onAddTask={(d) => {
              setSelectedDate(d);
              setOpenAddTodoModal(true);
              setActiveSection("todo");
            }}
          />
        </div>

        {/* Mobile Calendar */}
        <div className="md:hidden fixed bottom-5 right-5 z-50">
          <CalendarWidget
            onDateSelect={(d) => setSelectedDate(d)}
            onAddTask={(d) => {
              setSelectedDate(d);
              setOpenAddTodoModal(true);
              setActiveSection("todo");
            }}
          />
        </div>

        {/* SECTION VIEW */}
        <div className="mt-4">
          {activeSection === "todo" && (
            <TodoList
              selectedDate={selectedDate}
              openAddTodoModal={openAddTodoModal}
              setOpenAddTodoModal={setOpenAddTodoModal}
            />
          )}

          {activeSection === "kanban" && <KanbanBoard />}
          {activeSection === "habits" && <HabitTracker />}
          {activeSection === "nightPlanner" && <NightPlanner />}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      {/* Mobile Nav - ALWAYS fixed */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-[200] pointer-events-none">
        <div className="glass backdrop-blur-lg border-t border-white/10 px-4 py-2 flex items-center justify-between pointer-events-auto">

          {/* Todo */}
          <button
            onClick={() => setActiveSection("todo")}
            className="flex flex-col items-center text-xs"
          >
            <i className="fa-solid fa-list-check text-lg"></i>
            <span>Tasks</span>
          </button>

          {/* Kanban */}
          <button
            onClick={() => setActiveSection("kanban")}
            className="flex flex-col items-center text-xs"
          >
            <i className="fa-solid fa-table-columns text-lg"></i>
            <span>Pipeline</span>
          </button>

          {/* Habits */}
          <button
            onClick={() => setActiveSection("habits")}
            className="flex flex-col items-center text-xs"
          >
            <i className="fa-solid fa-heart text-lg"></i>
            <span>Routine</span>
          </button>

          {/* Night Planner */}
          <button
            onClick={() => setActiveSection("nightPlanner")}
            className="flex flex-col items-center text-xs"
          >
            <i className="fa-solid fa-moon text-lg"></i>
            <span>Shutdown</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowMobileNavSheet(true)}
            className="flex flex-col items-center text-xs"
          >
            <i className="fa-solid fa-gear text-lg"></i>
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* MOBILE NAV SHEET (Slide-up) */}
      {showMobileNavSheet && (
        <div className="fixed inset-0 z-[999] flex items-end md:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMobileNavSheet(false)}
          />

          {/* Sheet */}
          <div className="relative w-full glass backdrop-blur-sm rounded-t-3xl p-6 animate-[fadeUp_.3s_ease] border-t border-white/20 bg-[#ffffff04]">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Navigation</h3>
              <button onClick={() => setShowMobileNavSheet(false)}>✕</button>
            </div>

            <nav className="flex flex-col gap-4 text-base text-gray-200">

              <button className='pb-4 border-b border-b-white/10' onClick={() => { setActiveSection("todo"); setShowMobileNavSheet(false); }}>
                To-Do List
              </button>

              <button className='pb-4 border-b border-b-white/10' onClick={() => { setActiveSection("kanban"); setShowMobileNavSheet(false); }}>
                Kanban Board
              </button>

              <button className='pb-4 border-b border-b-white/10' onClick={() => { setActiveSection("habits"); setShowMobileNavSheet(false); }}>
                Habits Tracker
              </button>

              <button className='pb-4 border-b border-b-white/10' onClick={() => { setActiveSection("nightPlanner"); setShowMobileNavSheet(false); }}>
                Night Planner
              </button>

              <button className='pb-4 border-b border-b-white/10' onClick={() => { navigate("/calendar"); setShowMobileNavSheet(false); }}>
                Calendar
              </button>

              <button className='pb-4 border-b border-b-white/10' onClick={() => { navigate("/settings"); setShowMobileNavSheet(false); }}>
                Settings
              </button>

              <button onClick={() => { localStorage.clear(); navigate("/login"); }}>
                Logout
              </button>

            </nav>
          </div>
        </div>
      )}


    </div>
  );
}
