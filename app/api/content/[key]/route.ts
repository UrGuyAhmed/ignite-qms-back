import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const item = await prisma.content.findUnique({
    where: { key },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const formData = await request.formData();
  const text = formData.get("text") as string | null;
  const file = formData.get("image") as File | null;

  let imageUrl: string | undefined;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${key}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(process.cwd(), "public/uploads", filename);
    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${filename}`;
  }

  const updated = await prisma.content.upsert({
    where: { key },
    update: {
      ...(text !== null && { text, type: "TEXT" }),
      ...(imageUrl && { imageUrl, type: "IMAGE" }),
    },
    create: {
      key,
      type: imageUrl ? "IMAGE" : "TEXT",
      text: text ?? undefined,
      imageUrl: imageUrl ?? undefined,
    },
  });

  return NextResponse.json(updated);
}