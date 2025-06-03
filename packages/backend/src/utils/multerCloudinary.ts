import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const postImageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'foodhub_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    })

})

const profileImageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) =>({
      folder: 'foodhub_profiles', // All user profile images go here
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }),
  });

export const uploadPostImage = multer({storage: postImageStorage, limits: {fileSize: 1024 * 1024 * 5}});
export const uploadProfileImage = multer({storage: profileImageStorage, limits: {fileSize: 1024 * 1024 * 5}});

