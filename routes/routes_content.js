const express = require("express");
const router = express.Router();
const Content = require("../models/Content");
const { protectAdmin } = require("../middleware/auth");
const { uploadContentImage } = require("../utils/upload");
const { cloudinary } = require("../config/cloudinary");

/* ---------- ROUTE PUBLIQUE ---------- */

// GET /api/content - renvoie tout le contenu éditable sous forme d'objet { key: valeur }
// pratique pour que le frontend fasse : content.banner_inspiration_texte
router.get("/", async (req, res) => {
  try {
    const items = await Content.find();
    const content = {};
    items.forEach((item) => {
      content[item.key] = item.type === "text" ? item.textValue : item.imageUrl;
    });
    res.json({ success: true, content, raw: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ---------- ROUTES ADMIN (protégées) ---------- */

// POST /api/content - créer une nouvelle zone éditable (texte ou image)
router.post("/", protectAdmin, uploadContentImage.single("image"), async (req, res) => {
  try {
    const { key, label, type, textValue } = req.body;

    if (!key || !label || !type) {
      return res.status(400).json({ success: false, message: "key, label et type sont obligatoires." });
    }

    const data = { key, label, type };

    if (type === "text") {
      data.textValue = textValue || "";
    } else if (type === "image") {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Image obligatoire pour ce type de contenu." });
      }
      data.imageUrl = req.file.path;
      data.imagePublicId = req.file.filename;
    }

    const content = await Content.create(data);
    res.status(201).json({ success: true, content });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Cette clé de contenu existe déjà." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/content/:key - modifier une zone éditable existante
router.put("/:key", protectAdmin, uploadContentImage.single("image"), async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    if (!content) {
      return res.status(404).json({ success: false, message: "Contenu introuvable." });
    }

    const { label, textValue } = req.body;

    if (label !== undefined) content.label = label;

    if (content.type === "text" && textValue !== undefined) {
      content.textValue = textValue;
    }

    if (content.type === "image" && req.file) {
      if (content.imagePublicId) {
        await cloudinary.uploader.destroy(content.imagePublicId).catch(() => {});
      }
      content.imageUrl = req.file.path;
      content.imagePublicId = req.file.filename;
    }

    await content.save();
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
