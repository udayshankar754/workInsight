import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url';
import { configDotenv } from 'dotenv';

configDotenv();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath, resourceType) => {
  try {
    if (!localFilePath || !resourceType) return null;

    const folderPath = `${process.env.DB_NAME}/${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}s`;

    let response;
    if (resourceType == 'video' || resourceType == 'image') {
      response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
        folder: folderPath,
      });
    } else if (resourceType == 'file') {
      response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'raw', // Raw type for generic files
        folder: folderPath,
      });
    } else {
      response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: 'auto',
        folder: folderPath,
      });
    }
    if (response) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    if (localFilePath) fs.unlinkSync(localFilePath);
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file');
  }
};

const removeFromCloudinary = async (publicUrl, resourceType) => {
  try {
    if (!publicUrl && !resourceType) return null;
    const publicId = extractPublicId(publicUrl);

    let response;
    if (resourceType == 'video' || resourceType == 'image') {
      response = await cloudinary.api.delete_resources(publicId, {
        type: 'upload',
        resource_type: resourceType,
      });
    } else if (resourceType == 'file' || resourceType == 'raw') {
      response = await cloudinary.api.delete_resources(publicId, {
        type: 'upload',
        resource_type: 'raw',
      });
    } else {
      response = await cloudinary.api.delete_resources(publicId, {
        type: 'upload',
        resource_type: 'auto',
      });
    }
    return response?.deleted?.[`${publicId}`];
  } catch (error) {
    console.error(error);
  }
};

export { uploadOnCloudinary, removeFromCloudinary };
