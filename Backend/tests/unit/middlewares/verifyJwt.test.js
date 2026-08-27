import { describe, it, expect, vi } from "vitest";
import { verifyJwt } from "../../../src/middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import { User } from "../../../src/models/user.models.js";

describe("auth", () => {

    it("returns 401 when access token is not provided", async () => {
        const req = {
            cookies : {},
            header : vi.fn().mockReturnValue(undefined)
        }

        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        }

        const next = vi.fn();

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)

        expect(res.json).toHaveBeenCalledWith({
            message : "Please login first to perform this action",
            success : false
        })
    })

    it("successfully verifies user access tokens and embeds data", async () => {

        const fakeUser = {
            _id : "abc123",
            name : "Haardik"
        }
        const req = {
            cookies : {
                accessToken : "fake-token"
            },
            header : vi.fn()
        }

        const res = {}

        const next = vi.fn();

        //By creating this mock function, we basically emulate the jwt.verify function so when we call it, it returns the user ID which we can then query for the mongoose function
        jwt.verify = vi.fn().mockReturnValue({
            _id : "abc123"
        })

        User.findById = vi.fn().mockReturnValue({
            select : vi.fn().mockResolvedValue(fakeUser)
        })

        await verifyJwt(req, res, next)

        expect(jwt.verify).toHaveBeenCalled()

        expect(User.findById).toHaveBeenCalledWith("abc123")

        expect(req.user).toBe(fakeUser)

        expect(next).toHaveBeenCalled()
    })

    it("returns error if user not found", async () => {

        const req = {
            cookies : {
                accessToken : "fake-token"
            },
            header : vi.fn()
        }

        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        }

        const next = vi.fn();

        //By creating this mock function, we basically emulate the jwt.verify function so when we call it, it returns the user ID which we can then query for the mongoose function
        jwt.verify = vi.fn().mockReturnValue({
            _id : "abc123"
        })

        User.findById = vi.fn().mockReturnValue({
            select : vi.fn().mockResolvedValue(null)
        })

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid access token"
        });
    })

    it("returns error if access token is expired or invalid", async () => {

        const req = {
            cookies : {
                accessToken : "fake-token"
            },
            header : vi.fn()
        }

        const res = {
            status : vi.fn().mockReturnThis(),
            json : vi.fn()
        }

        const next = vi.fn();

        //By creating this mock function, we basically emulate the jwt.verify function so when we call it, it returns the user ID which we can then query for the mongoose function
        jwt.verify = vi.fn( () =>{
            throw new Error("Invalid access token")
        })

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired access token"
        });
    })

    it("accepts access token from Authorization header", async () => {
        const fakeUser = { _id: "abc123" };

        const req = {
            cookies: {},
            header: vi.fn().mockReturnValue("Bearer fake-token")
        };

        const res = {};
        const next = vi.fn();

        jwt.verify = vi.fn().mockReturnValue({
            _id: "abc123"
        });

        User.findById = vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(fakeUser)
        });

        await verifyJwt(req, res, next);

        expect(jwt.verify).toHaveBeenCalled()

        expect(next).toHaveBeenCalled();
    });
})