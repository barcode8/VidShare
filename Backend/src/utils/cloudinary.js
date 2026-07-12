import { v2 as cloudinary} from "cloudinary";
import fs from 'fs'
import dotenv from "dotenv";
dotenv.config();

//Purely boilerplate cloudinary config file needed to allow cloudinary to work

cloudinary.config({
    //This basically signs us in from this server to cloudinary so we can use it
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})


const uploadOnCloudinary = async (localFilePath, isVideo = false) => {
    try {
        if (!localFilePath) return null;

        const options = {
            resource_type: isVideo ? "video" : "auto",
        };

        if (isVideo) {
            options.eager = [{ width: 1920, height: 1080, crop: "limit" }];
            options.eager_async = true;
        }

        // The Promise Wrapper: This forces the stream to finish before moving on
        return await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(localFilePath, options, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

    } catch (error) {
        console.error("!!! CLOUDINARY UPLOAD ERROR !!!", error);
        return null;
    }
};

export {uploadOnCloudinary}