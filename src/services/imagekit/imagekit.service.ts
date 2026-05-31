import { imagekit } from "../../config/imagekit.config";

export async function uploadToImageKit(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "/versions"
): Promise<{ url: string; fileId: string }> {
  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
    });
    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("ImageKit Upload Error:", err);
    throw new Error(`Failed to upload file to ImageKit: ${err.message}`);
  }
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("ImageKit Delete Error:", err);
  }
}
