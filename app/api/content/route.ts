import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const content = await prisma.content.findMany();

  // Reshape into a simple { key: value } map for easy frontend use
  const map: Record<string, { type: string; text: string | null; imageUrl: string | null }> = {};
  for (const item of content) {
    map[item.key] = {
      type: item.type,
      text: item.text,
      imageUrl: item.imageUrl,
    };
  }

  return NextResponse.json(map);
}