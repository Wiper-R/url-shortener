import {
  cleanShortenLink,
  getNextPageCursor,
  isUniqueValidationError,
} from "@/lib/utils";
import prisma from "@/prisma";
import { createLinkSchema, listLinkSchema } from "@/validators/linksValidator";
import { NextRequest } from "next/server";
import { successResponse } from "../_response";
import { getSession } from "@/auth/session";
import errorCodes from "../_error-codes";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = createLinkSchema.parse(body);

  const session = await getSession();
  if (!session) return errorCodes.Unauthorized();

  try {
    var shortenLink = await prisma.shortenLink.create({
      data: { ...data, userId: session.user.id },
    });
  } catch (e) {
    if (isUniqueValidationError(e))
      return errorCodes.Conflict("Slug is not available")

    return errorCodes.Unknown();
  }

  return successResponse(
    { shortenLink: cleanShortenLink(shortenLink) },
    { status: 201 },
  );
}

// GET links related to a current user
export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const data = listLinkSchema.parse(searchParams);

  const session = await getSession();
  if (!session) return errorCodes.Unauthorized();

  const shortenLinks = await prisma.shortenLink.findMany({
    where: { userId: session.user.id },
    cursor: data.cursor ? { id: data.cursor } : undefined,
    orderBy: { createdAt: "desc" },
    take: data.limit + 1,
  });

  return successResponse({
    shortenLinks: shortenLinks
      .slice(0, data.limit)
      .map((sl) => cleanShortenLink(sl)),
    nextPage: getNextPageCursor(shortenLinks, "id", data.limit),
  });
}
