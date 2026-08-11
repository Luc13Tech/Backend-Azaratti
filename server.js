require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const contentRoutes = require("./routes/content");

const app = express();

// Connexion à la base de données MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Route de vérification que l'API est en ligne
app.get("/", (req, res) => {
  res.json({ success: true, message: "🟢 API AzaRatti opérationnelle" });
});

// Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/content", contentRoutes);

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

// Gestion centralisée des erreurs (ex: erreurs multer/cloudinary)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Erreur serveur." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur AzaRatti démarré sur le port ${PORT}`);
});
