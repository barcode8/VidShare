import { describe, it, expect } from "vitest";
import { ApiResponse } from "../../../src/utils/ApiResponse.js";

describe("ApiResponse", () => {

    it("creates a successful response correctly", () => {
        const response = new ApiResponse(200, { name: "Haardik" });

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({ name: "Haardik" });
        expect(response.message).toBe("Success");
        expect(response.success).toBe(true);
    });

    it("creates an unsuccessful response correctly", () => {
        const response = new ApiResponse(400, null, "Bad Request");

        expect(response.statusCode).toBe(400);
        expect(response.data).toEqual(null);
        expect(response.message).toBe("Bad Request");
        expect(response.success).toBe(false);
    });

    it("uses success as a default message", () => {
        const response = new ApiResponse(201, {id : 123});

        expect(response.message).toBe("Success");
    });

    it("marks status code below 400 as success", () => {
        const response = new ApiResponse(399, {name : "Haardik"}, "Name recieved successfully");

        expect(response.success).toBe(true);
    });

    it("marks status code 400 and above as failure", () => {
        const response = new ApiResponse(400, null, "Name not recieved");

        expect(response.success).toBe(false);
    });

});