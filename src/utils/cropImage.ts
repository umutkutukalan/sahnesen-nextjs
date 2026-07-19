// utils/cropImage.ts
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("2D canvas context is not supported on this device");
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.92,
    ); // kalite oranı
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
