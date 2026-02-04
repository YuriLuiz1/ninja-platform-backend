"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRomanceDb = postRomanceDb;
exports.getAllRomanceDb = getAllRomanceDb;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function postRomanceDb(req, res) {
    const romanceContract = req.body;
    const dataRomance = await prisma.animesRomance.create({
        data: romanceContract,
    });
    res
        .status(201)
        .json({ message: "Anime insert in catalog with successfully", dataRomance });
}
async function getAllRomanceDb(req, res) {
    const romanceSearch = await prisma.animesRomance.findMany();
    return res
        .status(200)
        .json({ message: "All animes in catalog Romance: ", romanceSearch });
}
//# sourceMappingURL=controllersAnimesRomance.js.map