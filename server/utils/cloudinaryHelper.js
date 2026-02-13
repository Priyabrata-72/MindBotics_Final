import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Uploads a file to Cloudinary
 * @param {string} filePath - Path to the local file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadToCloudinary = async (filePath, folder = 'courses') => {
    try {
        const normalizedPath = filePath.replace(/\\/g, "/");

        const result = await cloudinary.uploader.upload(normalizedPath, {
            folder: folder,
            resource_type: "image",
        });

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            url: result.secure_url,
            public_id: result.public_id,
        };
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw new Error(`Cloudinary Upload Error: ${error.message}`);
    }
};


/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error(`Cloudinary Deletion Error: ${error.message}`);
    }
};
