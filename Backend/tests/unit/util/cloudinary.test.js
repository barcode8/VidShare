import { describe, it, expect, vi } from "vitest";
import { uploadOnCloudinary } from "../../../src/utils/cloudinary.js";
import { v2 as cloudinary} from "cloudinary";

describe("cloudinary", () => {

    it("returns null when localFilePath is not provided", async () => {
        const result = await uploadOnCloudinary();

        expect(result).toBeNull();
    })

    it("uploads file successfully", async () => {
        const fakeResult = {
            publicId : "abc123"
        }

        cloudinary.uploader.upload_large = vi.fn((path, options, callback) => {
            callback(null, fakeResult);
        })

        const result = await uploadOnCloudinary("test.jpg")

        expect(cloudinary.uploader.upload_large).toHaveBeenCalled();
        expect(result).toBe(fakeResult);
    })

    it("supplies uploader with options object when isVideo is true", async () => {

        cloudinary.uploader.upload_large = vi.fn((path, options, callback) => {
            callback(null, {});
        })

        await uploadOnCloudinary("test.mp4", true)

        expect(cloudinary.uploader.upload_large).toHaveBeenCalledWith(
            "test.mp4",
            {
                resource_type: "video",
                eager: [{ width: 1920, height: 1080, crop: "limit" }],
                eager_async: true
            },
            expect.any(Function)
        )
    })

    it("returns null when cloudinary cloudinary upload fails", async () => {

        cloudinary.uploader.upload_large = vi.fn((path, options, callback) => {
            callback(new Error("Something went wrong"), {});
        })

        const result = await uploadOnCloudinary("test.mp4", true)

        expect(result).toBeNull()
    })
})