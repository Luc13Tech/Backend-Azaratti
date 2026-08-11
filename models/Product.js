const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre du produit est obligatoire"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "La catégorie est obligatoire"],
      enum: ["Montres", "Chaussures", "Accessoires", "Maroquinerie"],
    },
    price: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "L'image du produit est obligatoire"],
    },
    imagePublicId: {
      type: String, // identifiant Cloudinary, utile pour supprimer l'image proprement
      required: true,
    },
    // Le badge "Nouveau" peut être forcé manuellement par l'admin (pinned)
    // ou calculé automatiquement selon la date de création (voir virtual isNew ci-dessous)
    pinnedAsNew: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean, // pour apparaître dans "L'Inspiration du Moment"
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Un produit est considéré "Nouveau" s'il a été créé il y a moins de 21 jours,
// ou si l'admin l'a explicitement épinglé comme nouveauté.
const NEW_BADGE_DURATION_DAYS = 21;

productSchema.virtual("isNew").get(function () {
  if (this.pinnedAsNew) return true;
  const ageInDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return ageInDays <= NEW_BADGE_DURATION_DAYS;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
