import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * POST /api/admin/change-password
 * Permite al usuario autenticado cambiar SU propia contraseña desde el panel.
 *
 * Body: { currentPassword: string, newPassword: string }
 *
 * Seguridad:
 *  - Requiere sesión admin/editor (requireAdmin).
 *  - Verifica la contraseña actual con bcrypt antes de cambiar.
 *  - Valida longitud mínima de la nueva contraseña.
 *  - Solo cambia la contraseña del usuario de la sesión (nunca la de otro).
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Faltan la contraseña actual y la nueva." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser distinta de la actual." },
        { status: 400 }
      );
    }

    // Buscar al usuario de la sesión
    const userId = (session!.user as any).id as string;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Verificar la contraseña actual
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    // Guardar el nuevo hash
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Registrar la acción (sin datos sensibles)
    try {
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_CHANGED",
          entity: "user",
          entityId: user.id,
        },
      });
    } catch {
      // El log es best-effort; no bloquea el cambio.
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[change-password] Error:", e?.message);
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
