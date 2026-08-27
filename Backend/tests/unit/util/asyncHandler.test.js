import { describe, vi, it, expect} from "vitest";
import { asyncHandler } from "../../../src/utils/asyncHandler.js";
import ApiError from "../../../src/utils/ApiError";

describe("asyncHandler", () => {

    it("calls the controller with req, res and next", async () => {
        const req = {};
        const res = {};
        const next = vi.fn()

        const func = vi.fn().mockResolvedValue("success");
        const handler = asyncHandler(func);
        const result = await handler(req, res, next);

        expect(func).toHaveBeenCalledWith(req,res,next)
        expect(result).toBe("success")
    })

    it("resplves error messages in controllers", async () => {
        const req = {};
        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        };
        const next = vi.fn()

        const func = vi.fn().mockRejectedValue(new ApiError(404, "User not found"));
        const handler = asyncHandler(func);
        await handler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            success : false,
            message : "User not found"
        })
    })

    it("defaults to code 500 when status code not provided", async () => {
        const req = {};
        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        };
        const next = vi.fn()

        const func = vi.fn().mockRejectedValue(new Error("User not found"));
        const handler = asyncHandler(func);
        await handler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500)
    })

    it("also resolves synchronous errors", async () => {
        const req = {};
        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        };
        const next = vi.fn()

        const func = vi.fn(()=>{
            throw new ApiError(400, "Bad request")
        });
        const handler = asyncHandler(func);
        await handler(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400)

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Bad request"
        });
    })
})