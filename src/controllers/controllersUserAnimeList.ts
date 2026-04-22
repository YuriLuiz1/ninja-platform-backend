import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const prismaAny = prisma as any;
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

    const listItem = await prismaAny.userAnimeList.upsert({
      where: {
        userId_animeId_listType: {
          userId,
          animeId,
          listType,
        },
      },
      update: {},
      create: {
        userId,
        animeId,
        listType,
      },
    });

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

    const deleted = await prismaAny.userAnimeList.deleteMany({
      where: { userId, animeId, listType },
    });

    return res.status(200).json({
      success: true,
      message: "Anime removido da lista do usuário.",
      removedCount: deleted.count,
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

    const listItems = await prismaAny.userAnimeList.findMany({
      where: { userId, animeId },
      select: { listType: true },
    });

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

    const listItems = await prismaAny.userAnimeList.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            capeImage: true,
            average: true,
            categoryId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
