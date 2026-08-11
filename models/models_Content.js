const mongoose = require("mongoose");

/*
  Ce modèle stocke TOUT ce qui est affiché sur l'application et qui doit
  rester éditable depuis la partie admin : textes des bannières, image et
  légende de "L'Inspiration du Moment", image de "Découvrir la Collection",
  libellés de la roue "Collection Explorer", etc.

  On utilise un système clé/valeur simple (comme un mini-CMS) pour que
  Luc puisse ajouter de nouvelles zones éditables plus tard sans changer
  la structure de la base de données.
*/

const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // ex: "banner_inspiration_1", "wheel_label_montres"
    },
    label: {
      type: String, // nom lisible pour l'admin, ex: "Bannière - Inspiration du moment"
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    textValue: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
