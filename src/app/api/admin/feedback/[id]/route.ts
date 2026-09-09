import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// PUT /api/admin/feedback/[id] — actualiza el estado (NUEVO / ATENDIDO).
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const status = body.status;
    if (status !== "NUEVO" && status !== "ATENDIDO") {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    const updated = await db.feedback.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/admin/feedback/[id] — elimina un comentario.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await db.feedback.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error al eliminar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
