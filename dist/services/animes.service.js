"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAnimesRomance = searchAnimesRomance;
const axios_1 = __importDefault(require("axios"));
async function searchAnimesRomance(req, res) {
    try {
        const axiosRes = await axios_1.default.get('http://localhost:3000/api/get-romance');
        const animesCaptureds = await Promise.all(axiosRes.data.map(async (anime) => {
            return {
                id: anime.id,
                title: anime.title,
                average: anime.average,
                synopisis: anime.synopisis,
                capeImage: anime.capeImage
            };
        }));
        return res.json(animesCaptureds);
    }
    catch (error) {
        return res.status(500).json({ error: "Error internal in dojo (server-side)" });
    }
}
//# sourceMappingURL=animes.service.js.map