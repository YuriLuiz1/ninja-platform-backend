import axios from "axios";
import type { Request, Response } from "express";

export async function searchAnimesRomance(req: Request, res: Response){
    try{
    const axiosRes = await axios.get('https://ninja-platform-backend.onrender.com/');

    const animesCaptureds = await Promise.all(
        axiosRes.data.map(async (anime: any) => {
            return {
                id: anime.id,
                title: anime.title,
                average: anime.average,
                synopisis: anime.synopisis,
                capeImage: anime.capeImage
            };
        })
    );
    return res.json(animesCaptureds);
}catch(error){
    return res.status(500).json({ error: "Error internal in dojo (server-side)" })
}
}