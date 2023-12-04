import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/prisma";
import { TSession } from "./context";
import config from "@/config";

// TODO: Use function keyword

export async function getSession(): Promise<TSession> {
  const token = cookies().get(config.TOKEN_COOKIE_KEY);
  const session = await verifySession(token?.value || "");
  if (!session?.payload.sub) return null;
  const user = await prisma.user.findFirst({
    where: { id: session.payload.sub },
  });
  if (!user) return null;
  // NOTE: Verify token in database
  return { user };
}

export async function verifySession(token: string) {
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  return await jwtVerify(token, secret);
}
