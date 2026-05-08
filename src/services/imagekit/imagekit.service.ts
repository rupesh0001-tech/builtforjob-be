import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export const uploadToImageKit = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "/versions"
) => {
  try {
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
    });
    return result;
  } catch (error: any) {
    console.error("ImageKit Upload Error:", error);
    throw new Error(`Failed to upload file to ImageKit: ${error.message}`);
  }
};

export const deleteFromImageKit = async (fileId: string) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error: any) {
    console.error("ImageKit Delete Error:", error);
    // We don't necessarily want to throw here if the file is already gone
  }
};
