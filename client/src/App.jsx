/**
 * Noctura — Productivity Suite
 * Created by: Vaidika Kaul
 * GitHub: https://github.com/vaidika1410
 */

import Login from './pages/Login.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import LandingPage from './pages/LandingPage.jsx'
import TodoList from './components/todo/TodoList.jsx'
import KanbanBoard from './components/kanban/KanbanBoard.jsx'
import HabitTracker from './components/habits/HabitTracker.jsx'
import NightPlanner from './components/nightPlanner/NightPlanner.jsx'
import CalendarPage from './components/calendar/CalendarPage.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Settings from './pages/Settings.jsx'
import HabitAnalytics from './components/habits/HabitAnalytics.jsx'
import Register from './pages/Register.jsx'
import Journal from './components/nightPlanner/Journal.jsx'

const App = () => {
  return (
    <>
      <div className='min-h-screen bg-noctura-bg text-white'>
        <BrowserRouter>
        <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/todo" element={<TodoList />} />
            <Route path="/dashboard/kanban" element={<KanbanBoard />} />
            <Route path="/dashboard/habits" element={<HabitTracker />} />
            <Route path="/dashboard/nightPlanner" element={<NightPlanner />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/habit-analytics" element={<HabitAnalytics />} />
            <Route path="/journal" element={<Journal />} />


          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App