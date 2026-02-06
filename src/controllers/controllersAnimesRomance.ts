import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { IAnimes } from "../models/ModelAnimes";

const prisma = new PrismaClient();

export async function postRomanceDb(req: Request, res: Response){
  const romanceContract: IAnimes = req.body;
  const dataRomance = await prisma.animes.create({
    data: romanceContract,
  })
  res
  .status(201)
  .json({ message: "Anime insert in catalog with successfully", dataRomance });
}

export async function getAllRomanceDb(req: Request, res: Response){
    const romanceSearch = await prisma.animes.findMany()

    return res
    .status(200)
    .json({ message: "All animes in catalog Romance: ", romanceSearch});
}

export async function updateRomanceDb(req: Request, res: Response){
   const id = req.params.id as string;
   const idNumber = parseInt(id);

   if(!idNumber){
    return res.status(400).json({ error: "ID not found!"})
   }
   
   const updateRomance = await prisma.animes.update({
    where: { 
        id: idNumber 
    },
    data: req.body
   });

   return res.status(200).json({ status: true, updateRomance });
}

export async function getIdRomance(req: Request, res: Response){
  const { id } = req.params;

  const anime = await prisma.animes.findUnique({
    where: { id: Number(id)}
  });

  if(!anime) return res.status(404).json({ error: "Anime not found!" });
  
  res.json(anime);
}