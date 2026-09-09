import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// GET /api/admin/feedback — lista los comentarios recibidos.
// Filtro opcional ?status=NUEVO|ATENDIDO y ?limit.
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit")) || 200;

  const feedback = await db.feedback.findMany({
    where: status === "NUEVO" || status === "ATENDIDO" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(feedback);
}
