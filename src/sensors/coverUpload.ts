import * as ImageManipulator from "expo-image-manipulator";
import { apiFetch } from "../api/client";

export type CoverUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function reduceAndUploadCover(
  localUri: string,
): Promise<CoverUploadResult> {
  try {
    const processed = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1280 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    const imageResponse = await fetch(processed.uri);
    const bytes = await imageResponse.arrayBuffer();
    const response = await apiFetch("/api/imagenes", {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: bytes,
    });
    const uploaded = (await response.json()) as { url: string };
    return { ok: true, url: uploaded.url };
  } catch {
    return {
      ok: false,
      message: "No se pudo subir la portada. Se conservará localmente.",
    };
  }
}
