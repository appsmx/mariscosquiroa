import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Tipos de comentario aceptados (coinciden con el enum FeedbackType de Prisma).
const VALID_TYPES = ["SUGERENCIA", "ERROR", "OTRO"] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

// POST /api/public/feedback — recibe un comentario/sugerencia del sitio público.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Anti-spam (honeypot): campo oculto que un humano nunca rellena.
    // Si viene con contenido, es un bot → respondemos ok sin guardar nada.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { error: "El comentario no puede estar vacío." },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "El comentario es demasiado largo (máx. 2000 caracteres)." },
        { status: 400 }
      );
    }

    const type: FeedbackType = VALID_TYPES.includes(body.type)
      ? body.type
      : "OTRO";

    // Contacto opcional; se recorta y se limita para evitar abusos.
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 120)
        : null;
    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim().slice(0, 200)
        : null;

    await db.feedback.create({
      data: { type, message, name, email, source: "web" },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : "Error desconocido";
    console.error("Error guardando feedback:", e);
    return NextResponse.json(
      { error: "No se pudo enviar el comentario.", detail },
      { status: 500 }
    );
  }
}
