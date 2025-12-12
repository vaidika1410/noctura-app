/**
 * Noctura — Productivity Suite
 * Created by: Vaidika Kaul
 * GitHub: https://github.com/vaidika1410
 */


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✔ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  });

const allowedOrigins = [
  "http://localhost:5173",          
  "https://noctura-frontend.onrender.com" 
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked: " + origin), false);
    }
  },
  credentials: true,
}));

app.use(express.json());

const authLogger = (req, res, next) => {
  console.log("========== AUTH LOG ==========");
  console.log(req.method, req.originalUrl);
  console.log("Headers:", {
    authorization: req.headers.authorization,
    "content-type": req.headers["content-type"]
  });
  console.log("Body:", req.body);
  console.log("==============================");
  next();
};

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const bedtimeRoutes = require('./routes/bedtimeRoutes');
const habitRoutes = require('./routes/habitRoutes');
const kanbanRoutes = require('./routes/kanbanRoutes');
const nightEntryRoutes = require("./routes/nightEntryRoutes");

const authMiddleware = require('./middleware/authMiddleware');


// Public Routes
if (process.env.NODE_ENV !== "production") {
  app.use('/api/auth', authLogger, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}

// Protected Routes 
app.use(express.json());

app.use('/api/todo', authMiddleware, taskRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/night-tasks', authMiddleware, bedtimeRoutes);
app.use('/api/kanban', authMiddleware, kanbanRoutes);
app.use("/api/reminders", authMiddleware, require("./routes/reminderRoutes"));
app.use("/api/night-entry", authMiddleware, nightEntryRoutes);


app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.get('/', (req, res) => {
  res.send('Noctura server running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
