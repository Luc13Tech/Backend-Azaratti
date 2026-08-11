const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
