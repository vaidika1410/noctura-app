# **Noctura – Master Your Day, Embrace the Night**

### **Requirements Specification**

Noctura is a modern, dark-themed productivity web application that combines a powerful to-do system, a habit tracker, a Kanban-style workflow, and optional nighttime planning tools. The app is fully responsive and works smoothly across all devices.

---

## **1. Core Features**

### **1.1 Day Planner**
- Displays a calendar view:
  - **Mobile:** calendar at the top
  - **Large screens:** calendar panel positioned on the top-right
- Shows the current day, upcoming events, reminders, and planned tasks.

### **1.2 Optional Night Planner**
- A dedicated section for users who want to track nighttime activities such as:
  - Reading  
  - Meditation  
  - Skincare  
  - Preparing for next day  
- This module is **optional** and can be toggled ON/OFF in settings.

### **1.3 Kanban Board**
- Columns for:
  - Backlog  
  - Pending  
  - In-Progress  
  - Completed  
- Tasks can be dragged & dropped across columns (touch + mouse compatible).
- Fully responsive experience for laptops, tablets, and phones.

### **1.4 Habit Tracker**
- **Mobile:** Visualization chart at the top; habit blocks below.
- **Large screens:** 
  - Visualization on the top-right  
  - Habit list on the left beside navigation  
- Each habit can be added, modified, or deleted easily.

### **1.5 General UI Requirements**
- Dark, minimal, modern design (black/white/grey aesthetic).
- Smooth animations and clear visual hierarchy.
- Responsive layouts for phones, tablets, laptops, and desktops.
- Compatible with all major browsers.

---

## **2. Pages**

### **2.1 Landing Page**
- Highlights app features.
- “How it works” scroll guide.
- Prominent login button with strong visual emphasis.

### **2.2 Dashboard**
#### **Mobile Layout**
- Divided into switchable sections:
  - Kanban  
  - To-Do List  
  - Habits  
  - Night Planner (if enabled)  
  - Reminders  
  - Calendar  
  - Settings  
- A welcome message appears on the top.

#### **Large Screen Layout**
- **Primary Sidebar (left):** Home, Settings, Kanban, Habits, Night Planner.
- **Secondary Sidebar (nested left):** All Tasks, In-Progress, Notes, Reminders, etc.  
- **Top-Right Panel:** Calendar overview.
- **Main Section:** Task summaries (Completed, Pending, In-Progress) with drill-down capability.

### **2.3 To-Do List Page**
- Filters:
  - All Tasks  
  - Pending  
  - In-Progress  
  - Completed  
- Actions:
  - Add Task  
  - Edit Task  
  - Delete Task  
  - Mark as Completed  

### **2.4 Kanban Board Page**
- Drag-and-drop board with customizable tags/columns.
- Each column represents a task stage.
- Tasks open detailed view on click.

### **2.5 Night Planner Page (Optional)**
- Visible only if enabled in settings.
- Tracks nighttime routines & self-care habits.

### **2.6 Habit Tracker Page**
- Shows progress visualization.
- Habit blocks with edit/delete options.

---

## **3. Routing Logic**
- Landing → Login  
- Successful Login → Dashboard  
- Dashboard → Routes to respective pages  
- Protected routes require authentication  
- Night Planner only appears if user has enabled it  

---

## **4. Tech Stack**
- **Frontend:** React.js  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB  
- **APIs:**  
  - REST API  
  - Google Calendar API  
  - Visualization/charting API (e.g., Recharts / Chart.js)  
- **Hosting:** Render  

---


### ✨ Author

**Noctura** was created and designed by **Vaidika Kaul**.  
All rights reserved. You are free to clone and learn from the project,
but credit is required if you use or modify significant portions of the code.

# **End of Requirements Document**
