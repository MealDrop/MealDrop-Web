const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

// POST /api/upload
async function uploadImage(req, res) {
  if (!req.file)
    return res.status(400).json({ message: "No image file was sent" });
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res
      .status(502)
      .json({
        message: "Image upload is not configured — set CLOUDINARY_* in .env",
      });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "mealdrop/dishes", resource_type: "image" },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded)),
      );
      Readable.from(req.file.buffer).pipe(uploadStream);
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res
      .status(502)
      .json({ message: "Could not upload the image right now — try again." });
  }
}

module.exports = { uploadImage };
