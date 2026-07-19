export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");

  // Retina ekranlar için ekstra piksel yoğunluğu (max 2x ile sınırla, dosya çok büyümesin)
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = croppedAreaPixels.width * pixelRatio;
  canvas.height = croppedAreaPixels.height * pixelRatio;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("2D canvas context is not supported on this device");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(pixelRatio, pixelRatio);

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
      0.95,
    );
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
