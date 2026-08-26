import { describe, it, expect } from "vitest";
import ApiError from "../../../src/utils/ApiError.js";

describe("ApiError", () => {
    
    it("creates an error response successfully", () => {
        const error = new ApiError(404, "User not found")

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("User not found");
        expect(error.data).toBeNull();
        expect(error.success).toBeFalsy()
        expect(error.errors).toStrictEqual([]);
        expect(error.stack).toContain("Error: User not found");
    })

    it("is actually an instance of the Error class", () => {
        const error = new ApiError(404, "User not found")

        expect(error).toBeInstanceOf(Error);
    })

    it("returns the custom stack trace provided", () => {
        const error = new ApiError(404, "User not found", [], "Custom stack trace")

        expect(error.stack).toBe("Custom stack trace");
    })

    it("returns the default message when message not provided", () => {
        const error = new ApiError(404)

        expect(error.message).toBe("Something went wrong");
    })

    it("returns the custom error array when errors are provided", () => {
        const error = new ApiError(404, "Multiple errors", ["error1", "error2", "error3"])

        expect(error.errors).toStrictEqual(["error1", "error2", "error3"]);
    })
})