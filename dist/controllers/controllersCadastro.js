"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRegister = sendRegister;
exports.consultDataBaseAdmin = consultDataBaseAdmin;
exports.deleteUserDataBaseAdmin = deleteUserDataBaseAdmin;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function sendRegister(req, res) {
    try {
        const { user, email, password } = req.body;
        if (!user || !email || !password) {
            res.status(400).json({
                success: false,
                message: "All inputs is required"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Email invalid!"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password is required with 6 chars"
            });
        }
        const userDuo = await prisma.users.findUnique({
            where: { email }
        });
        if (userDuo) {
            return res.status(409).json({
                success: false,
                message: "Email already cadastred"
            });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const userRegistered = await prisma.users.create({
            data: {
                user,
                email,
                password: passwordHash
            },
            select: {
                id: true,
                user: true,
                email: true,
            }
        });
        return res.status(201).json({
            success: true,
            message: "User cadastred with successfully!",
            data: userRegistered
        });
    }
    catch (error) {
        console.error("Error with created new user:", error);
        return res.status(500).json({
            success: false,
            message: "Error internal server"
        });
    }
}
// Controllers de acesso ADMINISTRATIVOS;
async function consultDataBaseAdmin(req, res) {
    const authorization = req.get("Authorization");
    const passUserAdm = process.env.PASS_SUPERADMIN;
    if (authorization === passUserAdm) {
        const allUsersRegistered = await prisma.users.findMany();
        res
            .status(200)
            .json({
            message: "Welcome!, this is all users in data base",
            allUsersRegistered,
        });
    }
    else {
        res.status(401).json({ message: "Authorization invalid or inexistent!" });
    }
}
async function deleteUserDataBaseAdmin(req, res) {
    const authorization = req.get('Authorization');
    const passUserAdm = process.env.PASS_SUPERADMIN;
    const id = req.params.id;
    const userId = parseInt(id);
    if (authorization === passUserAdm) {
        const userDelete = await prisma.users.delete({
            where: { id: userId },
        });
        res
            .status(200)
            .json({ message: "User deleted with successfully", json: userDelete });
    }
    else {
        res.status(401).json({ message: "Authorization invalid or inexistent!" });
    }
}
//# sourceMappingURL=controllersCadastro.js.map