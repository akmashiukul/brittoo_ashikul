import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory instead of disk

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).array("productImages", 4);

export const productImageUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("💥 Multer Error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};