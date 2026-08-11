const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protectAdmin } = require("../middleware/auth");
const { uploadProductImage } = require("../utils/upload");
const { cloudinary } = require("../config/cloudinary");

/* ---------- ROUTES PUBLIQUES ---------- */

// GET /api/products - liste tous les produits (avec filtres optionnels)
// Ex: /api/products?category=Montres&featured=true
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured) filter.featured = req.query.featured === "true";
    if (req.query.inStock) filter.inStock = req.query.inStock === "true";

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - détail d'un produit
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ---------- ROUTES ADMIN (protégées) ---------- */

// POST /api/products - ajouter un nouveau produit avec image depuis la galerie
router.post("/", protectAdmin, uploadProductImage.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image du produit obligatoire." });
    }

    const { title, category, price, description, featured, pinnedAsNew } = req.body;

    const product = await Product.create({
      title,
      category,
      price,
      description,
      featured: featured === "true" || featured === true,
      pinnedAsNew: pinnedAsNew === "true" || pinnedAsNew === true,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - modifier un produit (image optionnelle)
router.put("/:id", protectAdmin, uploadProductImage.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }

    const { title, category, price, description, featured, pinnedAsNew, inStock } = req.body;

    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (featured !== undefined) product.featured = featured === "true" || featured === true;
    if (pinnedAsNew !== undefined) product.pinnedAsNew = pinnedAsNew === "true" || pinnedAsNew === true;
    if (inStock !== undefined) product.inStock = inStock === "true" || inStock === true;

    // Si une nouvelle image est envoyée, on remplace l'ancienne sur Cloudinary
    if (req.file) {
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      }
      product.imageUrl = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - supprimer un produit et son image Cloudinary
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
    }
    await product.deleteOne();

    res.json({ success: true, message: "Produit supprimé." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
