"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationUser = validationUser;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function validationUser(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password is required!"
            });
        }
        const user = await prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email or password is invalid!"
            });
        }
        const passwordValid = await bcrypt_1.default.compare(password, user.password);
        if (!passwordValid) {
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
    }
    catch (error) {
        console.error("Error in Login:", error);
        return res.status(500).json({
            success: false,
            message: "Error internal in server, sorry! :c"
        });
    }
}
//# sourceMappingURL=controllersLogin.js.map