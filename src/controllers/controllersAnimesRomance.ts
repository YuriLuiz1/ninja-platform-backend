import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { IAnimes } from "../models/ModelAnimes";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export async function postAnimeDb(req: Request, res: Response) {
  const { title, average, synopisis, capeImage, opinionNinja }: IAnimes =
    req.body;
  const authorization = req.get("Authorization");
  const passAdmin = process.env.PASS_SUPERADMIN;

  try {
    if (!authorization || authorization == "") {
      res.status(401).json({
        success: false,
        message: "Key authorization is invalid or inexistent!",
      });
    }

    if (authorization === passAdmin) {
      if (!title || !average || !synopisis || !capeImage || !opinionNinja) {
        return res
          .status(401)
          .json({
            success: "false",
            message: "Datas invalids or empty, please verify!",
          });
      }

      const dataAnime = await prisma.animes.create({
        data: {
          title,
          average,
          synopisis,
          capeImage,
          opinionNinja,
        },
      });
      res.status(201).json({
        success: true,
        message: "Anime insert in catalog with successfully",
        dataAnime,
      });
    }
  } catch (error) {
    console.error("Erro ao inserir anime no catalogo", error);
    res
      .status(500)
      .json({ success: false, message: "Error internal in server" });
  }
}

export async function getAllAnimesDb(req: Request, res: Response) {
  const animeSearch = await prisma.animes.findMany();

  return res
    .status(200)
    .json({ message: "All animes in catalog Romance: ", animeSearch });
}

export async function updateAnimeDb(req: Request, res: Response) {
  const id = req.params.id as string;
  const idNumber = parseInt(id);

  if (!idNumber) {
    return res.status(400).json({ error: "ID not found!" });
  }

  const updateAnime = await prisma.animes.update({
    where: {
      id: idNumber,
    },
    data: req.body,
  });

  return res.status(200).json({ status: true, updateAnime });
}

export async function getIdAnime(req: Request, res: Response) {
  const { id } = req.params;

  const anime = await prisma.animes.findUnique({
    where: { id: Number(id) },
  });

  if (!anime) return res.status(404).json({ error: "Anime not found!" });

  res.json(anime);
}
