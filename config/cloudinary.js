const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// .trim() par sécurité : une variable d'environnement copiée/retapée sur mobile
// peut parfois contenir un espace ou un retour à la ligne invisible, ce qui
// fait échouer Cloudinary avec une erreur "Invalid cloud_name" trompeuse.
cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

// Stockage des images produits dans un dossier dédié "azaratti/produits"
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "azaratti/produits",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  },
});

// Stockage séparé pour les images de contenu (bannières, roue Collection Explorer, etc.)
const contentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "azaratti/contenu",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
  },
});

module.exports = { cloudinary, productStorage, contentStorage };
