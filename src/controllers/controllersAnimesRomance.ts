import type { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { IAnimes } from "../models/ModelAnimes";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export async function postAnimeDb(req: Request, res: Response) {
  const {
    title,
    average,
    synopisis,
    capeImage,
    opinionNinja,
    categoryId,
    DurationEp,
    StatusFinished,
    StreamingPlatforms,
    Studios,
    Temp,
    episodes,
    DataLancamento,
    SubCategorias
  }: IAnimes = req.body;

  
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
        return res.status(401).json({
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
          categoryId,
          DurationEp,
          StatusFinished,
          StreamingPlatforms,
          Studios,
          Temp,
          episodes,
          DataLancamento,
          SubCategorias
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
  const animeId = Number(id);

  const anime = await prisma.animes.findUnique({
    where: { id: animeId },
  });

  if (!anime) return res.status(404).json({ error: "Anime not found!" });

  const votes = await prisma.$queryRaw<
    Array<{ listType: "LIKED" | "DISLIKED"; total: bigint }>
  >(Prisma.sql`
    SELECT "listType", COUNT(*)::bigint AS total
    FROM "UserAnimeList"
    WHERE "animeId" = ${animeId}
      AND "listType" IN ('LIKED', 'DISLIKED')
    GROUP BY "listType";
  `);

  const approvedGeninCount = Number(
    votes.find((vote) => vote.listType === "LIKED")?.total ?? 0n,
  );
  const rejectedGeninCount = Number(
    votes.find((vote) => vote.listType === "DISLIKED")?.total ?? 0n,
  );

  res.json({
    ...anime,
    approvedGeninCount,
    rejectedGeninCount,
  });
}

export async function getCategoryIdAnime(req: Request, res: Response) {
  const { id } = req.params;

  const anime = await prisma.animes.findMany({
    where: { categoryId: Number(id) },
  });

  if (!anime) return res.status(404).json({ error: "Category not found!" });

  res.status(200).json({ success: true, message: "Category found", anime });
}
