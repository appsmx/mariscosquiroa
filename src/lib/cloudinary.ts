import { v2 as cloudinary } from "cloudinary";

/**
 * Configuración del SDK de Cloudinary (subida de imágenes del admin).
 *
 * Las credenciales viven en variables de entorno (nunca en el cliente):
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 *
 * Si no están configuradas, `isCloudinaryConfigured` es false y el endpoint
 * de subida responde 503 de forma controlada (el sitio sigue funcionando y
 * el admin puede seguir pegando una URL de imagen a mano).
 */
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Carpeta donde se guardan las imágenes de producto en Cloudinary. */
export const CLOUDINARY_PRODUCTS_FOLDER = "mariscosquiroa/productos";

export { cloudinary };
