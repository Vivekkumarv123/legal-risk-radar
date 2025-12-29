import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBase64File = async (base64, folder) => {
  try {
    const res = await cloudinary.v2.uploader.upload(base64, {
      folder,
      resource_type: "auto",
    });

    return {
      url: res.secure_url,
      public_id: res.public_id,
      resource_type: res.resource_type,
    };
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    return null;
  }
};

export const deleteCloudFile = async (public_id, resource_type) => {
  try {
    if (!public_id || !resource_type) return;

    await cloudinary.v2.uploader.destroy(public_id, {
      resource_type,
    });
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
  }
};

export default cloudinary;
