import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserLogin } from "../models/ModelUserLogin";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const prisma = new PrismaClient();

export async function validationUser(req: Request, res: Response){
    try{
        const { email, password }: UserLogin = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "Email and password is required!"
        });
    }

    const user = await prisma.users.findUnique({
        where: { email }
    });

    if(!user){
        return res.status(401).json({
            success: false,
            message: "Email or password is invalid!"
        });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if(!passwordValid){
        return res.status(401).json({
            success: false,
            message: "Email or password is invalid on BD!"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Login valid, welcome Sr(a)! :D",
        data: {
            id: user.id,
            user: user.user,
            email: user.email
        }
    });
    }catch(error){
        console.error("Error in Login:", error);
        return res.status(500).json({
            success: false,
            message: "Error internal in server, sorry! :c"
        });
    }
}