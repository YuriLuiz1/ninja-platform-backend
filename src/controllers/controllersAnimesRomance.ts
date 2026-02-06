import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { IAnimes } from "../models/ModelAnimes";

const prisma = new PrismaClient();

export async function postAnimeDb(req: Request, res: Response){
  const animeContract: IAnimes = req.body;
  const dataAnime = await prisma.animes.create({
    data: animeContract,
  })
  res
  .status(201)
  .json({ message: "Anime insert in catalog with successfully", dataAnime });
}

export async function getAllAnimesDb(req: Request, res: Response){
    const animeSearch = await prisma.animes.findMany()

    return res
    .status(200)
    .json({ message: "All animes in catalog Romance: ", animeSearch});
}

export async function updateAnimeDb(req: Request, res: Response){
   const id = req.params.id as string;
   const idNumber = parseInt(id);

   if(!idNumber){
    return res.status(400).json({ error: "ID not found!"})
   }
   
   const updateAnime = await prisma.animes.update({
    where: { 
        id: idNumber 
    },
    data: req.body
   });

   return res.status(200).json({ status: true, updateAnime });
}

export async function getIdAnime(req: Request, res: Response){
  const { id } = req.params;

  const anime = await prisma.animes.findUnique({
    where: { id: Number(id)},
  });

  if(!anime) return res.status(404).json({ error: "Anime not found!" });
  
  res.json(anime);
}