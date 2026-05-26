import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, Camera, CameraOff, RefreshCw } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isMobile ? 'environment' : 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (!cancelled) setInitializing(false);
      } catch (err) {
        console.error('Camera error:', err);
        if (!cancelled) {
          setError(err.message || 'Gagal mengakses kamera');
          setInitializing(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (initializing || error) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    function scan() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          onScan(code.data);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(scan);
    }

    rafRef.current = requestAnimationFrame(scan);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initializing, error]);

  const handleClose = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button onClick={handleClose} className="btn-ghost p-1"><X className="h-5 w-5" /></button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CameraOff className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm text-red-600 font-medium mb-1">Kamera Tidak Tersedia</p>
            <p className="text-xs text-gray-400 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-primary btn-sm"><RefreshCw className="h-4 w-4" /> Coba Lagi</button>
              <button onClick={handleClose} className="btn-secondary btn-sm">Tutup</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative min-h-[250px] bg-black rounded-xl overflow-hidden">
              {initializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-white border-t-transparent mb-3"></div>
                  <p className="text-xs text-gray-300">Mengaktifkan kamera...</p>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Arahkan QR code ke kamera
            </p>
          </>
        )}
      </div>
    </div>
  );
}