// components/CoverCropModal.tsx
import { getCroppedImg } from "@/utils/cropImage";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const COVER_ASPECT = 4.5;

export default function CoverCropModal({
  imageSrc,
  onCancel,
  onCropComplete,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_: unknown, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      console.error("No cropped area pixels available");
      return;
    }
    const file = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden w-[90vw] max-w-3xl">
        <div className="relative w-full h-[400px] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={COVER_ASPECT}
            minZoom={1}
            maxZoom={3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="p-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={2}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-green-600 text-white"
          >
            Kırp ve Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
