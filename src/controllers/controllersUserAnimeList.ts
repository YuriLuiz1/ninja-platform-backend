import type { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type AnimeListType = "WANT_TO_WATCH" | "WATCHED" | "LIKED" | "DISLIKED";

const VALID_LIST_TYPES = new Set<AnimeListType>([
  "WANT_TO_WATCH",
  "WATCHED",
  "LIKED",
  "DISLIKED",
]);

function parseId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeListType(value: unknown): AnimeListType | null {
  if (typeof value !== "string" || !value) return null;
  const normalized = value.toUpperCase() as AnimeListType;
  return VALID_LIST_TYPES.has(normalized) ? normalized : null;
}

export async function upsertAnimeInUserList(req: Request, res: Response) {
  try {
    const userId = parseId(req.params.userId);
    const animeId = parseId(req.params.animeId);
    const listType = normalizeListType(req.body?.listType);

    if (!userId || !animeId || !listType) {
      return res.status(400).json({
        success: false,
        message: "userId, animeId e listType válidos são obrigatórios.",
      });
    }

    const [userExists, animeExists] = await Promise.all([
      prisma.users.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.animes.findUnique({ where: { id: animeId }, select: { id: true } }),
    ]);

    if (!userExists || !animeExists) {
      return res.status(404).json({
        success: false,
        message: "Usuário ou anime não encontrado.",
      });
    }

    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        userId: number;
        animeId: number;
        listType: AnimeListType;
        createdAt: Date;
        updatedAt: Date;
      }>
    >(Prisma.sql`
      INSERT INTO "UserAnimeList" ("userId", "animeId", "listType", "updatedAt")
      VALUES (${userId}, ${animeId}, CAST(${listType} AS "AnimeListType"), NOW())
      ON CONFLICT ("userId", "animeId", "listType")
      DO UPDATE SET "updatedAt" = NOW()
      RETURNING "id", "userId", "animeId", "listType", "createdAt", "updatedAt";
    `);

    const listItem = rows[0];

    return res.status(200).json({
      success: true,
      message: "Anime adicionado na lista do usuário.",
      data: listItem,
    });
  } catch (error) {
    console.error("Error upserting anime list item:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar lista do usuário.",
    });
  }
}

export async function removeAnimeFromUserList(req: Request, res: Response) {
  try {
    const userId = parseId(req.params.userId);
    const animeId = parseId(req.params.animeId);
    const listType = normalizeListType(req.params.listType);

    if (!userId || !animeId || !listType) {
      return res.status(400).json({
        success: false,
        message: "userId, animeId e listType válidos são obrigatórios.",
      });
    }

    const deleted = await prisma.$executeRaw(Prisma.sql`
      DELETE FROM "UserAnimeList"
      WHERE "userId" = ${userId}
        AND "animeId" = ${animeId}
        AND "listType" = CAST(${listType} AS "AnimeListType");
    `);

    return res.status(200).json({
      success: true,
      message: "Anime removido da lista do usuário.",
      removedCount: deleted,
    });
  } catch (error) {
    console.error("Error removing anime from list:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao remover anime da lista.",
    });
  }
}

export async function getUserAnimeListByAnime(req: Request, res: Response) {
  try {
    const userId = parseId(req.params.userId);
    const animeId = parseId(req.params.animeId);

    if (!userId || !animeId) {
      return res.status(400).json({
        success: false,
        message: "userId e animeId válidos são obrigatórios.",
      });
    }

    const listItems = await prisma.$queryRaw<Array<{ listType: AnimeListType }>>(
      Prisma.sql`
        SELECT "listType"
        FROM "UserAnimeList"
        WHERE "userId" = ${userId}
          AND "animeId" = ${animeId};
      `,
    );

    return res.status(200).json({
      success: true,
      data: listItems.map((item: { listType: AnimeListType }) => item.listType),
    });
  } catch (error) {
    console.error("Error searching anime list by anime:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar status do anime.",
    });
  }
}

export async function getUserAnimeList(req: Request, res: Response) {
  try {
    const userId = parseId(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId válido é obrigatório.",
      });
    }

    const listItems = await prisma.$queryRaw<
      Array<{
        id: number;
        userId: number;
        animeId: number;
        listType: AnimeListType;
        createdAt: Date;
        updatedAt: Date;
        anime: {
          id: number;
          title: string;
          capeImage: string;
          average: string;
          categoryId: number | null;
        };
      }>
    >(Prisma.sql`
      SELECT
        ual."id",
        ual."userId",
        ual."animeId",
        ual."listType",
        ual."createdAt",
        ual."updatedAt",
        json_build_object(
          'id', a."id",
          'title', a."title",
          'capeImage', a."capeImage",
          'average', a."average",
          'categoryId', a."categoryId"
        ) AS "anime"
      FROM "UserAnimeList" ual
      INNER JOIN "Animes" a ON a."id" = ual."animeId"
      WHERE ual."userId" = ${userId}
      ORDER BY ual."createdAt" DESC;
    `);

    return res.status(200).json({
      success: true,
      data: listItems,
    });
  } catch (error) {
    console.error("Error listing user anime list:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar lista do usuário.",
    });
  }
}
