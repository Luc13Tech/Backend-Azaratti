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
// Liste des origines autorisées à appeler l'API. On inclut les variantes
// avec et sans "www" pour éviter tout blocage CORS si le domaine est
// configuré différemment sur Vercel.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://azaratti.com",
  "https://www.azaratti.com",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // "origin" est vide pour les appels sans navigateur (ex: tests, curl) → on autorise
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origine non autorisée par la politique CORS."));
      }
    },
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

// Vérification au démarrage : alerte clairement dans les logs Render si une
// variable Cloudinary manque, au lieu de laisser échouer silencieusement
// au moment de la publication d'un article.
["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].forEach((key) => {
  if (!process.env[key] || !process.env[key].trim()) {
    console.warn(`⚠️ Variable d'environnement manquante ou vide : ${key}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur AzaRatti démarré sur le port ${PORT}`);
});
