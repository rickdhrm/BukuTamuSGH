import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";

interface SelfieStepProps {
  selfieImage: string | null;
  onSelfieCaptured: (base64Image: string) => void;
  onRetake: () => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error?: string;
}

export const SelfieStep: React.FC<SelfieStepProps> = ({
  selfieImage,
  onSelfieCaptured,
  onRetake,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const compressAndSetImage = async (file: File) => {
    try {
      setIsCompressing(true);
      const options = {
        maxSizeMB: 0.48, // Under 500KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSelfieCaptured(base64data);
        setIsCompressing(false);
      };
    } catch (err) {
      console.error("Compression error:", err);
      setIsCompressing(false);
    }
  };

  const capturePhoto = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          setIsCompressing(true);
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          await compressAndSetImage(file);
        } catch (err) {
          console.error("Error processing captured image:", err);
          onSelfieCaptured(imageSrc);
          setIsCompressing(false);
        }
      }
    }
  }, [webcamRef, onSelfieCaptured]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-xl font-bold text-white">Bagian 3: Verifikasi Keamanan</h2>
        <p className="text-xs text-slate-400">
          Ambil foto selfie langsung dari kamera perangkat Anda untuk verifikasi identitas gedung. Foto akan dikompresi otomatis (&lt; 500KB).
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        {selfieImage ? (
          /* Preview Mode */
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-xl bg-slate-900 aspect-[4/3] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selfieImage}
              alt="Selfie preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
              <span>✓ Foto Terverifikasi (&lt;500KB)</span>
            </div>
          </div>
        ) : (
          /* Live Camera Viewfinder ONLY */
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 aspect-[4/3] flex flex-col items-center justify-center">
            {cameraError ? (
              <div className="p-4 text-center space-y-2 text-red-300 text-xs">
                <span className="text-2xl block">📷🚫</span>
                <p>{cameraError}</p>
                <p className="text-slate-400 text-[11px]">
                  Buka pengaturan peramban Anda untuk mengizinkan akses kamera.
                </p>
              </div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                  width: { ideal: 800 },
                  height: { ideal: 600 },
                }}
                onUserMediaError={() =>
                  setCameraError("Tidak dapat mengakses kamera. Izin kamera diperlukan untuk mengambil selfie verifikasi.")
                }
                className="w-full h-full object-cover"
              />
            )}

            {isCompressing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Mengompresi Foto...</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls — Live Camera Only */}
        <div className="mt-4 flex justify-center w-full max-w-sm">
          {!selfieImage ? (
            <Button
              type="button"
              onClick={capturePhoto}
              isLoading={isCompressing}
              disabled={!!cameraError}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20"
            >
              📸 Ambil Foto Selfie Langsung
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onRetake}
              className="w-full"
            >
              🔄 Ambil Ulang Foto
            </Button>
          )}
        </div>
      </div>

      <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          ← Kembali
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={!selfieImage}
          isLoading={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
        >
          ✅ Submit &amp; Check-In
        </Button>
      </div>
    </div>
  );
};
