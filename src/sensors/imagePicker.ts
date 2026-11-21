import * as ImagePicker from "expo-image-picker";

export type CoverPickerResult =
  | { ok: true; uri: string }
  | { ok: false; message: string };

export function deniedCoverMessage(granted: boolean): string {
  return granted
    ? ""
    : "Permiso denegado. Puedes continuar escribiendo los datos del libro o habilitar la galería en Ajustes.";
}

export async function pickCover(): Promise<CoverPickerResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  const deniedMessage = deniedCoverMessage(permission.granted);
  if (deniedMessage) {
    return { ok: false, message: deniedMessage };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled || result.assets.length === 0) {
    return {
      ok: false,
      message: "No se seleccionó una portada. Puedes continuar sin imagen.",
    };
  }

  return { ok: true, uri: result.assets[0].uri };
}
