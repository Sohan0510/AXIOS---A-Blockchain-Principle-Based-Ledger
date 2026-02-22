import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import landRoutes from "./routes/landRoutes.js";
import integrityRoutes from "./routes/integrityRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

console.log("SECRET DURING VERIFY:", process.env.JWT_SECRET);


// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working" });
});

app.use("/api/admin/land", landRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/integrity", integrityRoutes);
app.use("/api/public/land", publicRoutes);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
