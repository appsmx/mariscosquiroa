import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin";
import {
  cloudinary,
  isCloudinaryConfigured,
  CLOUDINARY_PRODUCTS_FOLDER,
} from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

// La subida procesa binarios con sharp/streams: requiere runtime Node (no Edge).
export const runtime = "nodejs";

// Formatos de imagen aceptados.
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Tamaño máximo del archivo recibido: 8 MB.
const MAX_BYTES = 8 * 1024 * 1024;

// Lado máximo tras redimensionar (se conserva la proporción).
const MAX_DIMENSION = 1600;

/**
 * POST /api/admin/upload — sube una imagen (multipart/form-data, campo "file")
 * a Cloudinary y devuelve { url } con la URL pública optimizada.
 *
 * Flujo: valida sesión admin → valida tipo/tamaño → normaliza con sharp
 * (redimensiona y re-comprime a WebP) → sube a Cloudinary → responde la URL.
 * El admin usa esa URL en el campo `image` del producto (la API de productos
 * no cambia). Si Cloudinary no está configurado, responde 503 sin romper nada.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isCloudinaryConfigured) {
    return NextResponse.json(
      {
        error:
          "La subida de imágenes no está configurada. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET, o pega una URL de imagen a mano.",
      },
      { status: 503 }
    );
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    const value = formData.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido: se espera multipart/form-data con el campo 'file'." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo en el campo 'file'." },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Tipo de archivo no permitido (${file.type || "desconocido"}). Usa JPG, PNG, WebP, GIF o AVIF.` },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `La imagen pesa demasiado (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo 8 MB.` },
      { status: 413 }
    );
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Normaliza: redimensiona (sin agrandar) y re-comprime a WebP para
    // páginas más ligeras. GIF puede ser animado → se deja sin tocar y
    // Cloudinary se encarga de servirlo optimizado.
    let uploadBuffer = inputBuffer;
    if (file.type !== "image/gif") {
      uploadBuffer = await sharp(inputBuffer)
        .rotate() // respeta la orientación EXIF
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_PRODUCTS_FOLDER,
          resource_type: "image",
          // Entrega optimizada automática (formato y calidad).
          fetch_format: "auto",
          quality: "auto",
        },
        (err, res) => {
          if (err || !res) return reject(err || new Error("Subida fallida"));
          resolve(res);
        }
      );
      stream.end(uploadBuffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al subir la imagen";
    console.error("Error subiendo imagen a Cloudinary:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
