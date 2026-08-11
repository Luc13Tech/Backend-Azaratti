const multer = require("multer");
const { productStorage, contentStorage } = require("../config/cloudinary");

const uploadProductImage = multer({ storage: productStorage });
const uploadContentImage = multer({ storage: contentStorage });

module.exports = { uploadProductImage, uploadContentImage };
