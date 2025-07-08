import { useState } from "react";
import { uploadImageToPinata, uploadMetadataToPinata } from "../utils/pinata";

export function usePinata() {
  const [uploading, setUploading] = useState(false);

  const uploadNFTToPinata = async (
    file,
    name,
    description,
    attributes = []
  ) => {
    setUploading(true);

    try {
      // 1. Subir imagen
      const imageResult = await uploadImageToPinata(file);
      if (!imageResult.success) {
        throw new Error("Error uploading image: " + imageResult.error);
      }

      // 2. Crear metadata
      const metadata = {
        name,
        description,
        image: imageResult.url,
        attributes,
      };

      // 3. Subir metadata
      const metadataResult = await uploadMetadataToPinata(metadata);
      if (!metadataResult.success) {
        throw new Error("Error uploading metadata: " + metadataResult.error);
      }

      return {
        success: true,
        imageUrl: imageResult.url,
        metadataUrl: metadataResult.url,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadNFTToPinata,
    uploading,
  };
}
